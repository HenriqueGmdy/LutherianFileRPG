import { originsData } from '../background/originsData.js'; 
import { updateAllSkills } from '../attributes/skills.js';

let lastTrainedSkills = [];

export function initOrigins() {
    const originSelect = document.getElementById("origin");
    const habilityDesc = document.getElementById("originTraitDescription");

    if (!originSelect) return;

    // Popula o select ordenado alfabeticamente
    if (originSelect.options.length <= 1) {
        originSelect.innerHTML = `<option value="">Selecione uma origem...</option>`;
        const sortedOrigins = Object.entries(originsData).sort((a, b) => a[1].name.localeCompare(b[1].name));

        sortedOrigins.forEach(([key, origin]) => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = origin.name;
            originSelect.appendChild(option);
        });
    }

    function applyOrigin(selectedKey, isInitialLoad = false) {
        if (!isInitialLoad) {
            lastTrainedSkills.forEach(skillId => {
                const input = document.getElementById(`skill_${skillId}`);
                if (input) {
                    input.value = Math.max(0, parseInt(input.value || 0) - 1);
                }
            });
            lastTrainedSkills = [];
        }

        if (!selectedKey || !originsData[selectedKey]) {
            if (habilityDesc) {
                habilityDesc.textContent = "Nenhuma origem especificada.";
            }
            updateAllSkills();
            return;
        }

        const origin = originsData[selectedKey];

        if (origin.skills && origin.skills.length > 0) {
            origin.skills.forEach(skillId => {
                const input = document.getElementById(`skill_${skillId}`);
                if (input) {
                    if (!isInitialLoad) {
                        input.value = parseInt(input.value || 0) + 1;
                    }
                    lastTrainedSkills.push(skillId);
                }
            });
        }

        if (habilityDesc) {
            let skillsText = origin.skillsName ? origin.skillsName : "À escolha do jogador";
            habilityDesc.innerHTML = `Perícias Treinadas: ${skillsText}<br><br>${origin.campfireSkill}`;
        }

        updateAllSkills();
    }

    originSelect.addEventListener("change", function() {
        applyOrigin(this.value, false);
    });

    // Restaura automaticamente do localStorage na inicialização
    try {
        const savedJSON = localStorage.getItem('lutherian_character_sheet_data');
        if (savedJSON) {
            const data = JSON.parse(savedJSON);
            if (data['origin'] && originsData[data['origin']]) {
                originSelect.value = data['origin'];
                applyOrigin(data['origin'], true); // true evita somar bônus duplicado de perícia no F5
            }
        }
    } catch (e) {
        console.error("Erro ao carregar origem:", e);
    }
}