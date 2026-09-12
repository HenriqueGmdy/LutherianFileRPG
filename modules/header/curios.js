export function initCurios() {
    const nameInput = document.getElementById("name");
    const audio = document.getElementById("easterEggAudio");

    if (!nameInput || !audio) return;

    nameInput.addEventListener("input", (e) => {
        const valorDigitado = e.target.value.trim();
        
        if (valorDigitado.toLowerCase() === "chacal") {
            if (audio.paused) {
                audio.currentTime = 0;
                audio.play().catch(err => console.log("Áudio bloqueado pelo navegador:", err));
            }
        }
    });
}