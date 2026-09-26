import { classesData } from './classesData.js';
import { playSound } from '../../core/audio.js';

const CLEAR_OPTION_LABEL = 'Nenhuma classe';
const EMPTY_TEXT = 'Selecione uma classe para ver a habilidade de fogueira.';
const CUSTOM_TEXT = 'Classe personalizada: sem habilidade de fogueira automática.';

function normalize(text) {
    return String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

const classKeyByName = Object.fromEntries(
    Object.entries(classesData).map(([key, data]) => [normalize(data.name), key])
);

export function initClasses() {
    const pickerButton = document.getElementById('classPickerBtn');
    const classInput = document.getElementById('characterClass');
    const campfireText = document.getElementById('classCampfireText');
    const row = pickerButton?.closest('.charClassRow');

    if (!pickerButton || !classInput || !campfireText || !row) return;

    // A caixa de fogueira é sempre derivada da classe escolhida (nunca digitada nem salva).
    function renderCampfire() {
        const key = classKeyByName[normalize(classInput.value)];
        const data = classesData[key];

        campfireText.replaceChildren();
        campfireText.classList.toggle('is-empty', !data);

        if (data) {
            const title = document.createElement('strong');
            title.textContent = data.campfireName;
            campfireText.append(title, document.createElement('br'), document.createTextNode(data.campfireSkill));
        } else {
            campfireText.textContent = classInput.value.trim() ? CUSTOM_TEXT : EMPTY_TEXT;
        }

        markSelectedOption(key ?? '');
    }

    const menu = document.createElement('div');
    menu.id = 'classPickerMenu';
    menu.className = 'classPickerMenu scrollArrows';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'Classes');
    menu.hidden = true;

    const optionEntries = [
        ...Object.entries(classesData).map(([key, data]) => [key, data.name]),
        ['', CLEAR_OPTION_LABEL]
    ];

    optionEntries.forEach(([key, label]) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = key ? 'classPickerOption' : 'classPickerOption classPickerOption--clear';
        option.setAttribute('role', 'option');
        option.dataset.classKey = key;
        option.dataset.audioHandled = 'true';
        option.textContent = label;
        menu.appendChild(option);
    });

    row.appendChild(menu);
    pickerButton.setAttribute('aria-controls', menu.id);

    const options = [...menu.querySelectorAll('.classPickerOption')];

    function markSelectedOption(selectedKey) {
        options.forEach(option => {
            const isSelected = option.dataset.classKey === selectedKey && (selectedKey !== '' || !classInput.value.trim());
            option.classList.toggle('is-selected', isSelected);
            option.setAttribute('aria-selected', String(isSelected));
        });
    }

    function setMenuOpen(open, { focusOption = false } = {}) {
        menu.hidden = !open;
        pickerButton.setAttribute('aria-expanded', String(open));

        if (open && focusOption) {
            (menu.querySelector('.is-selected') || options[0]).focus();
        }
    }

    function selectClass(key) {
        classInput.value = classesData[key]?.name ?? '';
        classInput.dispatchEvent(new Event('input', { bubbles: true }));
        classInput.dispatchEvent(new Event('change', { bubbles: true }));
        playSound('select');
        setMenuOpen(false);
        pickerButton.focus();
    }

    pickerButton.addEventListener('click', () => setMenuOpen(menu.hidden));
    classInput.addEventListener('click', () => setMenuOpen(menu.hidden));
    classInput.addEventListener('change', renderCampfire);

    menu.addEventListener('click', event => {
        const option = event.target.closest('.classPickerOption');
        if (option) selectClass(option.dataset.classKey);
    });

    pickerButton.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setMenuOpen(true, { focusOption: true });
        }
    });

    menu.addEventListener('keydown', event => {
        const index = options.indexOf(document.activeElement);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            options[(index + 1) % options.length].focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            options[(index - 1 + options.length) % options.length].focus();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !menu.hidden) {
            setMenuOpen(false);
            pickerButton.focus();
        }
    });

    document.addEventListener('click', event => {
        if (!menu.hidden && !menu.contains(event.target) && !pickerButton.contains(event.target) && event.target !== classInput) {
            setMenuOpen(false);
        }
    });

    renderCampfire();
}
