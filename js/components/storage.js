export function initLocalStorage() {
    const STORAGE_KEY = 'lutherian_character_sheet_data';
    const DYNAMIC_LISTS_KEY = 'lutherian_dynamic_lists_data';

    let isInitializing = true;

    document.addEventListener('input', (e) => {
        if (isInitializing) return;
        if (e.target.matches('input, select, textarea')) {
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

            if (field.type === 'checkbox') {
                data[identifier] = field.checked;
            } else {
                data[identifier] = field.value;
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    window.saveAllDynamicLists = function() {
        if (isInitializing) return;
        
        const listsData = {};

        document.querySelectorAll('.dynamicList').forEach(container => {
            const containerId = container.id;
            if (!containerId) return;

            const rowsData = [];
            container.querySelectorAll('.stringItemRow, .cardItemBox, .inventoryItemCard').forEach(row => {
                const textInput = row.querySelector('input[type="text"], .personal-input, .item-name-input');
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
            window.saveAllDynamicLists();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeItemBtn') || e.target.classList.contains('addItemBtn') || e.target.id === 'addInventoryItemBtn') {
            setTimeout(window.saveAllDynamicLists, 150);
        }
    });

    function loadData() {
        const savedJSON = localStorage.getItem(STORAGE_KEY);
        const savedListsJSON = localStorage.getItem(DYNAMIC_LISTS_KEY);

        try {
            // 1. PRIMEIRO CARREGA RAÇA E ORIGEM (Para estruturar os selects e textos visuais)
            if (savedJSON) {
                const data = JSON.parse(savedJSON);

                if (data['race'] && typeof window.applyRaceFromStorage === 'function') {
                    window.applyRaceFromStorage(data['race']);
                }
                if (data['origin'] && typeof window.applyOriginFromStorage === 'function') {
                    window.applyOriginFromStorage(data['origin']);
                }

                // 2. DEPOIS CARREGA O RESTANTE DOS CAMPOS ESTÁTICOS
                Object.keys(data).forEach(identifier => {
                    if (identifier === 'race' || identifier === 'origin') return; // Já tratados acima

                    const field = document.getElementById(identifier) || document.querySelector(`[name="${identifier}"]`);
                    if (!field) return;

                    if (field.type === 'checkbox') {
                        field.checked = data[identifier];
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    } else if (field.tagName === 'SELECT') {
                        field.value = data[identifier];
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        field.value = data[identifier];
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }

            // 3. CARREGA LISTAS DINÂMICAS E ITENS
            // Carrega campos estáticos normais (exceto race e origin, que se autogerenciam)
            if (savedJSON) {
                const data = JSON.parse(savedJSON);
                Object.keys(data).forEach(identifier => {
                    if (identifier === 'race' || identifier === 'origin') return; 

                    const field = document.getElementById(identifier) || document.querySelector(`[name="${identifier}"]`);
                    if (!field) return;

                    if (field.type === 'checkbox') {
                        field.checked = data[identifier];
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    } else if (field.tagName === 'SELECT') {
                        field.value = data[identifier];
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        field.value = data[identifier];
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }

            console.log("Ficha totalmente carregada sem conflitos!");
        } catch (e) {
            console.error("Erro ao carregar dados:", e);
        } finally {
            setTimeout(() => {
                isInitializing = false;
            }, 300);
        }
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
}