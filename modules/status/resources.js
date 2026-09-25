import { playSound, playSoundAfter } from '../../core/audio.js';

export function initResources() {
    const deathFailInputs = [
        document.getElementById("deathFail1"),
        document.getElementById("deathFail2"),
        document.getElementById("deathFail3")
    ];
    const vitalityCurrentInput = document.getElementById("vitalityCurrent");
    const vitalityTotalInput = document.getElementById("vitalityTotal");
    const vitalityBarFill = document.getElementById("vitalityBarFill");
    const vitalityRange = document.getElementById("vitalityRange");
    let previousVitality = Number(vitalityCurrentInput?.value) || 0;

    function updateVitalityBar() {
        const current = parseFloat(vitalityCurrentInput?.value) || 0;
        const total = parseFloat(vitalityTotalInput?.value) || 1;
        const percentage = Math.max(0, Math.min(100, (current / total) * 100));

        if (vitalityRange) {
            vitalityRange.max = String(Math.max(0, Number(vitalityTotalInput?.value) || 0));
            vitalityRange.value = String(Math.max(0, Math.min(Number(vitalityRange.max), current)));
        }
        if (vitalityBarFill) vitalityBarFill.style.width = `${percentage}%`;

    }

    function updateDeathSaves({ playDeathSound = false } = {}) {
        const allFailed = deathFailInputs.every(input => input?.checked);

        if (vitalityCurrentInput) {
            vitalityCurrentInput.disabled = allFailed;
            if (allFailed) vitalityCurrentInput.value = 0;
        }

        updateVitalityBar();
        syncQuickAdjustButtons();

        if (allFailed && playDeathSound) {
            const deathAudio = playSound('deathsDoor');
            playSoundAfter('statusInZero', deathAudio, { fallbackDelay: 500 });
        }
    }

    const quickAdjustButtons = document.querySelectorAll("[data-adjust-target]");

    function syncQuickAdjustButtons() {
        quickAdjustButtons.forEach(button => {
            button.disabled = Boolean(document.getElementById(button.dataset.adjustTarget)?.disabled);
        });
    }

    // Botões +/- rápidos: ajustam o campo pelo mesmo caminho da digitação (input + change),
    // então barra, sons e salvamento reagem normalmente. Nunca passa do máximo nem abaixo de 0.
    function adjustResource(button) {
        const input = document.getElementById(button.dataset.adjustTarget);
        if (!input || input.disabled) return;

        const current = Number(input.value) || 0;
        const maxSource = button.dataset.adjustMax;
        const max = Number(maxSource) || Number(document.getElementById(maxSource)?.value) || 0;
        const next = Math.max(0, Math.min(current + Number(button.dataset.adjustDelta), Math.max(max, current)));
        if (next === current) return;

        input.value = next;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    quickAdjustButtons.forEach(button => {
        button.addEventListener("click", () => adjustResource(button));
    });

    deathFailInputs.forEach(input => {
        input?.addEventListener("change", () => updateDeathSaves({ playDeathSound: true }));
    });

    vitalityCurrentInput?.addEventListener("input", () => {
        updateDeathSaves();
        updateVitalityBar();
    });

    function finishVitalityEdit() {
        const current = Number(vitalityCurrentInput?.value) || 0;
        if (current > previousVitality) playSound('vitalityHeal');
        if (current === 0 && previousVitality > 0) playSound('statusInZero');
        previousVitality = current;
    }

    vitalityCurrentInput?.addEventListener('change', finishVitalityEdit);

    vitalityTotalInput?.addEventListener("input", updateVitalityBar);
    vitalityRange?.addEventListener("input", () => {
        if (vitalityCurrentInput) vitalityCurrentInput.value = vitalityRange.value;
        updateDeathSaves();
        updateVitalityBar();
    });
    vitalityRange?.addEventListener('change', finishVitalityEdit);

    const willpowerCurrentInput = document.getElementById("willpowerCurrent");
    const willpowerTotalInput = document.getElementById("willpowerTotal");
    const willpowerBarFill = document.getElementById("willpowerBarFill");
    const willpowerRange = document.getElementById("willpowerRange");

    function updateWillpowerBar() {
        const current = parseFloat(willpowerCurrentInput?.value) || 0;
        const total = parseFloat(willpowerTotalInput?.value) || 1;
        const percentage = Math.max(0, Math.min(100, (current / total) * 100));

        if (willpowerRange) {
            willpowerRange.max = String(Math.max(0, Number(willpowerTotalInput?.value) || 0));
            willpowerRange.value = String(Math.max(0, Math.min(Number(willpowerRange.max), current)));
        }
        if (willpowerBarFill) willpowerBarFill.style.width = `${percentage}%`;
    }

    willpowerCurrentInput?.addEventListener("input", updateWillpowerBar);
    willpowerTotalInput?.addEventListener("input", updateWillpowerBar);
    let previousWillpower = Number(willpowerCurrentInput?.value) || 0;

    function updateWillpowerAudio() {
        const current = Number(willpowerCurrentInput?.value) || 0;
        if (current > previousWillpower) playSound('willHeal');
        if (current === 0 && previousWillpower > 0) playSound('statusInZero');
        previousWillpower = current;
    }

    willpowerCurrentInput?.addEventListener('change', updateWillpowerAudio);
    willpowerRange?.addEventListener("input", () => {
        if (willpowerCurrentInput) willpowerCurrentInput.value = willpowerRange.value;
        updateWillpowerBar();
    });
    willpowerRange?.addEventListener('change', updateWillpowerAudio);

    updateDeathSaves();
    updateVitalityBar();
    updateWillpowerBar();
}
