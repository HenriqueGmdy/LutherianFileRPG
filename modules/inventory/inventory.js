import { updateAllAttributes } from '../attributes/attributes.js';
import { updateAllSkills } from '../attributes/skills.js';

export function initInventory() {
    const MAX_ITEMS = 50;
    const itemsContainer = document.getElementById("inventoryItemsList");
    const addBtn = document.getElementById("addInventoryItemBtn");
    const loadDisplay = document.getElementById("loadDisplay");
    const alertsBox = document.getElementById("encumbranceAlerts");
    
    const backpackCheck = document.getElementById("backpackCheck");
    const bigBackpackCheck = document.getElementById("bigBackpackCheck");
    const sizeSelect = document.getElementById("size");

    // Função para calcular a capacidade máxima e gerenciar o custo de Força da Mochila Grande
    function calculateMaxCapacity() {
        const strengthInput = document.getElementById("strength");
        const tempStrengthInput = document.getElementById("temp_strength");

        let baseStr = parseInt(strengthInput?.value) || 0;
        let tempStr = parseInt(tempStrengthInput?.value) || 0;
        
        // Se a mochila grande estiver ativa, aplica o -1 de penalidade na Força total para o cálculo
        let strengthPenalty = (bigBackpackCheck && bigBackpackCheck.checked) ? 1 : 0;
        let totalStr = (baseStr + tempStr) - strengthPenalty;

        let maxSlots = totalStr <= 0 ? 3 : totalStr * 6;

        if (backpackCheck && backpackCheck.checked) maxSlots += 10;
        if (bigBackpackCheck && bigBackpackCheck.checked) maxSlots += 22;

        return maxSlots;
    }

    function calculateCurrentLoad() {
        let currentLoad = 0;
        if (!itemsContainer) return currentLoad;
        const itemCards = itemsContainer.querySelectorAll(".inventoryItemCard");

        itemCards.forEach(card => {
            const qtyInput = card.querySelector(".item-qty-input");
            const weightInput = card.querySelector(".item-weight-input");
            const qty = parseFloat(qtyInput?.value) || 0;
            const weight = parseFloat(weightInput?.value) || 0;
            currentLoad += qty * weight;
        });

        return currentLoad;
    }

    // Expõe globalmente se o inventário está sobrecarregado
    window.isCharacterOverloaded = function() {
        const current = calculateCurrentLoad();
        const max = calculateMaxCapacity();
        return current > max;
    };

    function updateInventoryStatus() {
        const current = calculateCurrentLoad();
        const max = calculateMaxCapacity();

        if (loadDisplay) {
            loadDisplay.textContent = `${current} / ${max}`;
        }

        const isOverloaded = current > max;
        const isExcessive = current >= max * 2 && max > 0;

        // Define o deslocamento base de acordo com o tamanho escolhido (Pequeno: 5, Médio: 6, Grande: 7)
        let baseSpeed = 6; // Padrão Médio
        if (sizeSelect) {
            if (sizeSelect.value === "pequeno") baseSpeed = 5;
            else if (sizeSelect.value === "grande") baseSpeed = 7;
            else baseSpeed = 6; // "medio"
        }

        const speedInput = document.getElementById("speed");
        if (speedInput) {
            if (isExcessive) speedInput.value = 0;
            else if (isOverloaded) speedInput.value = Math.max(0, baseSpeed - 2);
            else speedInput.value = baseSpeed;
        }

        // Força a atualização visual dos atributos e perícias
        updateAllAttributes();
        updateAllSkills();

        if (alertsBox) {
            let alerts = [];
            if (bigBackpackCheck && bigBackpackCheck.checked) {
                alerts.push("🎒 MOCHILA GRANDE: Penalidade ativa de -1 em Força.");
            }
            if (isOverloaded && !isExcessive) {
                alerts.push("⚠️ SOBRECARGA: -2 qds de deslocamento e Desvantagem em Força e Destreza.");
            }
            if (isExcessive) {
                alerts.push("❌ CARGA EXCESSIVA (Dobro do limite): Deslocamento reduzido a 0 e Incapaz de realizar ações!");
            }

            if (alerts.length > 0) {
                alertsBox.innerHTML = alerts.join("<br>");
                alertsBox.style.display = "block";
            } else {
                alertsBox.style.display = "none";
            }
        }
    }

    // Expõe globalmente para o storage acionar logo após recarregar os dados no F5
    window.updateInventoryStatusGlobal = function() {
        updateInventoryStatus();
    };

    function addInventoryItem() {
        if (itemsContainer.children.length >= MAX_ITEMS) {
            alert("Limite máximo de itens atingido.");
            return;
        }

        const card = document.createElement("div");
        card.className = "inventoryItemCard cardItemBox";
        card.innerHTML = `
            <div class="inventoryItemTop">
                <input type="text" placeholder="Nome do item..." class="item-name-input">
                <label style="font-size:0.75rem; color:#aaa;">Qtd:</label>
                <input type="number" value="1" min="0" class="item-qty-input">
                <label style="font-size:0.75rem; color:#aaa;">Peso:</label>
                <input type="number" value="0" min="0" step="0.5" class="item-weight-input">
                <button type="button" class="removeItemBtn" title="Excluir">X</button>
            </div>
            <textarea placeholder="Descrição do item..."></textarea>
        `;

        card.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", updateInventoryStatus);
        });

        card.querySelector(".removeItemBtn").addEventListener("click", () => {
            card.remove();
            updateInventoryStatus();
        });

        itemsContainer.appendChild(card);
        updateInventoryStatus();
    }

    if (addBtn) {
        addBtn.addEventListener("click", addInventoryItem);
    }

    // Ouvintes de mudanças nas opções de mochilas e tamanho
    [backpackCheck, bigBackpackCheck, sizeSelect].forEach(element => {
        if (element) element.addEventListener("change", updateInventoryStatus);
    });

    document.addEventListener("input", (e) => {
        if (e.target && (e.target.id === "strength" || e.target.id === "temp_strength")) {
            updateInventoryStatus();
        }
    });

    updateInventoryStatus();
} 