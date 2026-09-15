export function initThreat() {
    const threatLevelSelect = document.getElementById("threatLevel");
    const threatMeterVisual = document.getElementById("threatMeterVisual");

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

        threatMeterVisual.style.background =
            `linear-gradient(to top, #ff4d4d ${height}, #111 ${height})`;
    }

    threatLevelSelect?.addEventListener("change", updateThreatMeter);
    updateThreatMeter();
}
