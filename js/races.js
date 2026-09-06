import { racesData } from './racesData.js';

export function initRaces() {
    const raceSelect = document.getElementById("race");
    const advDesc = document.getElementById("raceAdvantageDescription");
    const curseDesc = document.getElementById("raceCurseDescription");

    if (!raceSelect) return;

    raceSelect.addEventListener("change", function() {
        const selectedKey = this.value;

        if (!selectedKey || !racesData[selectedKey]) {
            if (advDesc) advDesc.textContent = "Nenhuma raça selecionada.";
            if (curseDesc) curseDesc.textContent = "Nenhuma raça selecionada.";
            return;
        }

        const race = racesData[selectedKey];

        if (advDesc) advDesc.textContent = race.advantage;
        if (curseDesc) curseDesc.textContent = race.curse;
    });
}