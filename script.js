const attributeGroups = [
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

const container = document.getElementById("attributesContainer");

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

function updateAttributeDice(attrId) {
    const baseInput = document.getElementById(attrId);
    const tempInput = document.getElementById(`temp_${attrId}`);
    const diceSpan = document.getElementById(`dices_${attrId}`);

    if (baseInput && tempInput && diceSpan) {
        let baseVal = parseInt(baseInput.value) || 0;
        let tempVal = parseInt(tempInput.value) || 0;
        let total = baseVal + tempVal;

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

function updateAllAttributes() {
    attributeGroups.forEach(group => {
        group.attributes.forEach(attr => {
            updateAttributeDice(attr.id);
        });
    });
}

document.addEventListener("input", function(e) {
    if (e.target && e.target.classList.contains("attr-input")) {
        let attrId = e.target.id.replace("temp_", "");
        updateAttributeDice(attrId);
        
        if (attrId === "dexterity") {
            updateInitiative();
        }
    }
});

document.querySelectorAll(".conditionCheckbox").forEach(checkbox => {
    checkbox.addEventListener("change", function() {
        // Dispara a atualização para todos para recalcular após a alteração da condição
        setTimeout(updateAllAttributes, 10);
    });
});

attributeGroups.forEach(group => {
    const checkbox = document.getElementById(group.attrCondition.id);

    checkbox.addEventListener("change", function() {
        group.attributes.forEach(attr => {
            const inputAttribute = document.getElementById(attr.id);
            let valorAtual = parseInt(inputAttribute.value);

            if (checkbox.checked) {
                inputAttribute.value = valorAtual - 1;
            } else {
                inputAttribute.value = valorAtual + 1;
            }
        });
    });
});

// 4. Lógica de cálculo automático da Iniciativa com base na Destreza total (Sistema d20)
function updateInitiative() {
    const inputDext = document.getElementById("dexterity");
    const inputTempDext = document.getElementById("temp_dexterity");
    const inputIniciative = document.getElementById("initiative");

    if (inputDext && inputTempDext && inputIniciative) {
        let base = parseInt(inputDext.value) || 0;
        let temp = parseInt(inputTempDext.value) || 0;
        let totalDestreza = base + temp;

        // Formata para o padrão d20 + valor
        let sinal = totalDestreza >= 0 ? `+ ${totalDestreza}` : `- ${Math.abs(totalDestreza)}`;
        inputIniciative.value = `d20 ${sinal}`;
    }
}

// Ouve mudanças nos inputs de Destreza e atualiza a iniciativa em tempo real
document.addEventListener("input", function(e) {
    if (e.target && (e.target.id === "dexterity" || e.target.id === "temp_dexterity")) {
        updateInitiative();
    }
});

// Atualiza também quando as condições alterarem a destreza
document.querySelectorAll(".conditionCheckbox").forEach(checkbox => {
    checkbox.addEventListener("change", updateInitiative);
});

// ==========================================
// LÓGICA DA BARRA DE ESTRESSE AVANÇADA (COM INPUT EDITÁVEL)
// ==========================================
const stressRange = document.getElementById("stress");
const stressNumberInput = document.getElementById("stressNumberInput");
const stressFill = document.getElementById("stressFill");
const afflictedCheck = document.getElementById("afflictedCheck");
const virtuousCheck = document.getElementById("virtuousCheck");

function updateStress(value) {
    let val = parseInt(value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 200) val = 200;

    // Sincroniza os dois elementos
    stressRange.value = val;
    stressNumberInput.value = val;

    const percentage = (val / 200) * 100;
    stressFill.style.width = `${percentage}%`;

    if (afflictedCheck.checked) {
        stressFill.style.backgroundColor = "#8b0000"; // Vermelho sangue
    } else if (virtuousCheck.checked) {
        stressFill.style.backgroundColor = "#ffcc00"; // Amarelo radiante
    } else {
        stressFill.style.backgroundColor = val > 100 ? "#929292" : "#ffffff";
    }
}

// Ouve o arraste da barra
if (stressRange) {
    stressRange.addEventListener("input", function() {
        updateStress(stressRange.value);
    });
}

// Ouve a digitação direta no número
if (stressNumberInput) {
    stressNumberInput.addEventListener("input", function() {
        updateStress(stressNumberInput.value);
    });
}

// Lógica de exclusão mútua entre Aflito e Virtuoso
if (afflictedCheck && virtuousCheck) {
    afflictedCheck.addEventListener("change", function() {
        if (afflictedCheck.checked) {
            virtuousCheck.checked = false;
        }
        updateStress(stressRange.value);
    });

    virtuousCheck.addEventListener("change", function() {
        if (virtuousCheck.checked) {
            afflictedCheck.checked = false;
        }
        updateStress(stressRange.value);
    });
}