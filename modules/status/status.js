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

export function initStatus() {
    // 1. LIMIAR DA MORTE (FALHAS)
    const deathFail1 = document.getElementById("deathFail1");
    const deathFail2 = document.getElementById("deathFail2");
    const deathFail3 = document.getElementById("deathFail3");
    const vitalityCurrentInput = document.getElementById("vitalityCurrent");
    const vitalityTotalInput = document.getElementById("vitalityTotal");
    const vitalityBarFill = document.getElementById("vitalityBarFill");

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
            updateVitalityBar();
        });
    }

    if (vitalityTotalInput) {
        vitalityTotalInput.addEventListener("input", updateVitalityBar);
    }

    function updateVitalityBar() {
        const current = parseFloat(vitalityCurrentInput?.value) || 0;
        const total = parseFloat(vitalityTotalInput?.value) || 1;
        let percentage = (current / total) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        if (vitalityBarFill) {
            vitalityBarFill.style.width = `${percentage}%`;
        }
    }

    // 2. BARRA DE VONTADE
    const willpowerCurrentInput = document.getElementById("willpowerCurrent");
    const willpowerTotalInput = document.getElementById("willpowerTotal");
    const willpowerBarFill = document.getElementById("willpowerBarFill");

    function updateWillpowerBar() {
        const current = parseFloat(willpowerCurrentInput?.value) || 0;
        const total = parseFloat(willpowerTotalInput?.value) || 1;
        let percentage = (current / total) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        if (willpowerBarFill) {
            willpowerBarFill.style.width = `${percentage}%`;
        }
    }

    [willpowerCurrentInput, willpowerTotalInput].forEach(el => {
        if (el) el.addEventListener("input", updateWillpowerBar);
    });

    // 3. BARRA DE ESTRESSE E CAIXINHAS DO TOPO
    const stressRange = document.getElementById("stressRange");
    const stressNumberInput = document.getElementById("stress"); // Input numérico (0/200)
    const stressFill = document.getElementById("stressFill");
    const stressSquares = document.querySelectorAll(".stressSquare");
    const headerStressCondition = document.getElementById("headerStressCondition");

    // Botão D20 e Caixa de Condições
    const rollStressBtn = document.getElementById("rollStressBtn");
    const stressConditionBox = document.getElementById("stressConditionBox");
    const stressConditionName = document.getElementById("stressConditionName");
    const stressConditionDesc = document.getElementById("stressConditionDesc");

    const conditionsList = [
        { name: "Com medo", desc: "Você adquire desvantagem em todos os testes e sofre o dobro de estresse de todas as fontes.", type: "afflicted" },
        { name: "Sem esperança", desc: "No início de seu turno você profere palavras que desmotivam e causam 2d12 de estresse nos seus aliados.", type: "afflicted" },
        { name: "Inabalável", desc: "Você se torna imune a efeitos de estresse dos inimigos e alivia 1d10 de estresse aos seus aliados por rodada.", type: "virtuous" },
        { name: "Egoísta", desc: "Você se torna incapaz de realizar testes de União. Sempre que auxiliar um aliado, deve ser bem-sucedido em Força de Vontade DT14 ou perde a ação.", type: "afflicted" },
        { name: "Esperançoso", desc: "Você adquire vantagem em todos os testes.", type: "virtuous" },
        { name: "Masoquista", desc: "A cada turno, realiza um teste de Força de Vontade. Se falhar, usa a arma para se atacar, reduzindo 3d12 de estresse.", type: "afflicted" },
        { name: "Abusivo", desc: "Você deve escolher atacar ou difamar um aliado no alcance para reduzir 6d6 de estresse na rodada, causando o mesmo nele.", type: "afflicted" },
        { name: "Paranóico", desc: "Existe um traidor entre vocês, e você deve encontrá-lo a todo custo (O personagem escolhe quem).", type: "afflicted" },
        { name: "Irracional", desc: "No início de todo turno, role um teste de Existir. Se falhar, gasta 1d2 ações fazendo coisas desconexas.", type: "afflicted" },
        { name: "Corajoso", desc: "Você ganha vantagem em testes de Luta e Arcanismo, e recupera 2d10 de estresse a cada acerto.", type: "virtuous" },
        { name: "Paralisado", desc: "No início de todo turno lance um d20+Sabedoria. Se menor que 8, perde ações e causa 2d10 de estresse a aliados.", type: "afflicted" },
        { name: "Errante", desc: "Fica Enfraquecido e Indisposto, sofrendo 2d12 de estresse ao errar ataques/falhar em resistências, sem conseguir críticos.", type: "afflicted" },
        { name: "Tanatofóbico", desc: "A partir da metade da vitalidade, recebe 2d10 de estresse por golpe recebido. Ao cair morrendo, já tem uma falha garantida.", type: "afflicted" },
        { name: "Obstinado", desc: "Se cair morrendo, role d20+Constituição (DT9 retorna sem penalidade e com 3d4 vit). Ao cair morrendo pela 1ª vez, possui um sucesso.", type: "virtuous" },
        { name: "Ansioso", desc: "Você perde todas as condições positivas em si e suas habilidades perdem suas palavras-chave.", type: "afflicted" },
        { name: "Suicida", desc: "Ganhou condição permanente de Marcado. Com vitalidade menor que 10, recebe +1 em testes (exceto Limiar da Morte e Resistência).", type: "afflicted" },
        { name: "Imortal", desc: "No início de cada turno, regenera vitalidade com base na soma de todos seus modificadores.", type: "virtuous" },
        { name: "Robusto", desc: "Você se torna imune a doenças e efeitos contínuos negativos até o fim dessa virtude.", type: "virtuous" },
        { name: "Imunidade baixa", desc: "Você adquire uma doença imediatamente, e causa 3d10 de estresse nos aliados.", type: "afflicted" },
        { name: "Depressivo", desc: "Seu turno passa a ser o último da rodada. Errar uma ação profere palavras que causam desvantagem ao aliado mais perto.", type: "afflicted" }
    ];  

    function updateStress(value) {
        let val = parseInt(value);
        if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(200, val));

        if (stressRange && stressRange.value != val) stressRange.value = val;
        if (stressNumberInput && stressNumberInput.value != val) stressNumberInput.value = val;

        const percentage = (val / 200) * 100;
        if (stressFill) {
            stressFill.style.width = `${percentage}%`;
        }

        // Ativa as 10 caixinhas do topo (1 a cada 10 pontos)
        const activeBoxesCount = Math.floor(val / 10);
        stressSquares.forEach((square, index) => {
            if (index < activeBoxesCount) {
                square.classList.add("active");
            } else {
                square.classList.remove("active");
            }
        });

        // Brilho do botão D20 ao atingir 100+ de estresse
        if (rollStressBtn) {
            if (val >= 100) {
                rollStressBtn.classList.add("glow-ready");
            } else {
                rollStressBtn.classList.remove("glow-ready");
                if (val < 100 && stressConditionBox) {
                    stressConditionBox.classList.remove("is-virtuous", "is-afflicted");
                }
            }
        }

        if (val === 0) {
            if (stressConditionName) stressConditionName.textContent = "Condições de Estresse";
            if (stressConditionDesc) stressConditionDesc.textContent = "Nenhuma condição ativa.";
            if (headerStressCondition) headerStressCondition.textContent = " ";
            if (stressConditionBox) stressConditionBox.classList.remove("is-virtuous", "is-afflicted");
        }
    }

    if (stressRange) {
        stressRange.addEventListener("input", () => updateStress(stressRange.value));
    }
    if (stressNumberInput) {
        stressNumberInput.addEventListener("input", () => updateStress(stressNumberInput.value));
    }

    // 4. BOTÃO D20 (SORTEIO DE CONDIÇÃO DE ESTRESSE)
    if (rollStressBtn) {
        rollStressBtn.addEventListener("click", () => {
            const currentStress = parseInt(stressNumberInput?.value) || 0;

            if (currentStress < 100) {
                const charName = document.getElementById("name")?.value || "o personagem";
                alert(`Por sorte, ${charName} não está estressado(a) o suficiente…`);
                return;
            }

            const randomIndex = Math.floor(Math.random() * conditionsList.length);
            const chosen = conditionsList[randomIndex];

            if (stressConditionName) stressConditionName.textContent = chosen.name;
            if (stressConditionDesc) stressConditionDesc.textContent = chosen.desc;
            if (headerStressCondition) headerStressCondition.textContent = chosen.name;

            if (stressConditionBox) {
                stressConditionBox.classList.remove("is-virtuous", "is-afflicted");
                if (chosen.type === "virtuous") {
                    stressConditionBox.classList.add("is-virtuous");
                } else {
                    stressConditionBox.classList.add("is-afflicted");
                }
            }
        });
    }

    // 5. MEDIDOR DE AMEAÇA
    const threatLevelSelect = document.getElementById("threatLevel");
    const threatMeterVisual = document.getElementById("threatMeterVisual");

    function updateThreatMeter() {
        const selectedThreat = threatLevelSelect?.value;
        if (!threatMeterVisual) return;

        const threatHeights = {
            "nulo": "0%",
            "sublime": "20%",
            "besta": "40%",
            "demonio": "60%",
            "anciao": "80%",
            "radiante": "100%"
        };

        threatMeterVisual.style.background = `linear-gradient(to top, #ff4d4d ${threatHeights[selectedThreat] || "0%"}, #111 ${threatHeights[selectedThreat] || "0%"})`;
    }

    if (threatLevelSelect) {
        threatLevelSelect.addEventListener("change", updateThreatMeter);
    }

    // OUVINTE DE INICIATIVA
    document.addEventListener("input", function(e) {
        if (e.target && (e.target.id === "dexterity" || e.target.id === "temp_dexterity")) {
            updateInitiative();
        }
    });

    // INICIALIZAÇÃO
    updateVitalityBar();
    updateWillpowerBar();
    updateStress(stressNumberInput ? stressNumberInput.value : 0);
    updateThreatMeter();
    updateInitiative();
}