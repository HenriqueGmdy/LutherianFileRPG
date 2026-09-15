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

    function updateDeathSaves() {
        const allFailed = deathFailInputs.every(input => input?.checked);

        if (vitalityCurrentInput) {
            vitalityCurrentInput.disabled = allFailed;
            if (allFailed) vitalityCurrentInput.value = 0;
        }

        updateVitalityBar();
    }

    deathFailInputs.forEach(input => {
        input?.addEventListener("change", updateDeathSaves);
    });

    vitalityCurrentInput?.addEventListener("input", () => {
        updateDeathSaves();
        updateVitalityBar();
    });

    vitalityTotalInput?.addEventListener("input", updateVitalityBar);
    vitalityRange?.addEventListener("input", () => {
        if (vitalityCurrentInput) vitalityCurrentInput.value = vitalityRange.value;
        updateDeathSaves();
        updateVitalityBar();
    });

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
    willpowerRange?.addEventListener("input", () => {
        if (willpowerCurrentInput) willpowerCurrentInput.value = willpowerRange.value;
        updateWillpowerBar();
    });

    updateDeathSaves();
    updateVitalityBar();
    updateWillpowerBar();
}
