export function initLevelEmblem() {
    const levelInput = document.getElementById('level');
    const container = document.getElementById('levelEmblemContainer');

    if (!levelInput || !container) return;

    function updateEmblem(val) {
        const num = parseInt(val) || 1;
        let fileName = 'level1_2.png';

        if (num >= 3 && num <= 9) {
            fileName = `level${num}.png`;
        } else {
            fileName = 'level1_2.png';
        }

        // Adicionamos ?v=Date.now() para impedir que o navegador pegue a imagem corrompida/antiga do cache
        container.style.backgroundImage = `url('assets/images/levels/${fileName}?v=${Date.now()}')`;
    }

    levelInput.addEventListener('input', (e) => {
        updateEmblem(e.target.value);
    });

    updateEmblem(levelInput.value);
}