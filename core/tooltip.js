const SHOW_DELAY_MS = 250;
const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 8;

const registry = new Map();

let tooltipElement = null;
let activeAnchor = null;
let showTimer = null;
let lastPointerX = 0;

export function registerTooltips(entries) {
    Object.entries(entries).forEach(([key, content]) => registry.set(key, content));
}

// Atualiza (ou cria) o conteúdo de uma chave; útil para textos que mudam, como faixas por raça.
export function setTooltipContent(key, content) {
    registry.set(key, content);

    if (tooltipElement && !tooltipElement.hidden && activeAnchor?.dataset.tooltip === key) {
        render(content);
        position(activeAnchor);
    }
}

function render(content) {
    const header = document.createElement('div');
    header.className = 'appTooltipHeader';

    const title = document.createElement('strong');
    title.textContent = content.title ?? '';
    header.appendChild(title);

    if (content.attr) {
        const attr = document.createElement('span');
        attr.className = 'appTooltipAttr';
        attr.textContent = content.attr;
        header.appendChild(attr);
    }

    const parts = [header];

    if (content.tagline) {
        const tagline = document.createElement('div');
        tagline.className = 'appTooltipTagline';
        tagline.textContent = content.tagline;
        parts.push(tagline);
    }

    const text = document.createElement('p');
    text.className = 'appTooltipText';
    text.textContent = content.text ?? '';
    parts.push(text);

    tooltipElement.replaceChildren(...parts);
}

function position(anchor) {
    const anchorRect = anchor.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    const maxLeft = window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(lastPointerX - 16, maxLeft));

    let top = anchorRect.bottom + ANCHOR_GAP;
    if (top + tooltipRect.height > window.innerHeight - VIEWPORT_MARGIN) {
        top = Math.max(VIEWPORT_MARGIN, anchorRect.top - tooltipRect.height - ANCHOR_GAP);
    }

    tooltipElement.style.left = `${left}px`;
    tooltipElement.style.top = `${top}px`;
}

function show(anchor) {
    const content = registry.get(anchor.dataset.tooltip);
    if (!content) return;

    render(content);
    tooltipElement.style.left = '0px';
    tooltipElement.style.top = '0px';
    tooltipElement.hidden = false;
    position(anchor);
    anchor.setAttribute('aria-describedby', tooltipElement.id);
}

function hide() {
    window.clearTimeout(showTimer);
    showTimer = null;

    if (activeAnchor) activeAnchor.removeAttribute('aria-describedby');
    activeAnchor = null;
    if (tooltipElement) tooltipElement.hidden = true;
}

function findAnchor(target) {
    return target instanceof Element ? target.closest('[data-tooltip]') : null;
}

export function initTooltips(entries = {}) {
    registerTooltips(entries);

    tooltipElement = document.createElement('div');
    tooltipElement.id = 'appTooltip';
    tooltipElement.className = 'appTooltip';
    tooltipElement.setAttribute('role', 'tooltip');
    tooltipElement.hidden = true;
    document.body.appendChild(tooltipElement);

    document.addEventListener('mouseover', event => {
        const anchor = findAnchor(event.target);
        if (!anchor || anchor === activeAnchor) return;

        hide();
        activeAnchor = anchor;
        lastPointerX = event.clientX;
        showTimer = window.setTimeout(() => show(anchor), SHOW_DELAY_MS);
    });

    document.addEventListener('mouseout', event => {
        const anchor = findAnchor(event.target);
        if (anchor && anchor === activeAnchor && !anchor.contains(event.relatedTarget)) hide();
    });

    document.addEventListener('focusin', event => {
        const anchor = findAnchor(event.target);
        if (!anchor || !event.target.matches(':focus-visible')) return;

        hide();
        activeAnchor = anchor;
        const rect = anchor.getBoundingClientRect();
        lastPointerX = rect.left + 16;
        show(anchor);
    });

    document.addEventListener('focusout', hide);
    document.addEventListener('pointerdown', hide, true);
    document.addEventListener('scroll', hide, true);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') hide();
    });
    window.addEventListener('blur', hide);
}
