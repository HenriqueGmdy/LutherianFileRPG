import { playSound } from '../../core/audio.js';

export function initThreat() {
    const threatLevelSelect = document.getElementById("threatLevel");
    const threatMeterVisual = document.getElementById("threatMeterVisual");
    const threatLevelIcon = document.getElementById("threatLevelIcon");

    const threatIcons = {
        nulo: { file: "null.png", label: "Nulo" },
        sublime: { file: "sublime.png", label: "Sublime" },
        besta: { file: "beast.png", label: "Besta" },
        demonio: { file: "demon.png", label: "Demônio" },
        anciao: { file: "ancient.png", label: "Ancião" },
        radiante: { file: "radiant.png", label: "Radiante" }
    };

    function updateThreatMeter() {
        if (!threatMeterVisual) return;

        const threatHeights = {
            nulo: "0%",
            sublime: "20%",
            besta: "40%",
            demonio: "60%",
            anciao: "80%",
            radiante: "100%"
        };
        const height = threatHeights[threatLevelSelect?.value] || "0%";

        threatMeterVisual.style.setProperty('--threat-level', height);

        const threatIcon = threatIcons[threatLevelSelect?.value] || threatIcons.nulo;
        if (threatLevelIcon) {
            threatLevelIcon.src = `assets/images/threat/${threatIcon.file}`;
            threatLevelIcon.alt = `Nível de ameaça: ${threatIcon.label}`;
        }
    }

    threatLevelSelect?.addEventListener("change", (event) => {
        const levels = Object.keys(threatIcons);
        const previousLevel = levels.indexOf(event.target.dataset.previousThreat || event.target.value);
        const currentLevel = levels.indexOf(event.target.value);
        if (currentLevel > previousLevel) playSound('threatIncrease');
        event.target.dataset.previousThreat = event.target.value;
        updateThreatMeter();
    });
    if (threatLevelSelect) threatLevelSelect.dataset.previousThreat = threatLevelSelect.value;
    updateThreatMeter();
}
