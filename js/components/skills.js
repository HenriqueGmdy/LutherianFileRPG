const skillColumnsData = [
    [
        { id: "atletismo", name: "Atletismo", attr: "For", attrId: "strength" },
        { id: "luta", name: "Luta", attr: "For", attrId: "strength" },
        { id: "limiar", name: "Limiar da morte", attr: "Con", attrId: "constitution" },
        { id: "resistencia", name: "Resistência", attr: "Con", attrId: "constitution" },
        { id: "vontade", name: "Força de vontade", attr: "Con", attrId: "constitution" }
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
                    <span id="mod_skill_${skill.id}" class="skillMod">d20</span>
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

        // Soma as penalidades ativas para as perícias baseadas em Força e Destreza
        let penalty = 0;
        const isOverloaded = typeof window.isCharacterOverloaded === 'function' && window.isCharacterOverloaded();
        const bigBackpackActive = document.getElementById("bigBackpackCheck")?.checked || false;

        if (isOverloaded && (attrId === "strength" || attrId === "dexterity")) {
            penalty += 1;
        }
        if (bigBackpackActive && attrId === "strength") {
            penalty += 1;
        }

        if (penalty > 0) {
            if (attrTotal > 0) {
                attrTotal = Math.max(0, attrTotal - penalty);
            } else {
                attrTotal -= penalty;
            }
        }

        if (attrTotal === 0) {
            if (skillRank === 0) {
                modSpan.textContent = "d20";
                modSpan.className = "skillMod dice-neutral";
            } else {
                let sSign = skillRank > 0 ? `+ ${skillRank}` : `- ${Math.abs(skillRank)}`;
                modSpan.textContent = `d20 ${sSign}`;
                modSpan.className = "skillMod " + (skillRank > 0 ? "dice-positive" : "dice-negative");
            }
        } else if (attrTotal > 0) {
            let rankPart = skillRank !== 0 ? (skillRank > 0 ? ` + ${skillRank}` : ` - ${Math.abs(skillRank)}`) : "";
            modSpan.textContent = `d20 + ${attrTotal}d6${rankPart}`;
            modSpan.className = "skillMod dice-positive";
        } else {
            let absAttr = Math.abs(attrTotal);
            let rankPart = skillRank !== 0 ? (skillRank > 0 ? ` + ${skillRank}` : ` - ${Math.abs(skillRank)}`) : "";
            modSpan.textContent = `d20 - ${absAttr}d6${rankPart}`;
            modSpan.className = "skillMod dice-negative";
        }
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