// Importações do Core
import { initThemeEngine } from './core/themeEngine.js';
import { initTabs } from './core/router.js';
import { initLocalStorage } from './core/storage.js';

// Importações dos Módulos
import { initAttributes } from './modules/attributes/attributes.js';
import { initSkills } from './modules/attributes/skills.js';
import { initRaces } from './modules/background/races.js';
import { initOrigins } from './modules/background/origins.js';
import { initImageHandler } from './modules/header/imageHandler.js';
import { initPersonalListeners } from './modules/personal/personal.js';
import { initInventory } from './modules/inventory/inventory.js';
import { initNarrative } from './modules/narrative/narrative.js';
import { initStatus } from './modules/status/status.js';

document.addEventListener("DOMContentLoaded", () => {
    // Função para blindar a inicialização. Se um módulo quebrar, o resto sobrevive.
    const safeInit = (moduleName, initFunction) => {
        try {
            initFunction();
        } catch (error) {
            console.error(`Falha ao iniciar o módulo [${moduleName}]:`, error);
        }
    };

    // Inicializações de infraestrutura (Blindadas)
    safeInit("ThemeEngine", initThemeEngine);
    safeInit("Tabs", initTabs);
    safeInit("LocalStorage", initLocalStorage); 
    
    // Inicializações de componentes da ficha (Blindadas)
    safeInit("ImageHandler", initImageHandler);
    safeInit("PersonalListeners", initPersonalListeners);
    safeInit("Attributes", initAttributes);
    safeInit("Skills", initSkills);
    safeInit("Status", initStatus);
    safeInit("Inventory", initInventory);
    safeInit("Races", initRaces);
    safeInit("Origins", initOrigins);
    safeInit("Narrative", initNarrative);

    console.log("Ficha Lutherian iniciada com sistema anti-crash ativado!");
});