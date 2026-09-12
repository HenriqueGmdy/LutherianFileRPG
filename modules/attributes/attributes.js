export const attributeGroups = [
    {
        attrCondition: { id: "weakened", name: "Enfraquecido" },
        attributes: [
            { id: "strength", name: "Força" },
            { id: "dexterity", name: "Destreza" }
        ]
    },
    {
        attrCondition: { id: "unwell", name: "Indisposto" },
        attributes: [
            { id: "constitution", name: "Constituição" },
            { id: "charisma", name: "Carisma" }
        ]
    },
    {
        attrCondition: { id: "miserable", name: "Miserável" },
        attributes: [
            { id: "psyche", name: "Psique" },
            { id: "wisdom", name: "Sabedoria" }
        ]
    }
];

import { updateInitiative } from '../status/status.js';
import { updateAllSkills } from './skills.js';

export function renderAttributes() {
    const container = document.getElementById("attributesContainer");
    if (!container) return;

    // Limpa o container antes de renderizar para evitar duplicações
    container.innerHTML = "";

    attributeGroups.forEach(group => {
        const attr1 = group.attributes[0];
        const attr2 = group.attributes[1];
        const cond = group.attrCondition;

        container.innerHTML += `
            <div class="attributeGroup">
                <!-- Atributo 1 -->
                <div class="attributeRow">
                    <div class="attribute-left">
                        <label for="${attr1.id}">${attr1.name}:</label>
                        <input type="number" id="${attr1.id}" min="-3" max="3" value="0" class="attr-input">
                    </div>
                    <div class="attribute-right">
                        <label for="temp_${attr1.id}">Mod. temporário:</label>
                        <input type="number" id="temp_${attr1.id}" min="-2" max="2" value="0" class="attr-input">
                        <span id="dices_${attr1.id}" class="diceToRoll">d20</span>
                    </div>
                </div>

                <!-- Atributo 2 -->
                <div class="attributeRow">
                    <div class="attribute-left">
                        <label for="${attr2.id}">${attr2.name}:</label>
                        <input type="number" id="${attr2.id}" min="-3" max="3" value="0" class="attr-input">
                    </div>
                    <div class="attribute-right">
                        <label for="temp_${attr2.id}">Mod. temporário:</label>
                        <input type="number" id="temp_${attr2.id}" min="-2" max="2" value="0" class="attr-input">
                        <span id="dices_${attr2.id}" class="diceToRoll">d20</span>
                    </div>
                </div>

                <!-- Condição -->
                <div class="conditionBox">
                    <input type="checkbox" id="${cond.id}" class="conditionCheckbox">
                    <label for="${cond.id}"><strong>${cond.name}</strong></label>
                </div>
            </div>
        `;
    });
}

export function updateAttributeDice(attrId) {
    const baseInput = document.getElementById(attrId);
    const tempInput = document.getElementById(`temp_${attrId}`);
    const diceSpan = document.getElementById(`dices_${attrId}`);

    if (baseInput && tempInput && diceSpan) {
        let baseVal = parseInt(baseInput.value) || 0;
        let tempVal = parseInt(tempInput.value) || 0;
        let total = baseVal + tempVal;

        // Soma as penalidades ativas
        let penalty = 0;
        const isOverloaded = typeof window.isCharacterOverloaded === 'function' && window.isCharacterOverloaded();
        const bigBackpackActive = document.getElementById("bigBackpackCheck")?.checked || false;

        // Sobrecarga aplica penalidade de -1 em Força e Destreza
        if (isOverloaded && (attrId === "strength" || attrId === "dexterity")) {
            penalty += 1;
        }

        // Mochila grande aplica penalidade permanente de -1 apenas em Força
        if (bigBackpackActive && attrId === "strength") {
            penalty += 1;
        }

        // Aplica o acumulado das penalidades subtraindo do total
        if (penalty > 0) {
            if (total > 0) {
                // Se houver bônus positivo, as penalidades abatem primeiro o bônus
                total = Math.max(0, total - penalty);
            } else {
                // Se já for 0 ou negativo, as penalidades empurram ainda mais para o negativo
                total -= penalty;
            }
        }

        if (total === 0) {
            diceSpan.textContent = "d20";
            diceSpan.className = "diceToRoll dice-neutral";
        } else if (total > 0) {
            diceSpan.textContent = `d20 + ${total}d6`;
            diceSpan.className = "diceToRoll dice-positive";
        } else {
            diceSpan.textContent = `d20 - ${Math.abs(total)}d6`;
            diceSpan.className = "diceToRoll dice-negative";
        }
    }
}

export function updateAllAttributes() {
    attributeGroups.forEach(group => {
        group.attributes.forEach(attr => {
            updateAttributeDice(attr.id);
        });
    });
}

export function initAttributesListeners() {
    document.addEventListener("input", function(e) {
        if (e.target && e.target.classList.contains("attr-input")) {
            let attrId = e.target.id.replace("temp_", "");
            updateAttributeDice(attrId);
            
            if (attrId === "dexterity") {
                updateInitiative();
            }
            updateAllSkills();
        }
    });

    document.querySelectorAll(".conditionCheckbox").forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            setTimeout(() => {
                updateAllAttributes();
                updateAllSkills();
            }, 10);
        });
    });

    attributeGroups.forEach(group => {
        const checkbox = document.getElementById(group.attrCondition.id);
        if (checkbox) {
            checkbox.addEventListener("change", function() {
                updateAllAttributes();
                updateInitiative();
                updateAllSkills();
            });
        }
    });
}

// Função principal que faltava e agora é exportada para o script.js
export function initAttributes() {
    renderAttributes();
    initAttributesListeners();
    updateAllAttributes();
}