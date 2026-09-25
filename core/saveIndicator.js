// Tempo sem novos salvamentos para considerar o lote concluído (o ícone pulsa até lá).
const SETTLE_DELAY_MS = 700;

let indicator = null;
let settleTimer = null;
let batchFailed = false;

function getIndicator() {
    if (!indicator) indicator = document.getElementById('saveIndicator');
    return indicator;
}

function setState(state, message = '') {
    const element = getIndicator();
    if (!element) return;

    element.classList.toggle('is-visible', state !== 'idle');
    element.classList.toggle('is-saving', state === 'saving');
    element.classList.toggle('is-error', state === 'error');

    const label = state === 'error'
        ? `Falha ao salvar${message ? ` (${message})` : ''}. Suas alterações podem não ter sido gravadas.`
        : state === 'saving' ? 'Salvando…' : '';
    element.setAttribute('aria-label', label);
    element.title = state === 'error' ? label : '';
}

// Usa o ícone real; se o arquivo não carregar, cai para o SVG embutido no HTML.
export function initSaveIndicator() {
    const element = getIndicator();
    const icon = element?.querySelector('.saveIndicatorIcon');
    if (!element || !icon) return;

    const useFallback = () => element.classList.add('use-fallback');
    icon.addEventListener('error', useFallback, { once: true });
    if (icon.complete && icon.naturalWidth === 0) useFallback();
}

// Chamado a cada gravação real (ok = gravou e conferiu). Erros ficam visíveis até um lote salvar sem falhas.
export function reportSave(ok, detail = '') {
    if (!ok) {
        batchFailed = true;
        setState('error', detail);
    } else if (!batchFailed) {
        setState('saving');
    }

    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
        if (batchFailed) {
            batchFailed = false;
            return;
        }

        setState('idle');
    }, SETTLE_DELAY_MS);
}
