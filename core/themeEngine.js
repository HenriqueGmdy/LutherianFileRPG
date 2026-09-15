import { CONFIG } from './config.js';
import { playSound } from './audio.js';

function readJSON(key, fallback = {}) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

export function initThemeEngine() {
    const menuBtn = document.getElementById('optionsMenuBtn');
    const dropdown = document.getElementById('optionsDropdown');
    const themePanel = document.getElementById('themeCustomizerPanel');
    const themeOptBtn = document.getElementById('menuOptTheme');
    const menuCloseBtn = document.getElementById('menuCloseBtn');
    const themeCloseBtn = document.getElementById('themeCloseBtn');
    
    // Elementos do Modal de Reset
    const resetOptBtn = document.getElementById('menuOptReset');
    const resetModal = document.getElementById('resetConfirmModal');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    let dragState = null;
    let suppressOutsideClick = false;

    const closePanels = () => {
        if (dropdown) dropdown.style.display = 'none';
        if (themePanel) themePanel.style.display = 'none';
    };

    // Abre/fecha o menu principal de opções
    if (menuBtn && dropdown && themePanel) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === 'block' || themePanel.style.display === 'block';
            if (isOpen) {
                closePanels();
                playSound('closeMenu');
            } else {
                dropdown.style.display = 'block';
                themePanel.style.display = 'none';
                playSound('openMenu');
            }
        });
    }

    menuCloseBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        closePanels();
        playSound('closeMenu');
    });

    themeCloseBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        if (themePanel) themePanel.style.display = 'none';
        if (dropdown) dropdown.style.display = 'block';
        playSound('colorClose');
    });

    const bindDrag = (panel, excludedSelectors) => {
        panel?.addEventListener('mousedown', (event) => {
            if (event.button !== 0 || event.target.closest(excludedSelectors)) return;

            const panelRect = panel.getBoundingClientRect();
            dragState = {
                panel,
                offsetX: event.clientX - panelRect.left,
                offsetY: event.clientY - panelRect.top
            };
            suppressOutsideClick = false;
            panel.style.position = 'fixed';
            panel.style.left = `${panelRect.left}px`;
            panel.style.top = `${panelRect.top}px`;
            panel.style.right = 'auto';
            event.preventDefault();
        });
    };

    bindDrag(dropdown, 'button, input, label');
    bindDrag(themePanel, 'button, input, label');

    document.addEventListener('mousemove', (event) => {
        if (!dragState) return;

        const panel = dragState.panel;
        const panelRect = panel.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - panelRect.width);
        const maxTop = Math.max(0, window.innerHeight - panelRect.height);
        const left = Math.min(Math.max(0, event.clientX - dragState.offsetX), maxLeft);
        const top = Math.min(Math.max(0, event.clientY - dragState.offsetY), maxTop);

        suppressOutsideClick = true;
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
    });

    document.addEventListener('mouseup', () => {
        dragState = null;
    });

    // Clicar em "Personalizar Tema" esconde o menu principal e abre o painel de cores
    if (themeOptBtn && dropdown && themePanel) {
        themeOptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
            themePanel.style.display = 'block';
            playSound('colorOpen');
        });
    }

    // Clicar em "Resetar Ficha" fecha o menu e abre o Modal de Aviso
    if (resetOptBtn && resetModal && dropdown) {
        resetOptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
            resetModal.style.display = 'flex';
        });
    }

    // Botão Cancelar do Modal
    if (cancelResetBtn && resetModal) {
        cancelResetBtn.addEventListener('click', () => {
            resetModal.style.display = 'none';
        });
    }

    // Botão Confirmar do Modal (Apaga tudo e reinicia)
    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', () => {
            window.__lutherianResetInProgress = true;
            const sheetKeys = [
                CONFIG.STORAGE_KEYS.SHEET_DATA,
                CONFIG.STORAGE_KEYS.DYNAMIC_LISTS,
                CONFIG.STORAGE_KEYS.IMAGE,
                CONFIG.STORAGE_KEYS.ACTIVE_CONDITION,
                CONFIG.STORAGE_KEYS.RESOLVE_STATE
            ];

            sheetKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            const resetAudio = playSound('fileReseted');
            let hasReloaded = false;
            const reloadAfterResetAudio = () => {
                if (hasReloaded) return;
                hasReloaded = true;
                location.reload();
            };

            resetAudio?.addEventListener('ended', reloadAfterResetAudio, { once: true });
            window.setTimeout(reloadAfterResetAudio, 5000);
        });
    }

    document.addEventListener('click', (e) => {
        if (suppressOutsideClick) {
            suppressOutsideClick = false;
            return;
        }

        if (resetModal && resetModal.style.display === 'flex') return;

        if (dropdown && themePanel && menuBtn) {
            if (!dropdown.contains(e.target) && !themePanel.contains(e.target) && e.target !== menuBtn) {
                const wasThemeOpen = themePanel.style.display === 'block';
                const wasMenuOpen = dropdown.style.display === 'block';
                closePanels();
                if (wasThemeOpen) playSound('colorClose');
                else if (wasMenuOpen) playSound('closeMenu');
            }
        }
    });

    const rootStyles = document.documentElement.style;

    // VALORES PADRÃO
    const defaultColors = {
        colorBgMain: '#141414',
        colorBgFieldset: '#1c1c1c',
        colorBgInputs: '#2b2b2b',
        colorText: '#ffffff',
        colorAccent: '#ffcc00',
        colorNegative: '#c00101',
        colorPositive: '#ffcc00',
        colorLines: '#ffffff',
        colorAfflictionText: '#8b0000',
        colorVirtueText: '#ffffff'
    };

    let savedTheme = readJSON(CONFIG.STORAGE_KEYS.THEME);
    
    const applyColor = (key, cssVar, defaultVal) => {
        const val = savedTheme[key] || defaultVal;
        rootStyles.setProperty(cssVar, val);
        const input = document.getElementById(key);
        if (input) input.value = val;
        const preview = document.getElementById(`preview${key.charAt(0).toUpperCase()}${key.slice(1)}`);
        if (preview) preview.style.backgroundColor = val;
    };

    const applyAllColors = (themeSource) => {
        applyColor('colorBgMain', '--bg-main', themeSource.colorBgMain || defaultColors.colorBgMain);
        applyColor('colorBgFieldset', '--bg-fieldset', themeSource.colorBgFieldset || defaultColors.colorBgFieldset);
        applyColor('colorBgInputs', '--bg-inputs', themeSource.colorBgInputs || defaultColors.colorBgInputs);
        applyColor('colorText', '--text-color', themeSource.colorText || defaultColors.colorText);
        applyColor('colorAccent', '--accent-color', themeSource.colorAccent || defaultColors.colorAccent);
        applyColor('colorNegative', '--negative-color', themeSource.colorNegative || defaultColors.colorNegative);
        applyColor('colorPositive', '--positive-color', themeSource.colorPositive || defaultColors.colorPositive);
        applyColor('colorLines', '--line-color', themeSource.colorLines || defaultColors.colorLines);
        applyColor('colorAfflictionText', '--resolve-affliction-text', themeSource.colorAfflictionText || defaultColors.colorAfflictionText);
        applyColor('colorVirtueText', '--resolve-virtue-text', themeSource.colorVirtueText || defaultColors.colorVirtueText);
    };

    applyAllColors(savedTheme);

    const updateColor = (property, value, key) => {
        rootStyles.setProperty(property, value);
        savedTheme[key] = value;
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, JSON.stringify(savedTheme));
        const preview = document.getElementById(`preview${key.charAt(0).toUpperCase()}${key.slice(1)}`);
        if (preview) preview.style.backgroundColor = value;
    };

    const bindColorInput = (id, cssVar, key) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => updateColor(cssVar, e.target.value, key));
        }
    };

    bindColorInput('colorBgMain', '--bg-main', 'colorBgMain');
    bindColorInput('colorBgFieldset', '--bg-fieldset', 'colorBgFieldset');
    bindColorInput('colorBgInputs', '--bg-inputs', 'colorBgInputs');
    bindColorInput('colorText', '--text-color', 'colorText');
    bindColorInput('colorAccent', '--accent-color', 'colorAccent');
    bindColorInput('colorNegative', '--negative-color', 'colorNegative');
    bindColorInput('colorPositive', '--positive-color', 'colorPositive');
    bindColorInput('colorLines', '--line-color', 'colorLines');
    bindColorInput('colorAfflictionText', '--resolve-affliction-text', 'colorAfflictionText');
    bindColorInput('colorVirtueText', '--resolve-virtue-text', 'colorVirtueText');

    const resetThemeBtn = document.getElementById('resetThemeBtn');
    if (resetThemeBtn) {
        resetThemeBtn.addEventListener('click', () => {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.THEME);
            savedTheme = {};

            applyAllColors(defaultColors);

            if (themePanel && dropdown) {
                themePanel.style.display = 'none';
                dropdown.style.display = 'block';
            }
        });
    }
}