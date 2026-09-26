import { CONFIG } from '../../core/config.js';
import { playSound } from '../../core/audio.js';
import { createListItem, getListItemType } from '../../core/listItems.js';
import { addLibraryEntry, getLibraryEntries, hasLibraryEntry, onLibraryChange, removeLibraryEntry } from '../../core/library.js';
import { initLibraryModal, openLibraryModal } from './libraryModal.js';

// Listas pessoais e a categoria correspondente na lista global.
const PERSONAL_LISTS = {
    proficienciesList: { category: 'proficiencies', label: 'Proficiências' },
    talentsList: { category: 'talents', label: 'Talentos' },
    languagesList: { category: 'languages', label: 'Idiomas' },
    diseasesList: { category: 'diseases', label: 'Doenças' },
    traitsList: { category: 'traits', label: 'Traços e Manias' }
};

const ROW_SELECTOR = '.stringItemRow, .cardItemBox';

function getRowName(row) {
    return row.querySelector('input[type="text"]')?.value ?? '';
}

// Marca os botões "+ Lista" dos itens que já existem na lista global.
function refreshLibraryButtons(container) {
    const category = PERSONAL_LISTS[container.id]?.category;
    if (!category) return;

    container.querySelectorAll('.libraryAddBtn').forEach(button => {
        const row = button.closest(ROW_SELECTOR);
        const inLibrary = row ? hasLibraryEntry(category, getRowName(row)) : false;

        button.classList.toggle('is-in-library', inLibrary);
        button.disabled = inLibrary;
        button.textContent = inLibrary ? '✓ Lista' : '+ Lista';
        button.title = inLibrary ? 'Já está na lista global' : 'Adicionar à lista global';
    });
}

// Chamado após a restauração da ficha, quando os itens salvos já foram recriados.
export function refreshAllLibraryButtons() {
    Object.keys(PERSONAL_LISTS).forEach(listId => {
        const container = document.getElementById(listId);
        if (container) refreshLibraryButtons(container);
    });
}

export function initPersonalListeners() {
    const MAX_ITEMS = CONFIG.LIMITS.MAX_DYNAMIC_ITEMS;

    initLibraryModal();

    function isListFull(container) {
        if (container.children.length < MAX_ITEMS) return false;

        playSound('clickInvalid');
        alert(`Você atingiu o limite máximo de ${MAX_ITEMS} itens para esta lista.`);
        return true;
    }

    function appendItem(container, data, { focus = false } = {}) {
        if (isListFull(container)) return;

        const item = createListItem(getListItemType(container), data);
        container.appendChild(item);
        refreshLibraryButtons(container);

        const nameInput = item.querySelector('input[type="text"]');
        // "input" faz o armazenamento salvar a lista com o novo item.
        nameInput?.dispatchEvent(new Event('input', { bubbles: true }));
        if (focus) nameInput?.focus();
    }

    async function addRowToLibrary(button, container) {
        const row = button.closest(ROW_SELECTOR);
        const category = PERSONAL_LISTS[container.id]?.category;
        if (!row || !category) return;

        const result = await addLibraryEntry(category, {
            name: getRowName(row),
            desc: row.querySelector('textarea')?.value ?? ''
        });

        if (result.status === 'invalid') {
            playSound('clickInvalid');
            row.querySelector('input[type="text"]')?.focus();
        } else if (result.status === 'error') {
            playSound('clickInvalid');
            alert('Não foi possível salvar na lista global.');
        }

        refreshLibraryButtons(container);
    }

    document.querySelectorAll('.addItemBtn[data-target]').forEach(button => {
        const container = document.getElementById(button.getAttribute('data-target'));
        const config = container ? PERSONAL_LISTS[container.id] : null;
        if (!container || !config) return;

        // Delegação: também vale para itens restaurados do localStorage.
        container.addEventListener('click', event => {
            const removeButton = event.target.closest('.removeItemBtn');
            if (removeButton) {
                removeButton.closest(ROW_SELECTOR)?.remove();
                return;
            }

            const libraryButton = event.target.closest('.libraryAddBtn');
            if (libraryButton && !libraryButton.disabled) addRowToLibrary(libraryButton, container);
        });

        container.addEventListener('input', event => {
            if (event.target.matches('input[type="text"]')) refreshLibraryButtons(container);
        });

        onLibraryChange(category => {
            if (category === config.category) refreshLibraryButtons(container);
        });

        button.addEventListener('click', () => {
            if (isListFull(container)) return;

            openLibraryModal({
                label: config.label,
                getEntries: () => getLibraryEntries(config.category),
                onCreateNew: () => appendItem(container, {}, { focus: true }),
                onPick: entry => appendItem(container, { text: entry.name, desc: entry.desc }),
                onRemove: entry => removeLibraryEntry(config.category, entry.id)
            });
        });
    });
}
