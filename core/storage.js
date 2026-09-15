import { CONFIG } from './config.js';

let storageInitialized = false;

function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn(`Dados inválidos ignorados no armazenamento: ${key}`, error);
        return fallback;
    }
}

export function initLocalStorage() {
    if (storageInitialized) return;
    storageInitialized = true;

    const STORAGE_KEY = CONFIG.STORAGE_KEYS.SHEET_DATA;
    const DYNAMIC_LISTS_KEY = CONFIG.STORAGE_KEYS.DYNAMIC_LISTS;

    let isInitializing = true;

    document.addEventListener('input', (e) => {
        if (isInitializing) return;
        if (e.target.matches('input, select, textarea') && !e.target.closest('.dynamicList') && !e.target.closest('#inventoryItemsList')) {
            saveStaticData();
        }
    });

    document.addEventListener('change', (e) => {
        if (isInitializing) return;
        if (e.target.matches('input[type="checkbox"], input[type="range"], select')) {
            saveStaticData();
        }
    });

    function saveStaticData() {
        const data = {};
        const fields = document.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            if (field.closest('.dynamicList') || field.closest('#inventoryItemsList')) return;

            const identifier = field.id || field.name;
            if (!identifier) return;
            if (['speed', 'stressRange', 'vitalityRange', 'willpowerRange'].includes(identifier)) return;

            if (field.type === 'checkbox') {
                data[identifier] = field.checked;
            } else {
                data[identifier] = field.value;
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function saveAllDynamicLists() {
        if (isInitializing) return;
        
        const listsData = {};

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

        localStorage.setItem(DYNAMIC_LISTS_KEY, JSON.stringify(listsData));
    };

    document.addEventListener('input', (e) => {
        if (e.target.closest('.dynamicList') || e.target.closest('#inventoryItemsList')) {
            saveAllDynamicLists();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeItemBtn') || e.target.classList.contains('addItemBtn') || e.target.id === 'addInventoryItemBtn') {
            setTimeout(saveAllDynamicLists, 150);
        }
    });

    function loadData() {
        const savedData = readJSON(STORAGE_KEY, {});
        const savedLists = readJSON(DYNAMIC_LISTS_KEY, {});
        const data = savedData && typeof savedData === 'object' && !Array.isArray(savedData)
            ? savedData
            : {};
        const listsData = savedLists && typeof savedLists === 'object' && !Array.isArray(savedLists)
            ? savedLists
            : {};

        Object.entries(listsData).forEach(([containerId, savedItems]) => {
            const container = document.getElementById(containerId);
            if (!container || !Array.isArray(savedItems)) return;

            container.replaceChildren();
            const maxItems = containerId === 'inventoryItemsList'
                ? CONFIG.LIMITS.MAX_INVENTORY_ITEMS
                : CONFIG.LIMITS.MAX_DYNAMIC_ITEMS;

            savedItems.slice(0, maxItems).forEach(itemData => {
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

                container.appendChild(itemDiv);
            });
        });

        Object.entries(data).forEach(([identifier, value]) => {
            if (['speed', 'stressRange', 'vitalityRange', 'willpowerRange'].includes(identifier)) return;

            const normalizedIdentifier = identifier === 'chaClass'
                ? 'characterClass'
                : identifier;
            const field = document.getElementById(normalizedIdentifier);
            if (!field) return;

            if (field.type === 'checkbox') {
                field.checked = Boolean(value);
                field.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                field.value = String(value ?? '');
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        isInitializing = false;
        console.log('Dados estáticos e listas carregados.');
    }

    loadData();
}