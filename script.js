import { renderAttributes, initAttributesListeners, updateAllAttributes } from './js/components/attributes.js';
import { initStatusListeners, updateInitiative } from './js/components/status.js';
import { renderSkills, initSkillsListeners, updateAllSkills } from './js/components/skills.js';
import { initPersonalListeners } from './js/components/personal.js';
import { initInventory } from './js/components/inventory.js';
import { initOrigins } from './js/components/origins.js';
import { initRaces } from './js/components/races.js';
import { initTabs } from './js/components/tabs.js';
import { initThemeCustomizer } from './js/components/themeCustomizer.js';
import { initLocalStorage } from './js/components/storage.js';

window.addEventListener("DOMContentLoaded", () => {
    // 1. Renderiza os componentes gerados via JS
    renderAttributes();
    renderSkills();
    initThemeCustomizer();
    initLocalStorage();

    // 2. Inicializa os ouvintes de eventos de todos os módulos
    initTabs();
    initAttributesListeners();
    initStatusListeners();
    initSkillsListeners();
    initPersonalListeners();
    initInventory();
    initOrigins();
    initRaces();

    // 3. Executa as sincronizações iniciais
    updateAllAttributes();
    updateInitiative();
    updateAllSkills();
});
