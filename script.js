import { renderAttributes, initAttributesListeners, updateAllAttributes } from './js/attributes.js';
import { initStatusListeners, updateInitiative } from './js/status.js';
import { renderSkills, initSkillsListeners, updateAllSkills } from './js/skills.js';
import { initPersonalListeners } from './js/personal.js';
import { initInventory } from './js/inventory.js';
import { initOrigins } from './js/origins.js';
import { initRaces } from './js/races.js'; // <--- 1. Importa o módulo de raças

window.addEventListener("DOMContentLoaded", () => {
    renderAttributes();
    renderSkills();

    initAttributesListeners();
    initStatusListeners();
    initSkillsListeners();
    initPersonalListeners();
    initInventory();
    initOrigins();
    initRaces(); // <--- 2. Inicializa o seletor de raças

    updateAllAttributes();
    updateInitiative();
    updateAllSkills();
});