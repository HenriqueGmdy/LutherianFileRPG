const SOUND_PATHS = {
    deathsDoor: 'assets/audio/UI/general/character/deaths_door.wav',
    inspirationCheck: 'assets/audio/UI/general/character/inspiration_check.wav',
    nameUpdated: 'assets/audio/UI/general/character/name_updated.wav',
    statusInZero: 'assets/audio/UI/general/character/status_in_zero.wav',
    stressHeal: 'assets/audio/UI/general/character/stress_heal.wav',
    stressIncrease: 'assets/audio/UI/general/character/stress_increase.wav',
    stressMax: 'assets/audio/UI/general/character/stress_max.wav',
    threatIncrease: 'assets/audio/UI/general/character/threat_increase.wav',
    vitalityHeal: 'assets/audio/UI/general/character/vitality_heal.wav',
    willHeal: 'assets/audio/UI/general/character/will_heal.wav',
    backpacks: 'assets/audio/UI/general/inventory/backpacks.wav',
    coinsChange: 'assets/audio/UI/general/inventory/coins_change.wav',
    clickInvalid: 'assets/audio/UI/general/click_button.invalid.wav',
    click: 'assets/audio/UI/general/click_button.wav',
    confirm: 'assets/audio/UI/general/confirm_selection.wav',
    markRemoved: 'assets/audio/UI/general/markbox_removed.wav',
    markSelected: 'assets/audio/UI/general/markbox_selected.wav',
    mouseOver: 'assets/audio/UI/general/mouse_over.wav',
    select: 'assets/audio/UI/general/select.wav',
    textboxOpen: 'assets/audio/UI/general/textbox_open.wav',
    closeMenu: 'assets/audio/UI/menu/close_menu.wav',
    colorClose: 'assets/audio/UI/menu/color_close.wav',
    colorOpen: 'assets/audio/UI/menu/color_open.wav',
    fileReseted: 'assets/audio/UI/menu/file_reseted.wav',
    openMenu: 'assets/audio/UI/menu/open_menu.wav'
};

const audioCache = new Map();

function getAudio(name) {
    const path = SOUND_PATHS[name];
    if (!path) return null;

    if (!audioCache.has(name)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audioCache.set(name, audio);
    }

    return audioCache.get(name);
}

export function playSound(name, options = {}) {
    const source = getAudio(name);
    if (!source) return null;

    const audio = source.cloneNode();
    audio.volume = options.volume ?? 0.7;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    return audio;
}

export function playSoundAfter(name, previousAudio, options = {}) {
    const playNext = () => playSound(name, options);
    if (!previousAudio) return playNext();

    let completed = false;
    const finish = () => {
        if (completed) return;
        completed = true;
        window.clearTimeout(timeoutId);
        playNext();
    };
    const timeoutId = window.setTimeout(finish, options.fallbackDelay ?? 700);
    previousAudio.addEventListener('ended', finish, { once: true });
    return previousAudio;
}

export function initAudioInteractions() {
    document.addEventListener('pointerdown', (event) => {
        const field = event.target.closest('input');
        if (!field) return;

        if (field.id === 'vitalityCurrent' && field.disabled) {
            playSound('clickInvalid');
        } else if (field.id === 'speed' && field.readOnly) {
            playSound('clickInvalid');
        }
    }, true);

    document.addEventListener('mouseover', (event) => {
        const selectable = event.target.closest('button, select, input, textarea, .optionsMenuItem, .tab-btn');
        if (selectable && !selectable.contains(event.relatedTarget)) playSound('mouseOver', { volume: 0.35 });
    });

    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button || button.dataset.audioHandled === 'true') return;
        if (button.id === 'rollStressBtn') {
            const stress = Number.parseInt(document.getElementById('stress')?.value, 10) || 0;
            const hasActiveCondition = Boolean(localStorage.getItem('lutherian_active_condition'));
            if (stress < 100 || hasActiveCondition) {
                playSound('clickInvalid');
                return;
            }
        }
        if (button.id === 'confirmResetBtn' || button.id === 'cancelResetBtn' || button.id === 'resetThemeBtn') {
            playSound('confirm');
            return;
        }
        playSound('click');
    });

    document.addEventListener('focusin', (event) => {
        if (event.target.matches('input[type="text"], textarea')) playSound('textboxOpen');
        if (event.target.matches('select')) playSound('select');
    });

    document.addEventListener('change', (event) => {
        if (event.target.matches('select')) playSound('select');
        if (event.target.matches('input[type="checkbox"]')) {
            playSound(event.target.checked ? 'markSelected' : 'markRemoved');
        }
    });

    document.addEventListener('change', (event) => {
        const field = event.target;
        if (!field.matches('input[type="number"], input[type="text"].smallBoxInput')) return;

        const deferredStatusFields = [
            'vitalityCurrent', 'vitalityTotal', 'willpowerCurrent',
            'willpowerTotal', 'stress'
        ];
        const dedicatedAudioFields = ['name', 'coinsInput'];
        if (!deferredStatusFields.includes(field.id) && !dedicatedAudioFields.includes(field.id)) {
            playSound('click');
        }
    });
}
