import { racesData } from '../data/racesData.js';

export function initRaces() {
    const raceSelect = document.getElementById("race");
    const advDesc = document.getElementById("raceAdvantageDescription");
    const curseDesc = document.getElementById("raceCurseDescription");

    if (!raceSelect) return;

    function applyRace(selectedKey) {
        if (!selectedKey || !racesData[selectedKey]) {
            if (advDesc) advDesc.textContent = "Nenhuma raça selecionada.";
            if (curseDesc) curseDesc.textContent = "Nenhuma raça selecionada.";
            return;
        }

        const race = racesData[selectedKey];
        if (advDesc) advDesc.textContent = race.advantage;
        if (curseDesc) curseDesc.textContent = race.curse;
    }

    raceSelect.addEventListener("change", function() {
        applyRace(this.value);
    });

    // Restaura automaticamente do localStorage assim que a página carrega
    try {
        const savedJSON = localStorage.getItem('lutherian_character_sheet_data');
        if (savedJSON) {
            const data = JSON.parse(savedJSON);
            if (data['race'] && racesData[data['race']]) {
                raceSelect.value = data['race'];
                applyRace(data['race']);
            }
        }
    } catch (e) {
        console.error("Erro ao carregar raça:", e);
    }
}