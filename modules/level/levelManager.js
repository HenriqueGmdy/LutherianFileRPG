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

        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        const imageUrl = `${window.location.origin}${basePath}/assets/images/levels/${fileName}`;

        container.style.backgroundImage = `url('${imageUrl}?v=${Date.now()}')`;
    }

    levelInput.addEventListener('input', (e) => {
        updateEmblem(e.target.value);
    });

    updateEmblem(levelInput.value);
}