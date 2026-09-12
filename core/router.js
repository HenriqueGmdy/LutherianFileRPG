export function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tabContent");

    if (tabButtons.length === 0) return;

    function switchTab(targetId, saveState = true) {
        tabButtons.forEach(btn => {
            if (btn.getAttribute("data-tab") === targetId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        tabContents.forEach(content => {
            if (content.id === targetId) {
                content.classList.add("active");
                content.style.display = "block";
            } else {
                content.classList.remove("active");
                content.style.display = "none";
            }
        });

        // Salva a aba ativa no localStorage para persistir no F5
        if (saveState) {
            localStorage.setItem('lutherian_active_tab', targetId);
        }
    }

    // Ouve os cliques nos botões de aba
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-tab");
            switchTab(targetId, true);
        });
    });

    // Ao iniciar, restaura a última aba ativa salva ou mantém a padrão
    const savedTab = localStorage.getItem('lutherian_active_tab');
    if (savedTab && document.getElementById(savedTab)) {
        switchTab(savedTab, false);
    }
}