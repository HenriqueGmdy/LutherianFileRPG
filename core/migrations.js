// Versão do esquema dos dados salvos. Ao renomear/remover ids de campos ou containers
// de lista, ou mudar o formato dos dados: incremente CURRENT_SCHEMA_VERSION e
// adicione a migração correspondente abaixo. O storage faz backup antes de migrar.
export const CURRENT_SCHEMA_VERSION = 2;

// Dados sem versão gravada (fichas antigas) são tratados como versão 1.
export const LEGACY_SCHEMA_VERSION = 1;

export function renameField(sheet, from, to) {
    if (!(from in sheet)) return;
    if (!(to in sheet)) sheet[to] = sheet[from];
    delete sheet[from];
}

export function renameList(lists, from, to) {
    if (!(from in lists)) return;
    if (!(to in lists)) lists[to] = lists[from];
    delete lists[from];
}

// Chave N converte dados do esquema N-1 para o N. Recebe { sheet, lists } e altera no lugar.
const migrations = {
    2: ({ sheet }) => renameField(sheet, 'chaClass', 'characterClass')
};

export function migrateData(data, fromVersion) {
    for (let version = fromVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
        migrations[version]?.(data);
    }
    return data;
}
