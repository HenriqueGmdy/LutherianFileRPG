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

import { updateAllSkills } from './skills.js';
import { isCharacterOverloaded } from '../../core/appState.js';

export function renderAttributes() {
    const container = document.getElementById("attributesContainer");
    if (!container) return;

    container.innerHTML = "";

    attributeGroups.forEach(group => {
        const attr1 = group.attributes[0];
        const attr2 = group.attributes[1];
        const cond = group.attrCondition;

        container.innerHTML += `
            <div class="attributeGroup">
                <div class="attributeRow">
                    <div class="attribute-left">
                        <label for="${attr1.id}" data-tooltip="attr.${attr1.id}">${attr1.name}:</label>
                        <input type="number" id="${attr1.id}" min="-4" max="4" value="0" class="attr-input">
                    </div>
                    <div class="attribute-right">
                        <label for="temp_${attr1.id}">Mod. temporário:</label>
                        <input type="number" id="temp_${attr1.id}" min="-5" max="5" value="0" class="attr-input">
                        <span id="dices_${attr1.id}" class="diceToRoll">d20</span>
                    </div>
                </div>

                <div class="attributeRow">
                    <div class="attribute-left">
                        <label for="${attr2.id}" data-tooltip="attr.${attr2.id}">${attr2.name}:</label>
                        <input type="number" id="${attr2.id}" min="-4" max="4" value="0" class="attr-input">
                    </div>
                    <div class="attribute-right">
                        <label for="temp_${attr2.id}">Mod. temporário:</label>
                        <input type="number" id="temp_${attr2.id}" min="-5" max="5" value="0" class="attr-input">
                        <span id="dices_${attr2.id}" class="diceToRoll">d20</span>
                    </div>
                </div>

                <div class="conditionBox">
                    <label class="conditionControl" aria-label="${cond.name}">
                        <input type="checkbox" id="${cond.id}" class="conditionCheckbox">
                        <span class="conditionMark" aria-hidden="true"></span>
                        <strong>${cond.name}</strong>
                    </label>
                </div>
            </div>
        `;
    });
}

// Iniciativa = d20 + valor de Destreza (mesmo total usado nos dados do atributo, já com mod. temporário e penalidades).
function syncInitiative(dexterityTotal) {
    const initiative = document.getElementById("initiativeValue");
    if (!initiative) return;

    if (dexterityTotal === 0) {
        initiative.textContent = "d20";
        initiative.className = "diceToRoll dice-neutral";
    } else if (dexterityTotal > 0) {
        initiative.textContent = `d20 + ${dexterityTotal}`;
        initiative.className = "diceToRoll dice-positive";
    } else {
        initiative.textContent = `d20 - ${Math.abs(dexterityTotal)}`;
        initiative.className = "diceToRoll dice-negative";
    }
}

export function updateAttributeDice(attrId) {
    const baseInput = document.getElementById(attrId);
    const tempInput = document.getElementById(`temp_${attrId}`);
    const diceSpan = document.getElementById(`dices_${attrId}`);

    if (baseInput && tempInput && diceSpan) {
        let baseVal = parseInt(baseInput.value) || 0;
        let tempVal = parseInt(tempInput.value) || 0;
        let total = baseVal + tempVal;

        let penalty = 0;
        const isOverloaded = isCharacterOverloaded();
        const bigBackpackEl = document.getElementById("bigBackpackCheck");
        const bigBackpackActive = bigBackpackEl ? bigBackpackEl.checked : false;

        // Checagem das condições dos atributos
        const weakenedChecked = document.getElementById("weakened")?.checked || false;
        const unwellChecked = document.getElementById("unwell")?.checked || false;
        const miserableChecked = document.getElementById("miserable")?.checked || false;

        if (weakenedChecked && (attrId === "strength" || attrId === "dexterity")) {
            penalty += 1;
        }
        if (unwellChecked && (attrId === "constitution" || attrId === "charisma")) {
            penalty += 1;
        }
        if (miserableChecked && (attrId === "psyche" || attrId === "wisdom")) {
            penalty += 1;
        }

        if (isOverloaded && (attrId === "strength" || attrId === "dexterity")) {
            penalty += 1;
        }

        if (bigBackpackActive && attrId === "strength") {
            penalty += 1;
        }

        if (penalty > 0) {
            if (total > 0) {
                total = Math.max(0, total - penalty);
            } else {
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

        if (attrId === "dexterity") syncInitiative(total);
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
            updateAllSkills();
        }
    });

    document.querySelectorAll(".conditionCheckbox").forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            updateAllAttributes();
            updateAllSkills();
        });
    });
}

export function initAttributes() {
    renderAttributes();
    initAttributesListeners();
    updateAllAttributes();
}