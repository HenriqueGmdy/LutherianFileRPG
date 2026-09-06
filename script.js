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

// ==========================================
// GERAÇÃO DINÂMICA E LÓGICA DAS PERÍCIAS
// ==========================================
const skillsData = [
    { attrName: "Força (For)", attrId: "strength", skills: [
        { id: "atletismo", name: "Atletismo" },
        { id: "luta", name: "Luta" }
    ]},
    { attrName: "Constituição (Con)", attrId: "constitution", skills: [
        { id: "limiar", name: "Limiar da morte" },
        { id: "resistencia", name: "Resistência" },
        { id: "vontade", name: "F. de vontade" }
    ]},
    { attrName: "Destreza (Des)", attrId: "dexterity", skills: [
        { id: "furtividade", name: "Furtividade" },
        { id: "pontaria", name: "Pontaria" },
        { id: "coordenacao", name: "Coordenação" },
        { id: "navegacao", name: "Navegação" },
        { id: "reacao", name: "Reação" }
    ]},
    { attrName: "Psique (Psi)", attrId: "psyche", skills: [
        { id: "arcanismo", name: "Arcanismo" },
        { id: "existir", name: "Existir" },
        { id: "logica", name: "Lógica" },
        { id: "percepcao", name: "Percepção" },
        { id: "interacao", name: "Interação" }
    ]},
    { attrName: "Sabedoria (Sab)", attrId: "wisdom", skills: [
        { id: "adestramento", name: "Adestramento" },
        { id: "enciclopedia", name: "Enciclopédia" },
        { id: "medicina", name: "Medicina" },
        { id: "religiao", name: "Religião" },
        { id: "sobrevivencia", name: "Sobrevivência" }
    ]},
    { attrName: "Carisma (Car)", attrId: "charisma", skills: [
        { id: "autoridade", name: "Autoridade" },
        { id: "compostura", name: "Compostura" },
        { id: "drama", name: "Drama" },
        { id: "empatia", name: "Empatia" },
        { id: "uniao", name: "União" }
    ]}
];

// Reorganizando em exatamente 5 colunas equilibradas se necessário, 
// ou gerando por grupos de atributos. Como são 5 colunas pedidas, 
// vamos mapear direto para 5 colunas lógicas:
const skillColumnsData = [
    // Coluna 1 (For e Con parciais)
    [
        { id: "atletismo", name: "Atletismo", attr: "For", attrId: "strength" },
        { id: "luta", name: "Luta", attr: "For", attrId: "strength" },
        { id: "limiar", name: "Limiar da morte", attr: "Con", attrId: "constitution" },
        { id: "resistencia", name: "Resistência", attr: "Con", attrId: "constitution" },
        { id: "vontade", name: "F. de vontade", attr: "Con", attrId: "constitution" }
    ],
    // Coluna 2 (Des)
    [
        { id: "furtividade", name: "Furtividade", attr: "Des", attrId: "dexterity" },
        { id: "pontaria", name: "Pontaria", attr: "Des", attrId: "dexterity" },
        { id: "coordenacao", name: "Coordenação", attr: "Des", attrId: "dexterity" },
        { id: "navegacao", name: "Navegação", attr: "Des", attrId: "dexterity" },
        { id: "reacao", name: "Reação", attr: "Des", attrId: "dexterity" }
    ],
    // Coluna 3 (Psi)
    [
        { id: "arcanismo", name: "Arcanismo", attr: "Psi", attrId: "psyche" },
        { id: "existir", name: "Existir", attr: "Psi", attrId: "psyche" },
        { id: "logica", name: "Lógica", attr: "Psi", attrId: "psyche" },
        { id: "percepcao", name: "Percepção", attr: "Psi", attrId: "psyche" },
        { id: "interacao", name: "Interação", attr: "Psi", attrId: "psyche" }
    ],
    // Coluna 4 (Sab)
    [
        { id: "adestramento", name: "Adestramento", attr: "Sab", attrId: "wisdom" },
        { id: "enciclopedia", name: "Enciclopédia", attr: "Sab", attrId: "wisdom" },
        { id: "medicina", name: "Medicina", attr: "Sab", attrId: "wisdom" },
        { id: "religiao", name: "Religião", attr: "Sab", attrId: "wisdom" },
        { id: "sobrevivencia", name: "Sobrevivência", attr: "Sab", attrId: "wisdom" }
    ],
    // Coluna 5 (Car)
    [
        { id: "autoridade", name: "Autoridade", attr: "Car", attrId: "charisma" },
        { id: "compostura", name: "Compostura", attr: "Car", attrId: "charisma" },
        { id: "drama", name: "Drama", attr: "Car", attrId: "charisma" },
        { id: "empatia", name: "Empatia", attr: "Car", attrId: "charisma" },
        { id: "uniao", name: "União", attr: "Car", attrId: "charisma" }
    ]
];

const skillsContainer = document.getElementById("skillsContainer");
const skillAttributeMap = {};

// Gera o HTML das 5 colunas programaticamente
skillColumnsData.forEach(column => {
    let columnHTML = `<div class="skillColumn">`;
    
    column.forEach(skill => {
        skillAttributeMap[skill.id] = skill.attrId; // Mapeia para o calculador
        columnHTML += `
            <div class="skillGroup">
                <label for="skill_${skill.id}">${skill.name} <span class="skillAttr">(${skill.attr})</span></label>
                <input type="number" id="skill_${skill.id}" value="0" class="skill-input">
                <span id="mod_skill_${skill.id}" class="skillMod">0</span>
            </div>
        `;
    });

    columnHTML += `</div>`;
    skillsContainer.innerHTML += columnHTML;
});

// Funções de cálculo automático das perícias
function updateSkillModifier(skillKey) {
    const skillInput = document.getElementById(`skill_${skillKey}`);
    const modSpan = document.getElementById(`mod_skill_${skillKey}`);
    const attrId = skillAttributeMap[skillKey];

    if (skillInput && modSpan && attrId) {
        let skillRank = parseInt(skillInput.value) || 0;
        
        let attrBase = parseInt(document.getElementById(attrId)?.value) || 0;
        let attrTemp = parseInt(document.getElementById(`temp_${attrId}`)?.value) || 0;
        let attrTotal = attrBase + attrTemp;

        let finalMod = skillRank + attrTotal;
        modSpan.textContent = finalMod >= 0 ? `+${finalMod}` : finalMod;
    }
}

function updateAllSkills() {
    Object.keys(skillAttributeMap).forEach(skillKey => {
        updateSkillModifier(skillKey);
    });
}

// Ouvintes de eventos para atualizar em tempo real
document.addEventListener("input", function(e) {
    if (e.target && e.target.classList.contains("skill-input")) {
        let skillKey = e.target.id.replace("skill_", "");
        updateSkillModifier(skillKey);
    }
    if (e.target && (e.target.classList.contains("attr-input") || e.target.classList.contains("conditionCheckbox"))) {
        updateAllSkills();
    }
});

// Executa na inicialização
window.addEventListener("DOMContentLoaded", updateAllSkills);