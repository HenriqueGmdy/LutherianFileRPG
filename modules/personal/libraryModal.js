import { playSound } from '../../core/audio.js';

const EMPTY_TEXT = 'Nenhum item na lista ainda. Crie um novo e use o botão "+ Lista" no bloco para adicioná-lo aqui.';
const REMOVE_ICON = 'assets/images/general/remove.icon.png';

let modal = null;
let titleElement = null;
let pickerTitleElement = null;
let choiceView = null;
let pickerView = null;
let optionsElement = null;
let emptyElement = null;

let deleteModal = null;
let deleteMessageElement = null;
let deleteConfirmButton = null;
let deleteCancelButton = null;
let resolveDelete = null;

let session = null;

function isOpen() {
    return Boolean(modal) && modal.style.display === 'flex';
}

function isDeleteOpen() {
    return Boolean(deleteModal) && deleteModal.style.display === 'flex';
}

function showChoice() {
    choiceView.hidden = false;
    pickerView.hidden = true;
    choiceView.querySelector('[data-library-action="new"]')?.focus();
}

function buildRow(entry) {
    const row = document.createElement('div');
    row.className = 'libraryRow';

    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'libraryOption';
    option.dataset.entryId = entry.id;
    option.dataset.audioHandled = 'true';

    const name = document.createElement('span');
    name.className = 'libraryOptionName';
    name.textContent = entry.name;
    option.appendChild(name);

    if (entry.desc) {
        const preview = document.createElement('small');
        preview.className = 'libraryOptionDesc';
        preview.textContent = entry.desc;
        option.appendChild(preview);
    }

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'libraryRemoveBtn';
    remove.dataset.entryId = entry.id;
    remove.title = 'Apagar da lista global';
    remove.setAttribute('aria-label', `Apagar "${entry.name}" da lista global`);

    const icon = document.createElement('img');
    icon.src = REMOVE_ICON;
    icon.alt = '';
    remove.appendChild(icon);

    row.append(option, remove);
    return row;
}

function renderOptions() {
    session.entries = session.getEntries().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));

    optionsElement.replaceChildren(...session.entries.map(buildRow));
    emptyElement.hidden = session.entries.length > 0;
    optionsElement.hidden = session.entries.length === 0;
}

function showPicker() {
    renderOptions();
    choiceView.hidden = true;
    pickerView.hidden = false;
    (optionsElement.querySelector('.libraryOption') ?? pickerView.querySelector('[data-library-action="back"]')).focus();
}

function closeModal({ restoreFocus = true } = {}) {
    if (!isOpen()) return;

    const opener = session?.opener;
    modal.style.display = 'none';
    session = null;

    if (restoreFocus && opener instanceof HTMLElement) opener.focus();
}

function settleDelete(confirmed) {
    if (!isDeleteOpen()) return;

    deleteModal.style.display = 'none';
    const resolve = resolveDelete;
    resolveDelete = null;
    resolve?.(confirmed);
}

function askDeleteConfirmation(entryName) {
    deleteMessageElement.textContent = `Tem certeza que deseja apagar "${entryName}" da lista global?`;
    deleteModal.style.display = 'flex';
    deleteCancelButton.focus();

    return new Promise(resolve => { resolveDelete = resolve; });
}

async function requestRemove(entry) {
    const confirmed = await askDeleteConfirmation(entry.name);
    if (!confirmed || !session) return;

    const result = await session.onRemove(entry);
    if (result?.status === 'error') {
        playSound('clickInvalid');
        alert('Não foi possível apagar da lista global.');
    }

    if (!session) return;
    renderOptions();
    (optionsElement.querySelector('.libraryOption') ?? pickerView.querySelector('[data-library-action="back"]')).focus();
}

export function initLibraryModal() {
    modal = document.getElementById('libraryModal');
    if (!modal) return;

    titleElement = modal.querySelector('#libraryModalTitle');
    pickerTitleElement = modal.querySelector('#libraryPickerTitle');
    choiceView = modal.querySelector('#libraryModalChoice');
    pickerView = modal.querySelector('#libraryModalPicker');
    optionsElement = modal.querySelector('#libraryOptions');
    emptyElement = modal.querySelector('#libraryEmpty');

    deleteModal = document.getElementById('libraryDeleteModal');
    deleteMessageElement = document.getElementById('libraryDeleteMessage');
    deleteConfirmButton = document.getElementById('libraryDeleteConfirm');
    deleteCancelButton = document.getElementById('libraryDeleteCancel');

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal();
            return;
        }

        const actionButton = event.target.closest('[data-library-action]');
        if (!actionButton || !session) return;

        const action = actionButton.dataset.libraryAction;
        if (action === 'new') {
            const { onCreateNew } = session;
            closeModal({ restoreFocus: false });
            onCreateNew();
        } else if (action === 'pick') {
            showPicker();
        } else if (action === 'back') {
            showChoice();
        } else if (action === 'close') {
            closeModal();
        }
    });

    optionsElement.addEventListener('click', event => {
        if (!session) return;

        const removeButton = event.target.closest('.libraryRemoveBtn');
        if (removeButton) {
            const entry = session.entries.find(candidate => candidate.id === removeButton.dataset.entryId);
            if (entry) requestRemove(entry);
            return;
        }

        const option = event.target.closest('.libraryOption');
        if (!option) return;

        const entry = session.entries.find(candidate => candidate.id === option.dataset.entryId);
        if (!entry) return;

        const { onPick } = session;
        playSound('select');
        closeModal({ restoreFocus: false });
        onPick(entry);
    });

    deleteConfirmButton?.addEventListener('click', () => settleDelete(true));
    deleteCancelButton?.addEventListener('click', () => settleDelete(false));
    deleteModal?.addEventListener('click', event => {
        if (event.target === deleteModal) settleDelete(false);
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;

        // O aviso de exclusão fica por cima do modal de adicionar: Esc fecha primeiro o de cima.
        if (isDeleteOpen()) settleDelete(false);
        else if (isOpen()) closeModal();
    });
}

// getEntries(): itens da lista global da categoria (relido a cada renderização);
// onCreateNew() / onPick(entry) rodam após fechar; onRemove(entry) apaga da lista global.
export function openLibraryModal({ label, getEntries, onCreateNew, onPick, onRemove }) {
    if (!modal) return false;

    session = { entries: [], getEntries, onCreateNew, onPick, onRemove, opener: document.activeElement };

    titleElement.textContent = `Adicionar · ${label}`;
    pickerTitleElement.textContent = label;
    emptyElement.textContent = EMPTY_TEXT;
    modal.style.display = 'flex';
    showChoice();
    return true;
}
