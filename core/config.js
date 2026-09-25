//CONSTANTES E CONFIGURAÇÕES GLOBAIS

export const CONFIG = {
    STORAGE_KEYS: {
        SHEET_DATA: 'lutherian_character_sheet_data',
        DYNAMIC_LISTS: 'lutherian_dynamic_lists_data',
        ACTIVE_TAB: 'lutherian_active_tab',
        THEME: 'lutherian_theme',
        IMAGE: 'lutherian_char_image',
        ACTIVE_CONDITION: 'lutherian_active_condition',
        RESOLVE_STATE: 'lutherian_resolve_state',
        SCHEMA_VERSION: 'lutherian_schema_version',
        BACKUP_LAST: 'lutherian_backup_last',
        BACKUP_PRE_MIGRATION: 'lutherian_backup_pre_migration',
        VOLUME: 'lutherian_master_volume'
    },
    LIMITS: {
        MAX_STRESS: 200,
        MAX_DYNAMIC_ITEMS: 20,
        MAX_INVENTORY_ITEMS: 50
    },
    DEFAULTS: {
        SPEED_MEDIUM: 6,
        SPEED_SMALL: 5,
        SPEED_LARGE: 7
    }
};