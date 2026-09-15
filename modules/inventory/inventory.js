import { CONFIG } from '../../core/config.js';
import { registerInventoryOverloadChecker } from '../../core/appState.js';
import { updateAllAttributes } from '../attributes/attributes.js';
import { updateAllSkills } from '../attributes/skills.js';
import { playSound } from '../../core/audio.js';

export function initInventory() {
    const MAX_ITEMS = CONFIG.LIMITS.MAX_INVENTORY_ITEMS;

    const itemsContainer = document.getElementById("inventoryItemsList");
    const addBtn = document.getElementById("addInventoryItemBtn");
    const loadDisplay = document.getElementById("loadDisplay");
    const alertsBox = document.getElementById("encumbranceAlerts");

    const backpackCheck = document.getElementById("backpackCheck");
    const bigBackpackCheck = document.getElementById("bigBackpackCheck");
    const sizeSelect = document.getElementById("size");
    const speedBaseInput = document.getElementById("speedBase");
    const speedInput = document.getElementById("speed");
    const coinsInput = document.getElementById("coinsInput");
    let previousCoins = coinsInput?.value ?? '';

    function getSizeSpeed() {
        if (sizeSelect?.value === "pequeno") {
            return CONFIG.DEFAULTS.SPEED_SMALL;
        }

        if (sizeSelect?.value === "grande") {
            return CONFIG.DEFAULTS.SPEED_LARGE;
        }

        return CONFIG.DEFAULTS.SPEED_MEDIUM;
    }

    function calculateMaxCapacity() {
        const strengthInput = document.getElementById("strength");
        const tempStrengthInput = document.getElementById("temp_strength");

        const baseStrength = Number(strengthInput?.value) || 0;
        const temporaryStrength = Number(tempStrengthInput?.value) || 0;
        const backpackPenalty = bigBackpackCheck?.checked ? 1 : 0;

        const totalStrength =
            baseStrength + temporaryStrength - backpackPenalty;

        let maxSlots = totalStrength <= 0 ? 3 : totalStrength * 6;

        if (backpackCheck?.checked) {
            maxSlots += 10;
        }

        if (bigBackpackCheck?.checked) {
            maxSlots += 22;
        }

        return maxSlots;
    }

    function calculateCurrentLoad() {
        if (!itemsContainer) {
            return 0;
        }

        let currentLoad = 0;

        itemsContainer
            .querySelectorAll(".inventoryItemCard")
            .forEach(card => {
                const quantity =
                    Number(card.querySelector(".item-qty-input")?.value) || 0;

                const weight =
                    Number(card.querySelector(".item-weight-input")?.value) || 0;

                currentLoad += quantity * weight;
            });

        return currentLoad;
    }

    function updateInventoryStatus() {
        const currentLoad = calculateCurrentLoad();
        const maxCapacity = calculateMaxCapacity();

        if (loadDisplay) {
            loadDisplay.textContent = `${currentLoad} / ${maxCapacity}`;
        }

        const isOverloaded = currentLoad > maxCapacity;
        const isExcessive =
            maxCapacity > 0 && currentLoad >= maxCapacity * 2;

        const baseSpeed = getSizeSpeed();

        if (speedInput) {
            const speedBase = Number(speedBaseInput?.value);
            const effectiveBaseSpeed = Number.isFinite(speedBase)
                ? Math.max(0, speedBase)
                : baseSpeed;

            if (isExcessive) {
                speedInput.value = 0;
            } else if (isOverloaded) {
                speedInput.value = Math.max(0, effectiveBaseSpeed - 2);
            } else {
                speedInput.value = effectiveBaseSpeed;
            }
        }

        updateAllAttributes();
        updateAllSkills();

        if (!alertsBox) {
            return;
        }

        const alerts = [];

        if (bigBackpackCheck?.checked) {
            alerts.push("🎒 MOCHILA GRANDE: Penalidade ativa de -1 em Força.");
        }

        if (isOverloaded && !isExcessive) {
            alerts.push(
                "⚠️ SOBRECARGA: -2 qds de deslocamento e Desvantagem em Força e Destreza."
            );
        }

        if (isExcessive) {
            alerts.push(
                "❌ CARGA EXCESSIVA (Dobro do limite): Deslocamento reduzido a 0 e Incapaz de realizar ações!"
            );
        }

        alertsBox.textContent = alerts.join("\n");
        alertsBox.style.whiteSpace = "pre-line";
        alertsBox.style.display = alerts.length > 0 ? "block" : "none";
    }

    function addInventoryItem() {
        if (!itemsContainer) {
            return;
        }

        if (itemsContainer.children.length >= MAX_ITEMS) {
            playSound('clickInvalid');
            alert("Limite máximo de itens atingido.");
            return;
        }

        const card = document.createElement("div");
        card.className = "inventoryItemCard cardItemBox";

        card.innerHTML = `
            <div class="inventoryItemTop">
                <input
                    type="text"
                    placeholder="Nome do item..."
                    class="item-name-input"
                >

                    <label class="itemMetaLabel">
                    Qtd:
                </label>

                <input
                    type="number"
                    value="1"
                    min="0"
                    class="item-qty-input"
                >

                    <label class="itemMetaLabel">
                    Peso:
                </label>

                <input
                    type="number"
                    value="0"
                    min="0"
                    step="0.5"
                    class="item-weight-input"
                >

                <button
                    type="button"
                    class="removeItemBtn"
                    title="Excluir"
                    aria-label="Excluir item"
                >
                    X
                </button>
            </div>

            <textarea placeholder="Descrição do item..."></textarea>
        `;

        itemsContainer.appendChild(card);
        updateInventoryStatus();
    }

    // Eventos delegados: funcionam também para itens restaurados do localStorage.
    if (itemsContainer) {
        itemsContainer.addEventListener("input", event => {
            if (
                event.target.matches(
                    ".item-qty-input, .item-weight-input"
                )
            ) {
                updateInventoryStatus();
            }
        });

        itemsContainer.addEventListener("click", event => {
            const removeButton = event.target.closest(".removeItemBtn");

            if (!removeButton) {
                return;
            }

            removeButton.closest(".inventoryItemCard")?.remove();
            updateInventoryStatus();
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", addInventoryItem);
    }

    [backpackCheck, bigBackpackCheck].forEach(element => {
        element?.addEventListener("change", () => {
            playSound('backpacks');
            updateInventoryStatus();
        });
    });

    coinsInput?.addEventListener('input', () => {
        if (coinsInput.value !== previousCoins) playSound('coinsChange');
        previousCoins = coinsInput.value;
    });

    sizeSelect?.addEventListener("change", () => {
        if (speedBaseInput) speedBaseInput.value = getSizeSpeed();
        updateInventoryStatus();
    });

    speedBaseInput?.addEventListener("input", updateInventoryStatus);

    document.addEventListener("input", event => {
        if (
            event.target?.id === "strength" ||
            event.target?.id === "temp_strength"
        ) {
            updateInventoryStatus();
        }
    });

    registerInventoryOverloadChecker(() => {
        return calculateCurrentLoad() > calculateMaxCapacity();
    });

    updateInventoryStatus();
}