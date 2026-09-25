import { racesData } from '../background/racesData.js';
import { isRestoringData } from '../../core/appState.js';
import { setTooltipContent } from '../../core/tooltip.js';

const BODY_TOOLTIPS = [
    { key: 'bodyHeight', label: 'Altura', field: 'height' },
    { key: 'bodyWeight', label: 'Peso', field: 'weight' },
    { key: 'bodyAge', label: 'Idade', field: 'age' }
];
const NO_RACE_TOOLTIP = 'Selecione uma raça para ver a faixa típica.';

function updateBodyTooltips(race) {
    BODY_TOOLTIPS.forEach(({ key, label, field }) => {
        setTooltipContent(key, race?.body
            ? { title: `${label} · ${race.name}`, text: race.body[field] }
            : { title: label, text: NO_RACE_TOOLTIP });
    });
}

export function initRaces() {
    const raceSelect = document.getElementById("race");
    const advDesc = document.getElementById("raceAdvantageDescription");
    const curseDesc = document.getElementById("raceCurseDescription");
    const defenseInput = document.getElementById("defense");
    const deathFailInputs = [
        document.getElementById("deathFail1"),
        document.getElementById("deathFail2"),
        document.getElementById("deathFail3")
    ];

    if (!raceSelect) return;

    let previousRaceKey = raceSelect.value;

    // Defesa base racial: soma dos atributos puros (sem mod. temporário nem penalidades) + bônus.
    function calculateRacialDefense(race) {
        const base = race?.defenseBase;
        if (!base) return null;

        const total = base.attributes.reduce(
            (sum, attrId) => sum + (parseInt(document.getElementById(attrId)?.value, 10) || 0),
            base.bonus || 0
        );
        return Math.max(0, total);
    }

    function setDefense(value) {
        if (!defenseInput || defenseInput.value === String(value)) return;
        defenseInput.value = value;
        // Só "input": grava no storage sem disparar o som de clique do "change".
        defenseInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Preenche a defesa automaticamente. O valor continua editável (ex.: uso de armadura),
    // e é recalculado quando raça, Força ou Constituição mudam. Na restauração da ficha o valor salvo prevalece.
    function syncRacialDefense(previousKey = null) {
        if (isRestoringData()) return;

        const automaticDefense = calculateRacialDefense(racesData[raceSelect.value]);
        if (automaticDefense !== null) {
            setDefense(automaticDefense);
            return;
        }

        const previousDefense = calculateRacialDefense(racesData[previousKey]);
        if (previousDefense !== null && Number(defenseInput?.value) === previousDefense) {
            setDefense(0);
        }
    }

    function setChecked(input, checked) {
        if (input.checked === checked) return;
        input.checked = checked;
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Caixas do limiar da morte travadas pela raça (ex.: Ressonante começa com 1 marcada).
    function applyDeathFailLocks(race) {
        const lockedCount = Number(race?.lockedDeathFails) || 0;

        deathFailInputs.forEach((input, index) => {
            if (!input) return;

            if (index < lockedCount) {
                input.dataset.raceLocked = "true";
                input.disabled = true;
                input.closest("label")?.setAttribute("title", "Marcada permanentemente pela raça");
                setChecked(input, true);
            } else if (input.dataset.raceLocked === "true") {
                delete input.dataset.raceLocked;
                input.disabled = false;
                input.closest("label")?.removeAttribute("title");
                setChecked(input, false);
            }
        });
    }

    // Restauração da ficha ou script não podem desmarcar uma caixa travada.
    deathFailInputs.forEach(input => {
        input?.addEventListener("change", () => {
            if (input.dataset.raceLocked === "true" && !input.checked) setChecked(input, true);
        });
    });

    function applyRace(selectedKey) {
        const race = racesData[selectedKey];
        const previousKey = previousRaceKey;
        previousRaceKey = selectedKey;

        applyDeathFailLocks(race);
        updateBodyTooltips(race);
        syncRacialDefense(previousKey);

        if (!selectedKey || !race) {
            if (advDesc) advDesc.textContent = "Nenhuma raça selecionada.";
            if (curseDesc) curseDesc.textContent = "Nenhuma raça selecionada.";
            return;
        }

        if (advDesc) advDesc.textContent = race.advantage;
        if (curseDesc) curseDesc.textContent = race.curse;
    }

    raceSelect.addEventListener("change", function() {
        applyRace(this.value);
    });

    document.addEventListener("input", event => {
        if (event.target?.id === "strength" || event.target?.id === "constitution") {
            syncRacialDefense();
        }
    });

    applyRace(raceSelect.value);
}
