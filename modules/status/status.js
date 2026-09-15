import { initResources } from './resources.js';
import { initStress } from './stress.js';
import { initThreat } from './threat.js';
import { playSound } from '../../core/audio.js';

let statusInitialized = false;

export function updateInitiative() {
    const dexterityInput = document.getElementById("dexterity");
    const temporaryDexterityInput = document.getElementById("temp_dexterity");
    const initiativeInput = document.getElementById("initiative");

    if (!dexterityInput || !temporaryDexterityInput || !initiativeInput) return;

    const totalDexterity =
        (parseInt(dexterityInput.value, 10) || 0) +
        (parseInt(temporaryDexterityInput.value, 10) || 0);
    const sign = totalDexterity >= 0
        ? `+ ${totalDexterity}`
        : `- ${Math.abs(totalDexterity)}`;

    initiativeInput.value = `d20 ${sign}`;
}

export function initStatus() {
    if (statusInitialized) return;
    statusInitialized = true;

    initResources();
    initStress();
    initThreat();

    document.getElementById('inspiration')?.addEventListener('change', (event) => {
        if (event.target.checked) playSound('inspirationCheck');
    });

    document.addEventListener("input", event => {
        if (event.target?.id === "dexterity" || event.target?.id === "temp_dexterity") {
            updateInitiative();
        }
    });

    updateInitiative();
}
