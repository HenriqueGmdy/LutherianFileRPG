export function initLocalStorage() {
    const STORAGE_KEY = 'lutherian_character_sheet_data';
    const DYNAMIC_LISTS_KEY = 'lutherian_dynamic_lists_data';

    let isInitializing = true;

    // 1. Salvar campos estáticos normais
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

            if (field.type === 'checkbox') {
                data[identifier] = field.checked;
            } else {
                data[identifier] = field.value;
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // 2. Salvar todas as listas dinâmicas e o inventário (Com captura universal de nome/texto)
    window.saveAllDynamicLists = function() {
        if (isInitializing) return;
        
        const listsData = {};

        document.querySelectorAll('.dynamicList').forEach(container => {
            const containerId = container.id;
            if (!containerId) return;

            const rowsData = [];

            container.querySelectorAll('.stringItemRow, .cardItemBox, .inventoryItemCard').forEach(row => {
                // Captura universal do texto/nome em qualquer tipo de input de texto do card
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
            window.saveAllDynamicLists();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeItemBtn') || e.target.classList.contains('addItemBtn') || e.target.id === 'addInventoryItemBtn') {
            setTimeout(window.saveAllDynamicLists, 150);
        }
    });

    // 3. Carregar e reconstruir os dados ao iniciar
    function loadData() {
        const savedJSON = localStorage.getItem(STORAGE_KEY);
        const savedListsJSON = localStorage.getItem(DYNAMIC_LISTS_KEY);

        try {
            if (savedListsJSON) {
                const listsData = JSON.parse(savedListsJSON);
                
                Object.keys(listsData).forEach(containerId => {
                    const container = document.getElementById(containerId);
                    if (!container) return;

                    container.innerHTML = "";
                    const items = listsData[containerId];

                    items.forEach(itemData => {
                        const itemDiv = document.createElement("div");
                        // Garante que o texto recuperado não venha como undefined
                        const safeText = itemData.text !== undefined && itemData.text !== null ? itemData.text : "";
                        const safeDesc = itemData.desc !== undefined && itemData.desc !== null ? itemData.desc : "";

                        if (containerId === "inventoryItemsList") {
                            itemDiv.className = "inventoryItemCard cardItemBox";
                            itemDiv.innerHTML = `
                                <div class="inventoryItemTop">
                                    <input type="text" placeholder="Nome do item..." class="item-name-input" value="${safeText}">
                                    <label style="font-size:0.75rem; color:#aaa;">Qtd:</label>
                                    <input type="number" value="${itemData.qty || 1}" min="0" class="item-qty-input">
                                    <label style="font-size:0.75rem; color:#aaa;">Peso:</label>
                                    <input type="number" value="${itemData.weight || 0}" min="0" step="0.5" class="item-weight-input">
                                    <button type="button" class="removeItemBtn" title="Excluir">X</button>
                                </div>
                                <textarea placeholder="Descrição do item...">${safeDesc}</textarea>
                            `;
                        } else {
                            const isCard = container.classList.contains("cardList");

                            if (isCard) {
                                itemDiv.className = "cardItemBox";
                                itemDiv.innerHTML = `
                                    <div class="cardItemTop">
                                        <input type="text" placeholder="Nome / Título..." class="personal-input" value="${safeText}">
                                        <button type="button" class="removeItemBtn" title="Remover">X</button>
                                    </div>
                                    <textarea placeholder="Descrição...">${safeDesc}</textarea>
                                `;
                            } else {
                                itemDiv.className = "stringItemRow";
                                itemDiv.innerHTML = `
                                    <input type="text" placeholder="Digite o nome..." class="personal-input" value="${safeText}">
                                    <button type="button" class="removeItemBtn" title="Remover">X</button>
                                `;
                            }
                        }

                        const removeBtn = itemDiv.querySelector(".removeItemBtn");
                        if (removeBtn) {
                            removeBtn.addEventListener("click", () => {
                                itemDiv.remove();
                                window.saveAllDynamicLists();
                            });
                        }

                        // Garante que qualquer alteração nos campos recriados volte a salvar imediatamente
                        itemDiv.querySelectorAll("input, textarea").forEach(input => {
                            input.addEventListener("input", () => window.saveAllDynamicLists());
                        });

                        container.appendChild(itemDiv);
                    });
                });
            }

            if (savedJSON) {
                const data = JSON.parse(savedJSON);
                Object.keys(data).forEach(identifier => {
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

            console.log("Ficha totalmente restaurada sem erros de nome!");
        } catch (e) {
            console.error("Erro ao carregar dados do storage:", e);
        } finally {
            // Garante que o inventário recalcule a carga atual com os itens recriados
            if (typeof window.updateInventoryStatusGlobal === 'function') {
                window.updateInventoryStatusGlobal();
            }

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