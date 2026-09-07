export function initThemeCustomizer() {
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

    if (!menuBtn || !dropdown || !themePanel) return;

    // Abre/fecha o menu principal de opções ao clicar nas três bolinhas
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'block' || themePanel.style.display === 'block';
        if (isOpen) {
            dropdown.style.display = 'none';
            themePanel.style.display = 'none';
        } else {
            dropdown.style.display = 'block';
        }
    });

    // Clicar em "Personalizar Tema" esconde o menu principal e abre o painel de cores
    themeOptBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = 'none';
        themePanel.style.display = 'block';
    });

    // Clicar em "Resetar Ficha" fecha o menu e abre o Modal de Aviso
    if (resetOptBtn && resetModal) {
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
            // Limpa todos os dados salvos da ficha e abas no localStorage
            localStorage.clear();
            // Recarrega a página para o estado inicial/zerado
            location.reload();
        });
    }

    // Botão de "Voltar" dentro do painel de cores retorna ao menu de opções
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themePanel.style.display = 'none';
            dropdown.style.display = 'block';
        });
    }

    // Fecha tudo se clicar em qualquer lugar fora do menu (exceto se o modal estiver aberto)
    document.addEventListener('click', (e) => {
        if (resetModal && resetModal.style.display === 'flex') return; // Não fecha se o modal estiver ativo

        if (!dropdown.contains(e.target) && !themePanel.contains(e.target) && e.target !== menuBtn) {
            dropdown.style.display = 'none';
            themePanel.style.display = 'none';
        }
    });

    const rootStyles = document.documentElement.style;

    // Carrega cores salvas anteriormente no navegador (localStorage)
    const savedTheme = JSON.parse(localStorage.getItem('lutherian_theme')) || {};
    if (savedTheme.bgMain) {
        rootStyles.setProperty('--bg-main', savedTheme.bgMain);
        document.getElementById('colorBgMain').value = savedTheme.bgMain;
    }
    if (savedTheme.bgFieldset) {
        rootStyles.setProperty('--bg-fieldset', savedTheme.bgFieldset);
        document.getElementById('colorBgFieldset').value = savedTheme.bgFieldset;
    }
    if (savedTheme.bgInputs) {
        rootStyles.setProperty('--bg-inputs', savedTheme.bgInputs);
        document.getElementById('colorBgInputs').value = savedTheme.bgInputs;
    }
    if (savedTheme.textColor) {
        rootStyles.setProperty('--text-color', savedTheme.textColor);
        document.getElementById('colorText').value = savedTheme.textColor;
    }
    if (savedTheme.accentColor) {
        rootStyles.setProperty('--accent-color', savedTheme.accentColor);
        document.getElementById('colorAccent').value = savedTheme.accentColor;
    }

    // Eventos de mudança de cor em tempo real
    const updateColor = (property, value, key) => {
        rootStyles.setProperty(property, value);
        savedTheme[key] = value;
        localStorage.setItem('lutherian_theme', JSON.stringify(savedTheme));
    };

    document.getElementById('colorBgMain').addEventListener('input', (e) => updateColor('--bg-main', e.target.value, 'bgMain'));
    document.getElementById('colorBgFieldset').addEventListener('input', (e) => updateColor('--bg-fieldset', e.target.value, 'bgFieldset'));
    document.getElementById('colorBgInputs').addEventListener('input', (e) => updateColor('--bg-inputs', e.target.value, 'bgInputs'));
    document.getElementById('colorText').addEventListener('input', (e) => updateColor('--text-color', e.target.value, 'textColor'));
    document.getElementById('colorAccent').addEventListener('input', (e) => updateColor('--accent-color', e.target.value, 'accentColor'));

    // Botão de restaurar padrão (limpa storage do tema, remove inline styles e reseta os inputs)
    document.getElementById('resetThemeBtn').addEventListener('click', () => {
        localStorage.removeItem('lutherian_theme');
        
        rootStyles.removeProperty('--bg-main');
        rootStyles.removeProperty('--bg-fieldset');
        rootStyles.removeProperty('--bg-inputs');
        rootStyles.removeProperty('--text-color');
        rootStyles.removeProperty('--accent-color');

        const defaultColors = {
            colorBgMain: '#141414',
            colorBgFieldset: '#1c1c1c',
            colorBgInputs: '#2b2b2b',
            colorText: '#ffffff',
            colorAccent: '#ffffff'
        };

        Object.keys(defaultColors).forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = defaultColors[id];
        });

        themePanel.style.display = 'none';
        dropdown.style.display = 'block';
    });
}