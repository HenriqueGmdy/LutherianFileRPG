import { CONFIG } from '../../core/config.js';
import { playSound } from '../../core/audio.js';

export function initPersonalListeners() {
    const MAX_ITEMS = CONFIG.LIMITS.MAX_DYNAMIC_ITEMS;

    // Função genérica para adicionar elementos dinâmicos
    function addItem(listId, type) {
        const container = document.getElementById(listId);
        if (!container) return;

        if (container.children.length >= MAX_ITEMS) {
            playSound('clickInvalid');
            alert(`Você atingiu o limite máximo de ${MAX_ITEMS} itens para esta lista.`);
            return;
        }

        const itemDiv = document.createElement("div");

        if (type === "string") {
            itemDiv.className = "stringItemRow";
            itemDiv.innerHTML = `
                <input type="text" placeholder="Digite o nome..." class="personal-input">
                <button type="button" class="removeItemBtn" title="Remover" aria-label="Remover item">X</button>
            `;
        } else if (type === "card") {
            itemDiv.className = "cardItemBox";
            itemDiv.innerHTML = `
                <div class="cardItemTop">
                    <input type="text" placeholder="Nome / Título..." class="personal-input">
                    <button type="button" class="removeItemBtn" title="Remover" aria-label="Remover item">X</button>
                </div>
                <textarea placeholder="Descrição..."></textarea>
            `;
        }

        container.appendChild(itemDiv);
    }

    // Ouve os cliques nos botões de "+ Adicionar" (a lista de itens do inventário é tratada em inventory.js)
    document.querySelectorAll(".addItemBtn[data-target]").forEach(btn => {
        const targetId = btn.getAttribute("data-target");
        const container = document.getElementById(targetId);
        if (!container) return;

        // Delegação: também remove itens restaurados do localStorage.
        container.addEventListener("click", event => {
            const removeButton = event.target.closest(".removeItemBtn");
            if (!removeButton) return;
            removeButton.closest(".stringItemRow, .cardItemBox")?.remove();
        });

        btn.addEventListener("click", () => {
            if (container.classList.contains("stringList")) {
                addItem(targetId, "string");
            } else if (container.classList.contains("cardList")) {
                addItem(targetId, "card");
            }
        });
    });
}
