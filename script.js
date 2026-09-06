import { renderAttributes, initAttributesListeners, updateAllAttributes } from './js/attributes.js';
import { initStatusListeners, updateInitiative } from './js/status.js';
import { renderSkills, initSkillsListeners, updateAllSkills } from './js/skills.js';
import { initPersonalListeners } from './js/personal.js';
import { initInventory } from './js/inventory.js'; // <--- Importa o inventário

window.addEventListener("DOMContentLoaded", () => {
    // 1. Renderiza os componentes gerados via JS
    renderAttributes();
    renderSkills();

    // 2. Inicializa os ouvintes de eventos de todos os módulos
    initAttributesListeners();
    initStatusListeners();
    initSkillsListeners();
    initPersonalListeners();
    initInventory(); // <--- Inicializa o inventário

    // 3. Executa as sincronizações iniciais
    updateAllAttributes();
    updateInitiative();
    updateAllSkills();
});