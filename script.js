// Importações do Core
import { initThemeEngine } from './core/themeEngine.js';
import { initTabs } from './core/router.js';
import { initLocalStorage } from './core/storage.js';

// Importações dos Módulos
import { initAttributes } from './modules/attributes/attributes.js';
import { initSkills } from './modules/attributes/skills.js';
import { initRaces } from './modules/background/races.js';
import { initOrigins } from './modules/background/origins.js';
import { initClasses } from './modules/background/classes.js';
import { initImageHandler } from './modules/header/imageHandler.js';
import { initPersonalListeners } from './modules/personal/personal.js';
import { initInventory } from './modules/inventory/inventory.js';
import { initStatus } from './modules/status/status.js';
import { initLevelEmblem } from './modules/level/levelManager.js';
import { initCurios } from './modules/header/curios.js';
import { startApplicationOnce } from './core/appState.js';
import { initAudioInteractions, initVolumeControl } from './core/audio.js';
import { initSaveIndicator } from './core/saveIndicator.js';
import { initTooltips } from './core/tooltip.js';
import { tooltipsData } from './modules/help/tooltipsData.js';

document.addEventListener("DOMContentLoaded", () => {
    if (!startApplicationOnce()) return;

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
    
    // Renderiza os campos dinâmicos antes de restaurar os dados persistidos.
    safeInit("ImageHandler", initImageHandler);
    safeInit("PersonalListeners", initPersonalListeners);
    safeInit("Attributes", initAttributes);
    safeInit("Skills", initSkills);
    safeInit("Races", initRaces);
    safeInit("Origins", initOrigins);
    safeInit("Classes", initClasses);

    // O carregamento precisa acontecer antes dos módulos que calculam status,
    // inventário e efeitos derivados dos valores restaurados.
    safeInit("LocalStorage", initLocalStorage);
    safeInit("AudioInteractions", initAudioInteractions);
    safeInit("VolumeControl", initVolumeControl);
    safeInit("SaveIndicator", initSaveIndicator);
    safeInit("Tooltips", () => initTooltips(tooltipsData));

    // Inicializações dependentes dos dados restaurados.
    safeInit("Status", initStatus);
    safeInit("Inventory", initInventory);
    safeInit("LevelEmblem", initLevelEmblem);
    safeInit("Curios", initCurios);

    console.log("Ficha Lutherian iniciada com sistema anti-crash ativado!");
});