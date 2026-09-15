import { CONFIG } from './config.js';

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

        if (saveState) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ACTIVE_TAB, targetId);
        }
    }

    // Ouve os cliques nos botões de aba
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-tab");
            switchTab(targetId, true);
        });
    });

    const savedTab = localStorage.getItem(CONFIG.STORAGE_KEYS.ACTIVE_TAB);
    if (savedTab && document.getElementById(savedTab)) {
        switchTab(savedTab, false);
    }
}