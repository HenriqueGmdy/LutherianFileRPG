import { originsData } from './originsData.js';
import { updateAllSkills } from './skills.js';

let lastTrainedSkills = [];

export function initOrigins() {
    const originSelect = document.getElementById("origin");
    const habilityDesc = document.getElementById("originTraitDescription");

    if (!originSelect) return;

    // Popula o select ordenado alfabeticamente
    originSelect.innerHTML = `<option value="">Selecione uma origem...</option>`;
    const sortedOrigins = Object.entries(originsData).sort((a, b) => a[1].name.localeCompare(b[1].name));

    sortedOrigins.forEach(([key, origin]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = origin.name;
        originSelect.appendChild(option);
    });

    // Quando o usuário selecionar uma origem
    originSelect.addEventListener("change", function() {
        const selectedKey = this.value;

        // 1. Remove o bônus (+1) das perícias da origem anterior, se houver
        lastTrainedSkills.forEach(skillId => {
            const input = document.getElementById(`skill_${skillId}`);
            if (input) {
                input.value = parseInt(input.value || 0) - 1;
            }
        });
        lastTrainedSkills = [];

        if (!selectedKey || !originsData[selectedKey]) {
            if (habilityDesc) {
                habilityDesc.textContent = "Nenhuma origem especificada.";
            }
            updateAllSkills();
            return;
        }

        const origin = originsData[selectedKey];

        // 2. Aplica o treino automático (+1) nas perícias fixas da nova origem
        if (origin.skills && origin.skills.length > 0) {
            origin.skills.forEach(skillId => {
                const input = document.getElementById(`skill_${skillId}`);
                if (input) {
                    input.value = parseInt(input.value || 0) + 1;
                    lastTrainedSkills.push(skillId);
                }
            });
        }

       // 3. Atualiza o bloco com uma quebra de linha limpa entre as perícias e a habilidade
        if (habilityDesc) {
            let skillsText = origin.skillsName ? origin.skillsName : "À escolha do jogador";
            
            habilityDesc.textContent = `Perícias Treinadas: ${skillsText}\n\n${origin.campfireSkill}`;
        }

        // Recarrega os modificadores da ficha
        updateAllSkills();
    });
}