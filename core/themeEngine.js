export function initThemeEngine() {
    const menuBtn = document.getElementById('optionsMenuBtn');
    const dropdown = document.getElementById('optionsDropdown');
    const themePanel = document.getElementById('themeCustomizerPanel');
    const themeOptBtn = document.getElementById('menuOptTheme');
    const backBtn = document.getElementById('backToMenuBtn');
    
    // Elementos do Modal de Reset
    const resetOptBtn = document.getElementById('menuOptReset');
    const resetModal = document.getElementById('resetConfirmModal');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    // Abre/fecha o menu principal de opções ao clicar nas três bolinhas
    if (menuBtn && dropdown && themePanel) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === 'block' || themePanel.style.display === 'block';
            if (isOpen) {
                dropdown.style.display = 'none';
                themePanel.style.display = 'none';
            } else {
                dropdown.style.display = 'block';
                themePanel.style.display = 'none';
            }
        });
    }

    // Clicar em "Personalizar Tema" esconde o menu principal e abre o painel de cores
    if (themeOptBtn && dropdown && themePanel) {
        themeOptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
            themePanel.style.display = 'block';
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
            localStorage.clear();
            location.reload();
        });
    }

    // Botão de "Voltar" dentro do painel de cores retorna ao menu de opções
    if (backBtn && themePanel && dropdown) {
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themePanel.style.display = 'none';
            dropdown.style.display = 'block';
        });
    }

    document.addEventListener('click', (e) => {
        if (resetModal && resetModal.style.display === 'flex') return;

        if (dropdown && themePanel && menuBtn) {
            if (!dropdown.contains(e.target) && !themePanel.contains(e.target) && e.target !== menuBtn) {
                dropdown.style.display = 'none';
                themePanel.style.display = 'none';
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
        colorLines: '#ffffff'
    };

    let savedTheme = JSON.parse(localStorage.getItem('lutherian_theme')) || {};
    
    const applyColor = (key, cssVar, defaultVal) => {
        const val = savedTheme[key] || defaultVal;
        rootStyles.setProperty(cssVar, val);
        const input = document.getElementById(key);
        if (input) input.value = val;
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
    };

    applyAllColors(savedTheme);

    const updateColor = (property, value, key) => {
        rootStyles.setProperty(property, value);
        savedTheme[key] = value;
        localStorage.setItem('lutherian_theme', JSON.stringify(savedTheme));
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

    const resetThemeBtn = document.getElementById('resetThemeBtn');
    if (resetThemeBtn) {
        resetThemeBtn.addEventListener('click', () => {
            localStorage.removeItem('lutherian_theme');
            savedTheme = {};

            applyAllColors(defaultColors);

            if (themePanel && dropdown) {
                themePanel.style.display = 'none';
                dropdown.style.display = 'block';
            }
        });
    }
}