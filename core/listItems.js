// Construtor único dos itens das listas dinâmicas (pessoais e inventário), usado tanto ao
// adicionar quanto ao restaurar do armazenamento. Tipos: 'string', 'card' e 'inventory'.

function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

const LIBRARY_BUTTON = '<button type="button" class="libraryAddBtn" title="Adicionar à lista global" aria-label="Adicionar à lista global">+ Lista</button>';
const EXIT_ICON = '<img src="assets/images/general/button.exit.red.png" alt="">';
const REMOVE_BUTTON = `<button type="button" class="removeItemBtn" title="Remover" aria-label="Remover item">${EXIT_ICON}</button>`;

const TEMPLATES = {
    string: {
        className: 'stringItemRow',
        html: `
            <input type="text" placeholder="Digite o nome..." class="personal-input">
            ${LIBRARY_BUTTON}
            ${REMOVE_BUTTON}
        `
    },
    card: {
        className: 'cardItemBox',
        html: `
            <div class="cardItemTop">
                <input type="text" placeholder="Nome / Título..." class="personal-input">
                ${LIBRARY_BUTTON}
                ${REMOVE_BUTTON}
            </div>
            <textarea placeholder="Descrição..."></textarea>
        `
    },
    inventory: {
        className: 'inventoryItemCard cardItemBox',
        html: `
            <div class="inventoryItemTop">
                <input type="text" placeholder="Nome do item..." class="item-name-input">
                <label class="itemMetaLabel">Qtd:</label>
                <input type="number" min="0" class="item-qty-input">
                <label class="itemMetaLabel">Peso:</label>
                <input type="number" min="0" step="0.5" class="item-weight-input">
                <button type="button" class="removeItemBtn" title="Excluir" aria-label="Excluir item">${EXIT_ICON}</button>
            </div>
            <textarea placeholder="Descrição do item..."></textarea>
        `
    }
};

export function getListItemType(container) {
    if (container.id === 'inventoryItemsList') return 'inventory';
    return container.classList.contains('cardList') ? 'card' : 'string';
}

// data: { text, qty, weight, desc }
export function createListItem(type, data = {}) {
    const template = TEMPLATES[type] ?? TEMPLATES.string;
    const item = document.createElement('div');
    item.className = template.className;
    item.innerHTML = template.html;

    const textInput = item.querySelector('input[type="text"]');
    const numberInputs = item.querySelectorAll('input[type="number"]');
    const textarea = item.querySelector('textarea');

    if (textInput) textInput.value = String(data?.text ?? '');
    if (numberInputs[0]) numberInputs[0].value = safeNumber(data?.qty, 1);
    if (numberInputs[1]) numberInputs[1].value = safeNumber(data?.weight, 0);
    if (textarea) textarea.value = String(data?.desc ?? '');

    return item;
}
