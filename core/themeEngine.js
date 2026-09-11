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

    // Fecha tudo se clicar em qualquer lugar fora do menu
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
        colorBgMain: '#141414',      // Fundo preto customizável
        colorBgFieldset: '#1c1c1c',  // Interior das caixas (um tom acima do preto)
        colorBgInputs: '#2b2b2b',    // Fundo de inputs
        colorText: '#ffffff',        // Textos comuns e subtítulos brancos por padrão
        colorAccent: '#ffcc00'       // Nomes e Títulos amarelados por padrão
    };

    // Carrega cores salvas anteriormente no navegador (localStorage) ou usa o padrão
    const savedTheme = JSON.parse(localStorage.getItem('lutherian_theme')) || {};
    
    const applyColor = (key, cssVar, defaultVal) => {
        const val = savedTheme[key] || defaultVal;
        rootStyles.setProperty(cssVar, val);
        const input = document.getElementById(key);
        if (input) input.value = val;
    };

    applyColor('colorBgMain', '--bg-main', defaultColors.colorBgMain);
    applyColor('colorBgFieldset', '--bg-fieldset', defaultColors.colorBgFieldset);
    applyColor('colorBgInputs', '--bg-inputs', defaultColors.colorBgInputs);
    applyColor('colorText', '--text-color', defaultColors.colorText);
    applyColor('colorAccent', '--accent-color', defaultColors.colorAccent);

    // Eventos de mudança de cor em tempo real
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

    // Botão de restaurar padrão
    const resetThemeBtn = document.getElementById('resetThemeBtn');
    if (resetThemeBtn) {
        resetThemeBtn.addEventListener('click', () => {
            localStorage.removeItem('lutherian_theme');
            
            Object.keys(defaultColors).forEach(key => {
                const cssVar = `--${key.replace('color', '').toLowerCase()}`; 
                rootStyles.removeProperty(cssVar);
                const input = document.getElementById(key);
                if (input) input.value = defaultColors[key];
            });

            // Reaplica os padrões imediatamente
            applyColor('colorBgMain', '--bg-main', defaultColors.colorBgMain);
            applyColor('colorBgFieldset', '--bg-fieldset', defaultColors.colorBgFieldset);
            applyColor('colorBgInputs', '--bg-inputs', defaultColors.colorBgInputs);
            applyColor('colorText', '--text-color', defaultColors.colorText);
            applyColor('colorAccent', '--accent-color', defaultColors.colorAccent);

            if (themePanel && dropdown) {
                themePanel.style.display = 'none';
                dropdown.style.display = 'block';
            }
        });
    }
}