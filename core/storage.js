import { CONFIG } from './config.js';
import { setRestoringData } from './appState.js';
import { reportSave } from './saveIndicator.js';
import { CURRENT_SCHEMA_VERSION, LEGACY_SCHEMA_VERSION, migrateData } from './migrations.js';

const KEYS = CONFIG.STORAGE_KEYS;
const NON_PERSISTED_FIELDS = ['speed', 'stressRange', 'vitalityRange', 'willpowerRange', 'masterVolume'];
const BACKUP_EXTRA_KEYS = [KEYS.ACTIVE_CONDITION, KEYS.RESOLVE_STATE];
const EXPORT_EXTRA_KEYS = [...BACKUP_EXTRA_KEYS, KEYS.THEME, KEYS.IMAGE];

let storageInitialized = false;

function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// JSON inválido nunca é descartado em silêncio: o texto bruto vai para "<chave>_corrupt".
function readJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn(`Dados inválidos no armazenamento (cópia guardada em ${key}_corrupt): ${key}`, error);
        try { localStorage.setItem(`${key}_corrupt`, raw); } catch { /* sem espaço: segue sem a cópia */ }
        return fallback;
    }
}

function readObject(key) {
    const value = readJSON(key, {});
    return isPlainObject(value) ? value : {};
}

function writeJSON(key, value) {
    try {
        const json = JSON.stringify(value);
        localStorage.setItem(key, json);
        if (localStorage.getItem(key) !== json) throw new Error('A leitura de conferência não bate com o que foi gravado.');
        return true;
    } catch (error) {
        console.error(`Não foi possível salvar [${key}]:`, error);
        return false;
    }
}

// Retorna null quando nada mudou (sem gravar), senão o resultado da gravação.
function writeIfChanged(key, value) {
    if (localStorage.getItem(key) === JSON.stringify(value)) return null;
    return writeJSON(key, value);
}

function saveAndReport(key, value, detail) {
    const result = writeIfChanged(key, value);
    if (result !== null) reportSave(result, detail);
}

function getStoredVersion() {
    return Number(localStorage.getItem(KEYS.SCHEMA_VERSION)) || LEGACY_SCHEMA_VERSION;
}

function buildSnapshot(sheet, lists, version, extraKeys) {
    const extra = {};
    extraKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) extra[key] = value;
    });

    return { version, savedAt: new Date().toISOString(), sheet, lists, extra };
}

function snapshotSize(snapshot) {
    const listItems = Object.values(snapshot.lists || {})
        .reduce((total, list) => total + (Array.isArray(list) ? list.length : 0), 0);
    return Object.keys(snapshot.sheet || {}).length + listItems;
}

// Backup rotativo: só é substituído por um estado igual ou mais completo, para que
// uma carga que falhou (e restaurou pouco) não apague o último estado bom.
function refreshLastBackup(sheet, lists) {
    const current = buildSnapshot(sheet, lists, getStoredVersion(), BACKUP_EXTRA_KEYS);
    if (snapshotSize(current) === 0) return;

    const previous = readJSON(KEYS.BACKUP_LAST, null);
    if (previous && snapshotSize(previous) > snapshotSize(current)) return;

    writeJSON(KEYS.BACKUP_LAST, current);
}

function applySnapshot(snapshot) {
    if (!snapshot || !isPlainObject(snapshot.sheet)) return false;

    // Impede o salvamento do pagehide de sobrescrever os dados recém-gravados.
    window.__lutherianResetInProgress = true;
    writeJSON(KEYS.SHEET_DATA, snapshot.sheet);
    writeJSON(KEYS.DYNAMIC_LISTS, isPlainObject(snapshot.lists) ? snapshot.lists : {});
    localStorage.setItem(KEYS.SCHEMA_VERSION, String(Number(snapshot.version) || LEGACY_SCHEMA_VERSION));

    Object.entries(isPlainObject(snapshot.extra) ? snapshot.extra : {}).forEach(([key, value]) => {
        if (typeof value !== 'string') return;
        try { localStorage.setItem(key, value); } catch (error) { console.error(`Não foi possível restaurar [${key}]:`, error); }
    });

    location.reload();
    return true;
}

// Recuperação manual via console: lutherian.restoreBackup('last' | 'preMigration')
function restoreBackup(slot = 'last') {
    const key = slot === 'preMigration' ? KEYS.BACKUP_PRE_MIGRATION : KEYS.BACKUP_LAST;
    const restored = applySnapshot(readJSON(key, null));
    if (!restored) console.warn(`Nenhum backup disponível em "${slot}".`);
    return restored;
}

// Transporte entre origens (localhost x 127.0.0.1, portas diferentes): copy(lutherian.exportData())
function exportData() {
    return JSON.stringify(buildSnapshot(
        readObject(KEYS.SHEET_DATA),
        readObject(KEYS.DYNAMIC_LISTS),
        getStoredVersion(),
        EXPORT_EXTRA_KEYS
    ));
}

function importData(json) {
    try {
        const restored = applySnapshot(typeof json === 'string' ? JSON.parse(json) : json);
        if (!restored) console.warn('Dados de importação inválidos.');
        return restored;
    } catch (error) {
        console.warn('Dados de importação inválidos.', error);
        return false;
    }
}

function migrateStoredData() {
    const storedVersion = getStoredVersion();
    const sheet = readObject(KEYS.SHEET_DATA);
    const lists = readObject(KEYS.DYNAMIC_LISTS);
    const isEmpty = !localStorage.getItem(KEYS.SHEET_DATA) && !localStorage.getItem(KEYS.DYNAMIC_LISTS);

    if (isEmpty) {
        localStorage.setItem(KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
        return { sheet, lists };
    }

    if (storedVersion > CURRENT_SCHEMA_VERSION) {
        console.warn(`Dados salvos na versão ${storedVersion}, mais nova que este código (${CURRENT_SCHEMA_VERSION}). Nada foi migrado.`);
        return { sheet, lists };
    }

    if (storedVersion < CURRENT_SCHEMA_VERSION) {
        writeJSON(KEYS.BACKUP_PRE_MIGRATION, buildSnapshot(
            structuredClone(sheet), structuredClone(lists), storedVersion, BACKUP_EXTRA_KEYS
        ));
        migrateData({ sheet, lists }, storedVersion);
        writeJSON(KEYS.SHEET_DATA, sheet);
        writeJSON(KEYS.DYNAMIC_LISTS, lists);
        localStorage.setItem(KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
        console.info(`Dados migrados da versão ${storedVersion} para ${CURRENT_SCHEMA_VERSION}.`);
    }

    return { sheet, lists };
}

export function initLocalStorage() {
    if (storageInitialized) return;
    storageInitialized = true;

    let isInitializing = true;

    window.lutherian = { exportData, importData, restoreBackup };

    document.addEventListener('input', (e) => {
        if (isInitializing) return;
        if (e.target.matches('input, select, textarea') && !e.target.closest('.dynamicList') && !e.target.closest('#inventoryItemsList')) {
            saveStaticData();
        }
    });

    document.addEventListener('change', (e) => {
        if (isInitializing) return;
        if (e.target.matches('input, select, textarea')) {
            saveStaticData();
        }
    });

    // Mescla no que já está salvo: chaves que o DOM atual não conhece (campo renomeado,
    // removido ou que falhou ao renderizar) são preservadas em vez de apagadas.
    function saveStaticData() {
        const data = readObject(KEYS.SHEET_DATA);

        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.closest('.dynamicList') || field.closest('#inventoryItemsList')) return;

            const identifier = field.id || field.name;
            if (!identifier) return;
            if (NON_PERSISTED_FIELDS.includes(identifier)) return;

            data[identifier] = field.type === 'checkbox' ? field.checked : field.value;
        });

        saveAndReport(KEYS.SHEET_DATA, data, 'ficha');
    }

    function saveAllDynamicLists() {
        if (isInitializing) return;

        const listsData = readObject(KEYS.DYNAMIC_LISTS);

        document.querySelectorAll('.dynamicList').forEach(container => {
            const containerId = container.id;
            if (!containerId) return;

            const rowsData = [];

            container.querySelectorAll('.stringItemRow, .cardItemBox, .inventoryItemCard').forEach(row => {
                const textInput = row.querySelector('input[type="text"]');
                const numberInputs = row.querySelectorAll('input[type="number"]');
                const textarea = row.querySelector('textarea');

                rowsData.push({
                    text: textInput ? textInput.value : "",
                    qty: numberInputs[0] ? numberInputs[0].value : "1",
                    weight: numberInputs[1] ? numberInputs[1].value : "0",
                    desc: textarea ? textarea.value : ""
                });
            });

            listsData[containerId] = rowsData;
        });

        saveAndReport(KEYS.DYNAMIC_LISTS, listsData, 'listas');
    }

    document.addEventListener('input', (e) => {
        if (e.target.closest('.dynamicList') || e.target.closest('#inventoryItemsList')) {
            saveAllDynamicLists();
        }
    });

    document.addEventListener('blur', (e) => {
        if (isInitializing) return;
        if (e.target.matches('input, select, textarea')) {
            saveStaticData();
        }
        if (e.target.closest('.dynamicList') || e.target.closest('#inventoryItemsList')) {
            saveAllDynamicLists();
        }
    }, true);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeItemBtn') || e.target.classList.contains('addItemBtn') || e.target.id === 'addInventoryItemBtn') {
            setTimeout(saveAllDynamicLists, 150);
        }
    });

    function buildListItem(containerId, container, itemData) {
        const itemDiv = document.createElement('div');
        const isInventory = containerId === 'inventoryItemsList';
        const isCard = container.classList.contains('cardList');

        if (isInventory) {
            itemDiv.className = 'inventoryItemCard cardItemBox';
            itemDiv.innerHTML = `
                <div class="inventoryItemTop">
                    <input type="text" placeholder="Nome do item..." class="item-name-input">
                    <label class="itemMetaLabel">Qtd:</label>
                    <input type="number" min="0" class="item-qty-input">
                    <label class="itemMetaLabel">Peso:</label>
                    <input type="number" min="0" step="0.5" class="item-weight-input">
                    <button type="button" class="removeItemBtn" title="Excluir" aria-label="Excluir item">X</button>
                </div>
                <textarea placeholder="Descrição do item..."></textarea>
            `;
        } else if (isCard) {
            itemDiv.className = 'cardItemBox';
            itemDiv.innerHTML = `
                <div class="cardItemTop">
                    <input type="text" placeholder="Nome / Título..." class="personal-input">
                    <button type="button" class="removeItemBtn" title="Remover" aria-label="Remover item">X</button>
                </div>
                <textarea placeholder="Descrição..."></textarea>
            `;
        } else {
            itemDiv.className = 'stringItemRow';
            itemDiv.innerHTML = `
                <input type="text" placeholder="Digite o nome..." class="personal-input">
                <button type="button" class="removeItemBtn" title="Remover" aria-label="Remover item">X</button>
            `;
        }

        const textInput = itemDiv.querySelector('input[type="text"]');
        const numberInputs = itemDiv.querySelectorAll('input[type="number"]');
        const textarea = itemDiv.querySelector('textarea');

        if (textInput) textInput.value = String(itemData?.text ?? '');
        if (numberInputs[0]) numberInputs[0].value = safeNumber(itemData?.qty, 1);
        if (numberInputs[1]) numberInputs[1].value = safeNumber(itemData?.weight, 0);
        if (textarea) textarea.value = String(itemData?.desc ?? '');

        return itemDiv;
    }

    function restoreLists(listsData) {
        Object.entries(listsData).forEach(([containerId, savedItems]) => {
            const container = document.getElementById(containerId);
            if (!container || !Array.isArray(savedItems)) return;

            container.replaceChildren();
            const maxItems = containerId === 'inventoryItemsList'
                ? CONFIG.LIMITS.MAX_INVENTORY_ITEMS
                : CONFIG.LIMITS.MAX_DYNAMIC_ITEMS;

            savedItems.slice(0, maxItems).forEach(itemData => {
                container.appendChild(buildListItem(containerId, container, itemData));
            });
        });
    }

    function restoreFields(data) {
        setRestoringData(true);
        try {
            Object.entries(data).forEach(([identifier, value]) => {
                if (NON_PERSISTED_FIELDS.includes(identifier)) return;

                const field = document.getElementById(identifier);
                if (!field) return;

                try {
                    if (field.type === 'checkbox') {
                        field.checked = Boolean(value);
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        field.value = String(value ?? '');
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } catch (error) {
                    console.error(`Falha ao restaurar o campo [${identifier}]:`, error);
                }
            });
        } finally {
            setRestoringData(false);
        }
    }

    function loadData() {
        try {
            const { sheet, lists } = migrateStoredData();
            refreshLastBackup(sheet, lists);
            restoreLists(lists);
            restoreFields(sheet);
            isInitializing = false;
            console.log('Dados estáticos e listas carregados.');
        } catch (error) {
            // Salvamento continua bloqueado: evita sobrescrever os dados a partir de uma restauração quebrada.
            console.error('Falha ao carregar os dados salvos. Nada será salvo nesta sessão; os dados originais foram preservados:', error);
        }
    }

    window.addEventListener('pagehide', () => {
        if (!isInitializing && !window.__lutherianResetInProgress) {
            saveStaticData();
            saveAllDynamicLists();
        }
    });

    loadData();
}
