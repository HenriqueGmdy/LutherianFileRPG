import { applySheetFile, createSheetFile, parseSheetFile } from './storage.js';
import { playSound } from './audio.js';

const MAX_FILE_BYTES = 12 * 1024 * 1024;

function slugify(text) {
    return String(text ?? '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        .slice(0, 40);
}

function todayStamp() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function downloadTextFile(filename, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return Number.isNaN(date.getTime()) ? 'data desconhecida' : date.toLocaleString('pt-BR');
}

function fail(message) {
    playSound('clickInvalid');
    alert(message);
}

export function initSheetFile() {
    const exportButton = document.getElementById('menuOptExport');
    const importButton = document.getElementById('menuOptImport');
    const fileInput = document.querySelector('.sheetFileInput');
    if (!exportButton || !importButton || !fileInput) return;

    exportButton.addEventListener('click', () => {
        const sheetFile = createSheetFile();
        const name = slugify(sheetFile.character.name) || 'ficha-lutherian';
        downloadTextFile(`${name}-${todayStamp()}.json`, JSON.stringify(sheetFile, null, 2));
    });

    importButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        fileInput.value = '';
        if (!file) return;

        if (file.size > MAX_FILE_BYTES) {
            fail('O arquivo é grande demais para ser uma ficha.');
            return;
        }

        let raw;
        try {
            raw = JSON.parse(await file.text());
        } catch {
            fail('Não foi possível ler o arquivo: ele não é um JSON válido.');
            return;
        }

        const parsed = parseSheetFile(raw);
        if (!parsed.ok) {
            fail(parsed.error);
            return;
        }

        const { character, exportedAt } = parsed.data;
        const label = character.name ? `"${character.name}"` : 'sem nome';
        const confirmed = window.confirm(
            `Importar a ficha ${label} (exportada em ${formatDate(exportedAt)})?\n\n` +
            'A ficha atual será substituída. Uma cópia dela fica guardada como backup e pode ser recuperada pelo console: lutherian.restoreBackup("preImport").'
        );
        if (!confirmed) return;

        const result = applySheetFile(parsed.data);
        if (!result.ok) fail(result.error);
    });
}
