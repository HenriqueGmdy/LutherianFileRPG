import { CONFIG } from './config.js';
import { setRestoringData } from './appState.js';
import { reportSave } from './saveIndicator.js';
import { createListItem, getListItemType } from './listItems.js';
import { CURRENT_SCHEMA_VERSION, LEGACY_SCHEMA_VERSION, migrateData } from './migrations.js';

const KEYS = CONFIG.STORAGE_KEYS;
// Campos que existem na página mas não pertencem à ficha: calculados, preferências do usuário
// (volume, cores do tema) e o seletor de arquivo da imagem.
const NON_PERSISTED_FIELDS = [
    'speed', 'stressRange', 'vitalityRange', 'willpowerRange',
    'masterVolume', 'charImageInput',
    'colorBgMain', 'colorBgFieldset', 'colorBgInputs', 'colorText', 'colorAccent',
    'colorNegative', 'colorPositive', 'colorLines', 'colorAfflictionText', 'colorVirtueText'
];
const BACKUP_EXTRA_KEYS = [KEYS.ACTIVE_CONDITION, KEYS.RESOLVE_STATE];
const EXPORT_EXTRA_KEYS = [...BACKUP_EXTRA_KEYS, KEYS.THEME, KEYS.IMAGE];
const IMPORT_BACKUP_KEYS = [KEYS.ACTIVE_CONDITION, KEYS.RESOLVE_STATE, KEYS.IMAGE];
const RESTORABLE_KEYS = new Set([...EXPORT_EXTRA_KEYS, ...IMPORT_BACKUP_KEYS]);

// Arquivo de ficha (.json): nomes lógicos, independentes das chaves do localStorage.
const SHEET_FILE_APP = 'lutherian-sheet';
const SHEET_FILE_FORMAT = 1;
const MAX_IMAGE_LENGTH = 8 * 1024 * 1024;
const CONDITION_TYPES = ['afflicted', 'virtuous'];
const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];

let storageInitialized = false;

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

    return { version, savedAt: new Date().toISOString(), sheet, lists, extra, scope: extraKeys };
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

    const extra = isPlainObject(snapshot.extra) ? snapshot.extra : {};

    // Chaves que o backup cobria e que não estavam presentes (ex.: ficha sem imagem) são removidas.
    if (Array.isArray(snapshot.scope)) {
        snapshot.scope.forEach(key => {
            if (RESTORABLE_KEYS.has(key) && !(key in extra)) localStorage.removeItem(key);
        });
    }

    Object.entries(extra).forEach(([key, value]) => {
        if (typeof value !== 'string' || !RESTORABLE_KEYS.has(key)) return;
        try { localStorage.setItem(key, value); } catch (error) { console.error(`Não foi possível restaurar [${key}]:`, error); }
    });

    location.reload();
    return true;
}

// Recuperação manual via console: lutherian.restoreBackup('last' | 'preMigration' | 'preImport')
function restoreBackup(slot = 'last') {
    const key = { preMigration: KEYS.BACKUP_PRE_MIGRATION, preImport: KEYS.BACKUP_PRE_IMPORT }[slot] ?? KEYS.BACKUP_LAST;
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

// ---------- Arquivo de ficha (exportar / importar) ----------

export function createSheetFile() {
    const sheet = Object.fromEntries(
        Object.entries(readObject(KEYS.SHEET_DATA)).filter(([key]) => !NON_PERSISTED_FIELDS.includes(key))
    );
    const extra = {};

    const image = localStorage.getItem(KEYS.IMAGE);
    if (image) extra.image = image;

    const condition = readJSON(KEYS.ACTIVE_CONDITION, null);
    if (isPlainObject(condition)) extra.condition = condition;

    const resolve = localStorage.getItem(KEYS.RESOLVE_STATE);
    if (resolve) extra.resolve = resolve;

    return {
        app: SHEET_FILE_APP,
        format: SHEET_FILE_FORMAT,
        schemaVersion: getStoredVersion(),
        exportedAt: new Date().toISOString(),
        character: { name: String(sheet.name ?? ''), class: String(sheet.characterClass ?? '') },
        sheet,
        lists: readObject(KEYS.DYNAMIC_LISTS),
        extra
    };
}

// Valida e higieniza um arquivo de ficha (conteúdo não confiável). Retorna { ok, data } ou { ok: false, error }.
export function parseSheetFile(raw) {
    const fail = error => ({ ok: false, error });

    if (!isPlainObject(raw) || raw.app !== SHEET_FILE_APP) return fail('Este arquivo não é uma ficha do Lutherian.');
    if (!Number.isInteger(raw.format) || raw.format < 1 || raw.format > SHEET_FILE_FORMAT) {
        return fail('O formato deste arquivo é de uma versão mais nova da ficha. Atualize a ficha para importá-lo.');
    }

    const schemaVersion = raw.schemaVersion;
    if (!Number.isInteger(schemaVersion) || schemaVersion < LEGACY_SCHEMA_VERSION) return fail('O arquivo não informa uma versão de dados válida.');
    if (schemaVersion > CURRENT_SCHEMA_VERSION) return fail('Este arquivo foi gerado por uma versão mais nova da ficha. Atualize a ficha para importá-lo.');
    if (!isPlainObject(raw.sheet)) return fail('O arquivo não contém os dados da ficha.');

    const sheet = {};
    Object.entries(raw.sheet).forEach(([key, value]) => {
        if (UNSAFE_KEYS.includes(key) || NON_PERSISTED_FIELDS.includes(key)) return;
        if (['string', 'boolean', 'number'].includes(typeof value)) sheet[key] = value;
    });

    const maxItems = Math.max(CONFIG.LIMITS.MAX_DYNAMIC_ITEMS, CONFIG.LIMITS.MAX_INVENTORY_ITEMS);
    const lists = {};
    Object.entries(isPlainObject(raw.lists) ? raw.lists : {}).forEach(([listId, items]) => {
        if (UNSAFE_KEYS.includes(listId) || !Array.isArray(items)) return;
        lists[listId] = items.slice(0, maxItems).filter(isPlainObject).map(item => ({
            text: String(item.text ?? ''),
            qty: String(item.qty ?? '1'),
            weight: String(item.weight ?? '0'),
            desc: String(item.desc ?? '')
        }));
    });

    const extra = {};
    const rawExtra = isPlainObject(raw.extra) ? raw.extra : {};

    if (typeof rawExtra.image === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/.test(rawExtra.image) && rawExtra.image.length <= MAX_IMAGE_LENGTH) {
        extra.image = rawExtra.image;
    }
    if (isPlainObject(rawExtra.condition) && typeof rawExtra.condition.name === 'string'
        && typeof rawExtra.condition.desc === 'string' && CONDITION_TYPES.includes(rawExtra.condition.type)) {
        extra.condition = { name: rawExtra.condition.name, desc: rawExtra.condition.desc, type: rawExtra.condition.type };
    }
    if (CONDITION_TYPES.includes(rawExtra.resolve)) extra.resolve = rawExtra.resolve;

    const character = isPlainObject(raw.character) ? raw.character : {};
    return {
        ok: true,
        data: {
            schemaVersion,
            exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
            character: { name: String(character.name ?? sheet.name ?? ''), class: String(character.class ?? sheet.characterClass ?? '') },
            sheet,
            lists,
            extra
        }
    };
}

// Substitui a ficha atual pelo conteúdo do arquivo (já validado). Guarda backup e desfaz tudo se algo falhar.
export function applySheetFile(data) {
    const previous = {
        [KEYS.SHEET_DATA]: localStorage.getItem(KEYS.SHEET_DATA),
        [KEYS.DYNAMIC_LISTS]: localStorage.getItem(KEYS.DYNAMIC_LISTS),
        [KEYS.SCHEMA_VERSION]: localStorage.getItem(KEYS.SCHEMA_VERSION),
        ...Object.fromEntries(IMPORT_BACKUP_KEYS.map(key => [key, localStorage.getItem(key)]))
    };

    const backup = buildSnapshot(readObject(KEYS.SHEET_DATA), readObject(KEYS.DYNAMIC_LISTS), getStoredVersion(), IMPORT_BACKUP_KEYS);
    if (!writeJSON(KEYS.BACKUP_PRE_IMPORT, backup)) {
        return { ok: false, error: 'Não foi possível guardar o backup da ficha atual (armazenamento cheio?). Nada foi alterado.' };
    }

    const rollback = () => {
        Object.entries(previous).forEach(([key, value]) => {
            try {
                if (value === null) localStorage.removeItem(key);
                else localStorage.setItem(key, value);
            } catch (error) {
                console.error(`Falha ao desfazer a importação em [${key}]:`, error);
            }
        });
    };

    try {
        // Impede o salvamento do pagehide de sobrescrever os dados recém-gravados.
        window.__lutherianResetInProgress = true;

        if (!writeJSON(KEYS.SHEET_DATA, data.sheet) || !writeJSON(KEYS.DYNAMIC_LISTS, data.lists)) {
            throw new Error('Falha ao gravar a ficha importada.');
        }
        localStorage.setItem(KEYS.SCHEMA_VERSION, String(data.schemaVersion));

        IMPORT_BACKUP_KEYS.forEach(key => localStorage.removeItem(key));
        if (data.extra.image) localStorage.setItem(KEYS.IMAGE, data.extra.image);
        if (data.extra.condition) localStorage.setItem(KEYS.ACTIVE_CONDITION, JSON.stringify(data.extra.condition));
        if (data.extra.resolve) localStorage.setItem(KEYS.RESOLVE_STATE, data.extra.resolve);
    } catch (error) {
        console.error('Importação cancelada:', error);
        rollback();
        window.__lutherianResetInProgress = false;
        return { ok: false, error: 'Não foi possível gravar a ficha importada (armazenamento cheio?). Nada foi alterado.' };
    }

    location.reload();
    return { ok: true };
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
        if (e.target.closest('.removeItemBtn, .addItemBtn, #addInventoryItemBtn')) {
            setTimeout(saveAllDynamicLists, 150);
        }
    });

    function restoreLists(listsData) {
        Object.entries(listsData).forEach(([containerId, savedItems]) => {
            const container = document.getElementById(containerId);
            if (!container || !Array.isArray(savedItems)) return;

            container.replaceChildren();
            const maxItems = containerId === 'inventoryItemsList'
                ? CONFIG.LIMITS.MAX_INVENTORY_ITEMS
                : CONFIG.LIMITS.MAX_DYNAMIC_ITEMS;

            savedItems.slice(0, maxItems).forEach(itemData => {
                container.appendChild(createListItem(getListItemType(container), itemData));
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
