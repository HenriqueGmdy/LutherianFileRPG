// Importações do Core
import { initThemeEngine } from './core/themeEngine.js';
import { initTabs } from './core/router.js';

// Importações dos Módulos
import { initAttributes } from './modules/attributes/attributes.js';
import { initSkills } from './modules/attributes/skills.js';

import { initRaces } from './modules/background/races.js';
import { initOrigins } from './modules/background/origins.js';

import { initImageHandler } from './modules/header/imageHandler.js';

import { initInventory } from './modules/inventory/inventory.js';
import { initStatus } from './modules/status/status.js';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializações de infraestrutura
    initThemeEngine();
    initTabs();
    
    // Inicializações de componentes da ficha
    initImageHandler();
    initAttributes(); // Agora vai funcionar perfeitamente!
    initSkills();
    initStatus();
    initInventory();
    initRaces();
    initOrigins();

    console.log("Ficha Lutherian 100% operante na nova arquitetura!");
});