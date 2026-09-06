export function updateInitiative() {
    const inputDext = document.getElementById("dexterity");
    const inputTempDext = document.getElementById("temp_dexterity");
    const inputIniciative = document.getElementById("initiative");

    if (inputDext && inputTempDext && inputIniciative) {
        let base = parseInt(inputDext.value) || 0;
        let temp = parseInt(inputTempDext.value) || 0;
        let totalDestreza = base + temp;

        let sinal = totalDestreza >= 0 ? `+ ${totalDestreza}` : `- ${Math.abs(totalDestreza)}`;
        inputIniciative.value = `d20 ${sinal}`;
    }
}

export function initStatusListeners() {
    // 1. LÓGICA DO LIMIAR DA MORTE (FALHAS)
    const deathFail1 = document.getElementById("deathFail1");
    const deathFail2 = document.getElementById("deathFail2");
    const deathFail3 = document.getElementById("deathFail3");
    const vitalityCurrentInput = document.getElementById("vitalityCurrent");

    function checkDeathSaves() {
        if (deathFail1 && deathFail2 && deathFail3 && vitalityCurrentInput) {
            if (deathFail1.checked && deathFail2.checked && deathFail3.checked) {
                vitalityCurrentInput.value = 0;
                vitalityCurrentInput.disabled = true;
            } else {
                vitalityCurrentInput.disabled = false;
            }
        }
    }

    [deathFail1, deathFail2, deathFail3].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener("change", checkDeathSaves);
        }
    });

    if (vitalityCurrentInput) {
        vitalityCurrentInput.addEventListener("input", function() {
            if (deathFail1?.checked && deathFail2?.checked && deathFail3?.checked) {
                vitalityCurrentInput.value = 0;
            }
        });
    }

    // 2. LÓGICA DA BARRA DE ESTRESSE AVANÇADA
    const stressRange = document.getElementById("stress");
    const stressNumberInput = document.getElementById("stressNumberInput");
    const stressFill = document.getElementById("stressFill");
    const afflictedCheck = document.getElementById("afflictedCheck");
    const virtuousCheck = document.getElementById("virtuousCheck");

    function updateStress(value) {
        let val = parseInt(value);
        if (isNaN(val)) val = 0;
        if (val < 0) val = 0;
        if (val > 200) val = 200;

        if (stressRange) stressRange.value = val;
        if (stressNumberInput) stressNumberInput.value = val;

        const percentage = (val / 200) * 100;
        if (stressFill) stressFill.style.width = `${percentage}%`;

        if (afflictedCheck && afflictedCheck.checked) {
            if (stressFill) stressFill.style.backgroundColor = "#8b0000";
        } else if (virtuousCheck && virtuousCheck.checked) {
            if (stressFill) stressFill.style.backgroundColor = "#ffcc00";
        } else {
            if (stressFill) stressFill.style.backgroundColor = val > 100 ? "#929292" : "#ffffff";
        }
    }

    if (stressRange) {
        stressRange.addEventListener("input", () => updateStress(stressRange.value));
    }
    if (stressNumberInput) {
        stressNumberInput.addEventListener("input", () => updateStress(stressNumberInput.value));
    }

    if (afflictedCheck && virtuousCheck) {
        afflictedCheck.addEventListener("change", function() {
            if (afflictedCheck.checked) virtuousCheck.checked = false;
            updateStress(stressRange ? stressRange.value : 0);
        });

        virtuousCheck.addEventListener("change", function() {
            if (virtuousCheck.checked) afflictedCheck.checked = false;
            updateStress(stressRange ? stressRange.value : 0);
        });
    }

    // 3. OUVINTE GLOBAL DE INICIATIVA
    document.addEventListener("input", function(e) {
        if (e.target && (e.target.id === "dexterity" || e.target.id === "temp_dexterity")) {
            updateInitiative();
        }
    });
}