import { initResources } from './resources.js';
import { initStress } from './stress.js';
import { initThreat } from './threat.js';
import { playSound } from '../../core/audio.js';

let statusInitialized = false;

export function initStatus() {
    if (statusInitialized) return;
    statusInitialized = true;

    initResources();
    initStress();
    initThreat();

    document.getElementById('inspiration')?.addEventListener('change', (event) => {
        if (event.target.checked) playSound('inspirationCheck');
    });
}
