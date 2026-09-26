import { CONFIG } from './config.js';
import { reportSave } from './saveIndicator.js';

// Biblioteca global de itens reutilizáveis (proficiências, talentos, idiomas, doenças, traços).
// Hoje persiste no localStorage deste navegador. A API foi desenhada para trocar o armazenamento
// por um serviço remoto sem mexer nos chamadores: leitura síncrona de um cache em memória,
// escrita assíncrona e notificação de mudanças (onLibraryChange).

const STORAGE_KEY = CONFIG.STORAGE_KEYS.LIBRARY;
const SCHEMA_VERSION = 1;

let entries = {};
const listeners = new Set();

function normalizeName(name) {
    return String(name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

function makeId() {
    return globalThis.crypto?.randomUUID?.() ?? `lib-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function persist() {
    try {
        const json = JSON.stringify({ version: SCHEMA_VERSION, entries });
        localStorage.setItem(STORAGE_KEY, json);
        if (localStorage.getItem(STORAGE_KEY) !== json) throw new Error('A leitura de conferência não bate com o que foi gravado.');
        return true;
    } catch (error) {
        console.error('Não foi possível salvar a lista global:', error);
        return false;
    }
}

function buildFromSeeds(seeds) {
    return Object.fromEntries(Object.entries(seeds).map(([category, items]) => [
        category,
        items.map(item => ({ id: makeId(), name: item.name, desc: item.desc ?? '' }))
    ]));
}

export function initLibrary(seeds = {}) {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.entries === 'object' && !Array.isArray(parsed.entries)) {
                entries = parsed.entries;
                return;
            }
        } catch (error) {
            console.warn(`Lista global inválida (cópia guardada em ${STORAGE_KEY}_corrupt):`, error);
        }
        try { localStorage.setItem(`${STORAGE_KEY}_corrupt`, raw); } catch { /* sem espaço: segue sem a cópia */ }
    }

    entries = buildFromSeeds(seeds);
    persist();
}

export function getLibraryEntries(category) {
    return (entries[category] ?? []).map(entry => ({ ...entry }));
}

export function hasLibraryEntry(category, name) {
    const key = normalizeName(name);
    return key !== '' && (entries[category] ?? []).some(entry => normalizeName(entry.name) === key);
}

// Retorna { status: 'added' | 'exists' | 'invalid' | 'error', entry? }
export async function addLibraryEntry(category, { name, desc = '' }) {
    const cleanName = String(name ?? '').trim();
    if (!cleanName) return { status: 'invalid' };
    if (hasLibraryEntry(category, cleanName)) return { status: 'exists' };

    const entry = { id: makeId(), name: cleanName, desc: String(desc ?? '').trim() };
    const list = entries[category] ?? (entries[category] = []);
    list.push(entry);

    if (!persist()) {
        list.pop();
        reportSave(false, 'lista global');
        return { status: 'error' };
    }

    reportSave(true, 'lista global');
    listeners.forEach(listener => listener(category));
    return { status: 'added', entry: { ...entry } };
}

// Retorna { status: 'removed' | 'missing' | 'error' }
export async function removeLibraryEntry(category, id) {
    const list = entries[category];
    const index = list ? list.findIndex(entry => entry.id === id) : -1;
    if (index < 0) return { status: 'missing' };

    const [removed] = list.splice(index, 1);
    if (!persist()) {
        list.splice(index, 0, removed);
        reportSave(false, 'lista global');
        return { status: 'error' };
    }

    reportSave(true, 'lista global');
    listeners.forEach(listener => listener(category));
    return { status: 'removed' };
}

export function onLibraryChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
