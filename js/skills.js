const skillColumnsData = [
    [
        { id: "atletismo", name: "Atletismo", attr: "For", attrId: "strength" },
        { id: "luta", name: "Luta", attr: "For", attrId: "strength" },
        { id: "limiar", name: "Limiar da morte", attr: "Con", attrId: "constitution" },
        { id: "resistencia", name: "Resistência", attr: "Con", attrId: "constitution" },
        { id: "vontade", name: "F. de vontade", attr: "Con", attrId: "constitution" }
    ],
    [
        { id: "furtividade", name: "Furtividade", attr: "Des", attrId: "dexterity" },
        { id: "pontaria", name: "Pontaria", attr: "Des", attrId: "dexterity" },
        { id: "coordenacao", name: "Coordenação", attr: "Des", attrId: "dexterity" },
        { id: "navegacao", name: "Navegação", attr: "Des", attrId: "dexterity" },
        { id: "reacao", name: "Reação", attr: "Des", attrId: "dexterity" }
    ],
    [
        { id: "arcanismo", name: "Arcanismo", attr: "Psi", attrId: "psyche" },
        { id: "existir", name: "Existir", attr: "Psi", attrId: "psyche" },
        { id: "logica", name: "Lógica", attr: "Psi", attrId: "psyche" },
        { id: "percepcao", name: "Percepção", attr: "Psi", attrId: "psyche" },
        { id: "interacao", name: "Interação", attr: "Psi", attrId: "psyche" }
    ],
    [
        { id: "adestramento", name: "Adestramento", attr: "Sab", attrId: "wisdom" },
        { id: "enciclopedia", name: "Enciclopédia", attr: "Sab", attrId: "wisdom" },
        { id: "medicina", name: "Medicina", attr: "Sab", attrId: "wisdom" },
        { id: "religiao", name: "Religião", attr: "Sab", attrId: "wisdom" },
        { id: "sobrevivencia", name: "Sobrevivência", attr: "Sab", attrId: "wisdom" }
    ],
    [
        { id: "autoridade", name: "Autoridade", attr: "Car", attrId: "charisma" },
        { id: "compostura", name: "Compostura", attr: "Car", attrId: "charisma" },
        { id: "drama", name: "Drama", attr: "Car", attrId: "charisma" },
        { id: "empatia", name: "Empatia", attr: "Car", attrId: "charisma" },
        { id: "uniao", name: "União", attr: "Car", attrId: "charisma" }
    ]
];

const skillAttributeMap = {};

export function renderSkills() {
    const skillsContainer = document.getElementById("skillsContainer");
    if (!skillsContainer) return;

    skillColumnsData.forEach(column => {
        let columnHTML = `<div class="skillColumn">`;
        
        column.forEach(skill => {
            skillAttributeMap[skill.id] = skill.attrId;
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
}

export function updateSkillModifier(skillKey) {
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

export function updateAllSkills() {
    Object.keys(skillAttributeMap).forEach(skillKey => {
        updateSkillModifier(skillKey);
    });
}

export function initSkillsListeners() {
    document.addEventListener("input", function(e) {
        if (e.target && e.target.classList.contains("skill-input")) {
            let skillKey = e.target.id.replace("skill_", "");
            updateSkillModifier(skillKey);
        }
    });
}