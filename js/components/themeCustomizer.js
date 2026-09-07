export function initThemeCustomizer() {
    // Cria a estrutura HTML do painel de customização de cores
    const customizerHTML = `
        <div id="themeCustomizerPanel" style="position: fixed; bottom: 20px; right: 20px; background: #1a1a1a; border: 1px solid #444; padding: 15px; border-radius: 8px; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family: sans-serif; color: #fff;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                🎨 Personalizar Tema 
                <button type="button" id="toggleThemePanel" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 12px;">Minimizar</button>
            </h4>
            <div id="themeControls" style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    Fundo Geral: <input type="color" id="colorBgMain" value="#141414">
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    Blocos (Fieldsets): <input type="color" id="colorBgFieldset" value="#1c1c1c">
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    Caixas de Texto/Inputs: <input type="color" id="colorBgInputs" value="#2b2b2b">
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    Texto Geral: <input type="color" id="colorText" value="#ffffff">
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center;">
                    Destaque (Acentos): <input type="color" id="colorAccent" value="#ffcc00">
                </label>
                <button type="button" id="resetThemeBtn" style="margin-top: 5px; background: #333; color: #fff; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">Restaurar Padrão</button>
            </div>
        </div>
    `;

    // Injeta o painel no body da página
    document.body.insertAdjacentHTML('beforeend', customizerHTML);

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

    // Eventos de mudança de cor
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

    // Botão de restaurar padrão
    document.getElementById('resetThemeBtn').addEventListener('click', () => {
        localStorage.removeItem('lutherian_theme');
        location.reload(); // Recarrega para voltar aos valores padrão
    });

    // Botão de minimizar painel para não atrapalhar a jogatina
    const controls = document.getElementById('themeControls');
    const toggleBtn = document.getElementById('toggleThemePanel');
    toggleBtn.addEventListener('click', () => {
        if (controls.style.display === 'none') {
            controls.style.display = 'flex';
            toggleBtn.textContent = 'Minimizar';
        } else {
            controls.style.display = 'none';
            toggleBtn.textContent = 'Expandir';
        }
    });
}