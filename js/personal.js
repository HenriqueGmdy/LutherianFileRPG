export function initPersonalListeners() {
    const MAX_ITEMS = 10;

    // Função genérica para adicionar elementos dinâmicos
    function addItem(listId, type) {
        const container = document.getElementById(listId);
        if (!container) return;

        // Limita a 10 elementos por lista
        if (container.children.length >= MAX_ITEMS) {
            alert("Você atingiu o limite máximo de 10 itens para esta lista.");
            return;
        }

        const itemDiv = document.createElement("div");

        if (type === "string") {
            itemDiv.className = "stringItemRow";
            itemDiv.innerHTML = `
                <input type="text" placeholder="Digite o nome..." class="personal-input">
                <button type="button" class="removeItemBtn" title="Remover">X</button>
            `;
        } else if (type === "card") {
            itemDiv.className = "cardItemBox";
            itemDiv.innerHTML = `
                <div class="cardItemTop">
                    <input type="text" placeholder="Nome / Título..." class="personal-input">
                    <button type="button" class="removeItemBtn" title="Remover">X</button>
                </div>
                <textarea placeholder="Descrição..."></textarea>
            `;
        }

        // Evento do botão de remover
        itemDiv.querySelector(".removeItemBtn").addEventListener("click", () => {
            itemDiv.remove();
        });

        container.appendChild(itemDiv);
    }

    // Ouve os cliques nos botões de "+ Adicionar"
    document.querySelectorAll(".addItemBtn").forEach(btn => {
        btn.addEventListener("click", function() {
            const targetId = this.getAttribute("data-target");
            // Define o tipo de acordo com a classe da lista
            const container = document.getElementById(targetId);
            if (container.classList.contains("stringList")) {
                addItem(targetId, "string");
            } else if (container.classList.contains("cardList")) {
                addItem(targetId, "card");
            }
        });
    });
}