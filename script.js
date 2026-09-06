import { renderAttributes, initAttributesListeners, updateAllAttributes } from './js/attributes.js';
import { initStatusListeners, updateInitiative } from './js/status.js';
import { renderSkills, initSkillsListeners, updateAllSkills } from './js/skills.js';
import { initPersonalListeners } from './js/personal.js'; // <--- Importa o novo módulo

window.addEventListener("DOMContentLoaded", () => {
    // 1. Renderiza os componentes gerados via JS
    renderAttributes();
    renderSkills();

    // 2. Inicializa os ouvintes de eventos
    initAttributesListeners();
    initStatusListeners();
    initSkillsListeners();
    initPersonalListeners(); // <--- Inicializa os ouvintes do Pessoal

    // 3. Executa as sincronizações iniciais
    updateAllAttributes();
    updateInitiative();
    updateAllSkills();
});