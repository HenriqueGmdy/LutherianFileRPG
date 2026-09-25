import { CONFIG } from '../../core/config.js';
import { playSound, getMasterVolume } from '../../core/audio.js';

const afflictedConditions = [
    { name: "Com medo", desc: "Você adquire desvantagem em todos os testes e sofre o dobro de estresse de todas as fontes.", type: "afflicted" },
    { name: "Sem esperança", desc: "No início de seu turno você profere palavras que desmotivam e causam 2d12 de estresse nos seus aliados.", type: "afflicted" },
    { name: "Egoísta", desc: "Você se torna incapaz de realizar testes de União. Sempre que auxiliar um aliado, deve ser bem-sucedido em Força de Vontade DT14 ou perde a ação.", type: "afflicted" },
    { name: "Masoquista", desc: "A cada turno, realiza um teste de Força de Vontade. Se falhar, usa a arma para se atacar, reduzindo 3d12 de estresse.", type: "afflicted" },
    { name: "Abusivo", desc: "Você deve escolher atacar ou difamar um aliado no alcance para reduzir 6d6 de estresse na rodada, causando o mesmo nele.", type: "afflicted" },
    { name: "Paranóico", desc: "Existe um traidor entre vocês, e você deve encontrá-lo a todo custo (O personagem escolhe quem).", type: "afflicted" },
    { name: "Irracional", desc: "No início de todo turno, role um teste de Existir. Se falhar, gasta 1d2 ações fazendo coisas desconexas.", type: "afflicted" },
    { name: "Paralisado", desc: "No início de todo turno lance um d20+Sabedoria. Se menor que 8, perde ações e causa 2d10 de estresse a aliados.", type: "afflicted" },
    { name: "Errante", desc: "Fica Enfraquecido e Indisposto, sofrendo 2d12 de estresse ao errar ataques/falhar em resistências, sem conseguir críticos.", type: "afflicted" },
    { name: "Tanatofóbico", desc: "A partir da metade da vitalidade, recebe 2d10 de estresse por golpe recebido. Ao cair morrendo, já tem uma falha garantida.", type: "afflicted" },
    { name: "Ansioso", desc: "Você perde todas as condições positivas em si e suas habilidades perdem suas palavras-chave.", type: "afflicted" },
    { name: "Suicida", desc: "Ganhou condição permanente de Marcado. Com vitalidade menor que 10, recebe +1 em testes (exceto Limiar da Morte e Resistência).", type: "afflicted" },
    { name: "Imunidade baixa", desc: "Você adquire uma doença imediatamente, e causa 3d10 de estresse aos aliados.", type: "afflicted" },
    { name: "Depressivo", desc: "Seu turno passa a ser o último da rodada. Errar uma ação profere palavras que causam desvantagem ao aliado mais perto.", type: "afflicted" },
    { name: "Sanguinário", desc: "Você sempre precisa atacar o ser mais próximo de você. Curas em você têm seu efeito reduzido pela metade.", type: "afflicted" },
    { name: "Catatônico", desc: "No seu primeiro turno, seu deslocamento é zerado. Você está sempre horrorizado (1d10) e não realiza reações.", type: "afflicted" },
    { name: "Mórbido", desc: "Você sempre deve dedicar uma de suas ações a interagir com um cadáver, causando 1d20 de estresse em aliados. Se não houver nenhum, sofre 3d12 de estresse.", type: "afflicted" },
    { name: "Exaurido", desc: "Você fica Miserável e Enfraquecido. Seu deslocamento é reduzido pela metade.", type: "afflicted" },
    { name: "Vulnerável", desc: "Sua classe de defesa é reduzida a zero. Se você sofrer qualquer acerto crítico, fica enfraquecido.", type: "afflicted" },
    { name: "Paradoxal", desc: "Sua próxima magia irá romper o véu, causando um paradoxo correspondente ao nível e causando 4d20 de estresse em aliados.", type: "afflicted" },
    { name: "Imoral", desc: "Perde 2d4 de moral e causa -2 de moral em todos os aliados. Agir de forma suja e contra seus princípios recupera 2d20 de estresse.", type: "afflicted" },
    { name: "Indiferente", desc: "Você sofre metade dos efeitos de estresse, mas não pode adquirir nem usar inspirações.", type: "afflicted" }
];

const virtuousConditions = [
    { name: "Inabalável", desc: "Você se torna imune a efeitos de estresse dos inimigos e alivia 1d12 de estresse aos seus aliados por rodada.", type: "virtuous" },
    { name: "Esperançoso", desc: "Você adquire vantagem em todos os testes.", type: "virtuous" },
    { name: "Corajoso", desc: "Você ganha vantagem em testes de Luta e Arcanismo, e recupera 2d10 de estresse a cada acerto.", type: "virtuous" },
    { name: "Obstinado", desc: "Se cair morrendo, role d20+Constituição (DT9 retorna sem penalidade e com 3d4 vit). Ao cair morrendo novamente, possui um sucesso.", type: "virtuous" },
    { name: "Imortal", desc: "No início de cada turno, regenera vitalidade com base na soma de todos seus modificadores.", type: "virtuous" },
    { name: "Robusto", desc: "Você se torna imune a doenças e efeitos contínuos negativos até o fim dessa virtude.", type: "virtuous" },
    { name: "Lúcido", desc: "Você cancela todas suas desvantagens e penalidades de modificadores, mas se limita a ter apenas uma vantagem.", type: "virtuous" },
    { name: "Líder", desc: "Você pode gastar 1 ação para liderar um aliado, garantindo +2 em seus testes nessa rodada, reduzindo seu estresse em 2d12.", type: "virtuous" },
    { name: "Letal", desc: "Sua margem de crítico é reduzida em 1. Seu primeiro ataque crítico causa o dano máximo da arma/habilidade.", type: "virtuous" }
];

export function initStress() {
    let isStarting = true;
    let previousStress = Number(document.getElementById("stress")?.value) || 0;
    const stressRange = document.getElementById("stressRange");
    const stressNumberInput = document.getElementById("stress");
    const stressFill = document.getElementById("stressFill");
    const stressSquares = document.querySelectorAll(".stressSquare");
    const stressSquaresContainer = document.getElementById("stressSquaresVisual");
    const headerStressCondition = document.getElementById("headerStressCondition");
    const rollStressBtn = document.getElementById("rollStressBtn");
    const stressConditionBox = document.getElementById("stressConditionBox");
    const stressConditionName = document.getElementById("stressConditionName");
    const stressConditionDesc = document.getElementById("stressConditionDesc");
    const virtuousOverlay = document.getElementById("virtuousResolveOverlay");
    const stressOverlay = document.getElementById("stressResolveOverlay");
    const threatMeterVisual = document.getElementById("threatMeterVisual");

    function setAfflictedVisuals(isAfflicted) {
        stressSquaresContainer?.classList.toggle("is-afflicted", isAfflicted);
        threatMeterVisual?.classList.toggle("is-afflicted", isAfflicted);
    }

    function clearActiveCondition() {
        if (stressConditionName) stressConditionName.textContent = "Condições de Estresse";
        if (stressConditionDesc) stressConditionDesc.textContent = "Nenhuma condição ativa.";
        if (headerStressCondition) headerStressCondition.textContent = "Normal";
        stressConditionBox?.classList.remove("is-virtuous", "is-afflicted");
        setAfflictedVisuals(false);
        if (virtuousOverlay) virtuousOverlay.style.display = "none";
        if (stressOverlay) stressOverlay.style.display = "none";
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ACTIVE_CONDITION);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.RESOLVE_STATE);
    }

    function updateStress(value) {
        let stress = Number.parseInt(value, 10);
        if (!Number.isFinite(stress)) stress = 0;
        stress = Math.max(0, Math.min(CONFIG.LIMITS.MAX_STRESS, stress));

        if (stressRange && Number(stressRange.value) !== stress) stressRange.value = stress;
        if (stressNumberInput && Number(stressNumberInput.value) !== stress) stressNumberInput.value = stress;
        if (stressFill) stressFill.style.width = `${(stress / CONFIG.LIMITS.MAX_STRESS) * 100}%`;

        const activeBoxesCount = Math.floor(stress / 10);
        stressSquares.forEach((square, index) => {
            square.classList.toggle("active", index < activeBoxesCount);
        });

        const hasActiveCondition = localStorage.getItem(CONFIG.STORAGE_KEYS.ACTIVE_CONDITION);
        rollStressBtn?.classList.toggle("glow-ready", stress >= 100 && !hasActiveCondition);

        if (!isStarting && stress === 0) clearActiveCondition();
    }

    function finishStressEdit() {
        const stress = Number.parseInt(stressNumberInput?.value, 10) || 0;
        if (stress < previousStress) playSound('stressHeal');
        if (stress > previousStress) playSound('stressIncrease');
        if (stress === CONFIG.LIMITS.MAX_STRESS && previousStress !== stress) playSound('stressMax');
        previousStress = stress;
    }

    function applySavedCondition() {
        const savedConditionData = localStorage.getItem(CONFIG.STORAGE_KEYS.ACTIVE_CONDITION);
        const savedResolve = localStorage.getItem(CONFIG.STORAGE_KEYS.RESOLVE_STATE);
        if (!savedConditionData) return;

        try {
            const condition = JSON.parse(savedConditionData);
            if (!condition || !condition.name || !condition.desc) return;

            if (stressConditionName) stressConditionName.textContent = condition.name;
            if (stressConditionDesc) stressConditionDesc.textContent = condition.desc;
            if (headerStressCondition) headerStressCondition.textContent = condition.name;
            stressConditionBox?.classList.remove("is-virtuous", "is-afflicted");
            stressConditionBox?.classList.add(`is-${condition.type}`);
            setAfflictedVisuals(condition.type === "afflicted");
            if (virtuousOverlay) virtuousOverlay.style.display = savedResolve === "virtuous" ? "block" : "none";
            if (stressOverlay) stressOverlay.style.display = savedResolve === "afflicted" ? "block" : "none";
            rollStressBtn?.classList.remove("glow-ready");
        } catch (error) {
            console.error("Erro ao carregar a condição de estresse:", error);
        }
    }

    function resolveCondition() {
        const currentStress = Number.parseInt(stressNumberInput?.value, 10) || 0;
        const hasActiveCondition = localStorage.getItem(CONFIG.STORAGE_KEYS.ACTIVE_CONDITION);

        if (currentStress < 100) {
            const charName = document.getElementById("name")?.value || "o personagem";
            alert(`Por sorte, ${charName} não está estressado(a) o suficiente…`);
            return;
        }
        if (hasActiveCondition) {
            alert("Você já possui uma condição de estresse ativa! É preciso zerar o estresse antes de rolar novamente.");
            return;
        }

        const roll = Math.floor(Math.random() * 4) + 1;
        const conditionPool = roll === 4 ? virtuousConditions : afflictedConditions;
        const chosen = conditionPool[Math.floor(Math.random() * conditionPool.length)];
        const overlay = document.getElementById("resolveCinematicOverlay");
        const textSpan = document.getElementById("resolveCinematicText");
        const imgEl = document.getElementById("resolveCinematicImg");
        const textContainer = document.getElementById("resolveTextContainer");
        const bgTextImg = document.getElementById("resolveBgTextImg");
        if (!overlay || !textSpan || !imgEl || !textContainer || !bgTextImg) {
            rollStressBtn?.classList.remove("glow-ready");
            return;
        }

        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        textContainer.style.display = "none";
        imgEl.src = `${window.location.origin}${basePath}/assets/images/menus/determination.png`;
        imgEl.style.display = "block";
        overlay.style.display = "flex";

        const audioFile = chosen.type === "virtuous" ? "virtue.mp3" : "affliction.mp3";
        const resolveAudio = new Audio(`${window.location.origin}${basePath}/assets/audio/${audioFile}`);
        resolveAudio.volume = 0.7 * getMasterVolume();
        resolveAudio.play().catch(error => console.log("Erro ao reproduzir áudio de resolução:", error));

        setTimeout(() => {
            imgEl.style.display = "none";
            bgTextImg.src = `${window.location.origin}${basePath}/assets/images/menus/bg.stress.text.png`;
            textContainer.className = `resolve-text-wrapper is-${chosen.type === "virtuous" ? "virtue" : "affliction"}`;
            textSpan.textContent = chosen.type === "virtuous" ? "Virtuoso!" : "Aflito!";
            textContainer.style.display = "inline-flex";

            setTimeout(() => {
                overlay.style.display = "none";
                if (stressConditionName) stressConditionName.textContent = chosen.name;
                if (stressConditionDesc) stressConditionDesc.textContent = chosen.desc;
                if (headerStressCondition) headerStressCondition.textContent = chosen.name;
                stressConditionBox?.classList.remove("is-virtuous", "is-afflicted");
                stressConditionBox?.classList.add(`is-${chosen.type}`);
                setAfflictedVisuals(chosen.type === "afflicted");
                if (virtuousOverlay) virtuousOverlay.style.display = chosen.type === "virtuous" ? "block" : "none";
                if (stressOverlay) stressOverlay.style.display = chosen.type === "afflicted" ? "block" : "none";
                localStorage.setItem(CONFIG.STORAGE_KEYS.ACTIVE_CONDITION, JSON.stringify(chosen));
                localStorage.setItem(CONFIG.STORAGE_KEYS.RESOLVE_STATE, chosen.type);
            }, 2500);
        }, 2600);

        rollStressBtn?.classList.remove("glow-ready");
    }

    stressRange?.addEventListener("input", () => updateStress(stressRange.value));
    stressNumberInput?.addEventListener("input", () => updateStress(stressNumberInput.value));
    stressRange?.addEventListener('change', finishStressEdit);
    stressNumberInput?.addEventListener('change', finishStressEdit);
    rollStressBtn?.addEventListener("click", resolveCondition);

    updateStress(stressNumberInput?.value || 0);
    applySavedCondition();
    isStarting = false;
}
