if (typeof window.configLoaded === "undefined") {
  console.log("config.js loaded");

  window.configLoaded = true;

  const UI_CONFIG = {
    DELAYS: {
      SHORT: 100,
      MEDIUM: 200,
      LONG: 300,
      EXTENDED: 500,
      THROTTLE: 500
    },
    OPERATION_DELAY: {
      STORAGE_KEY: "DeepSeekBulkDelete_delaySettings",
      BATCH_SIZE: 10,
      DEFAULT_BASE_DELAY_MS: 1200,
      MIN_BASE_DELAY_MS: 300,
      MAX_BASE_DELAY_MS: 10000,
      DEFAULT_AUTO_SLOWDOWN: true,
      INTRA_BATCH_GROWTH: 0.25,
      BATCH_COOLDOWN_BASE_MULTIPLIER: 3,
      BATCH_COOLDOWN_GROWTH_MULTIPLIER: 1,
      MAX_INTRA_BATCH_DELAY_MS: 8000,
      MAX_BATCH_COOLDOWN_MS: 30000
    },
    TIMEOUTS: {
      ELEMENT_WAIT: 3000,
      ELEMENT_WAIT_SHORT: 1500
    },
    SELECTORS: {
      conversationsCheckbox: ".ds-checkbox:checked",
      SIDEBAR: "._77cdc67",
      CHAT_LIST: "._3098d02",
      CONVERSATION_SELECTOR: "._546d736",
      TITLE_SELECTOR: ".c08e6e93",
      ACTIVE_SELECTOR: ".b64fb9ae",
      CONTEXT_MENU: ".ds-floating-position-wrapper",
      THREE_DOT_BUTTON: "._2090548",
      DELETE_BUTTON: ".ds-dropdown-menu-option--error",
      CONFIRM_DELETE_BUTTON: ".ds-button--error",
      MENU_ITEM: "div[role='menuitem']"
    },
    STRINGS: {
      DELETE: "Delete",
      DELETE_CN: "删除",
      DELETE_TW: "刪除",
      DELETE_JP: "削除",
      DELETE_KR: "삭제",
      DELETE_DE: "Löschen",
      DELETE_FR: "Supprimer",
      DELETE_ES: "Eliminar",
      DELETE_PT: "Excluir",
      DELETE_IT: "Elimina",
      DELETE_RU: "Удалить",
      DELETE_NL: "Verwijderen",
      DELETE_PL: "Usuń",
      DELETE_TR: "Sil",
      DELETE_ID: "Hapus",
      DELETE_VI: "Xóa",
      DELETE_TH: "ลบ",
      DELETE_AR: "حذف",
      DELETE_HE: "מחק",
      DELETE_HI: "हटाएं",
      DELETE_SV: "Ta bort",
      DELETE_NO: "Slett",
      DELETE_DA: "Slet",
      DELETE_FI: "Poista",
      DELETE_CS: "Smazat",
      DELETE_UK: "Видалити",
      DELETE_EL: "Διαγραφή"
    },
    BUTTON_STRATEGIES: {
      DELETE: [
        'text-fallback',
        '.ds-dropdown-menu-option--error',
        'div[role="menuitem"]:last-child'
      ]
    }
  };

  const CSS_CLASSES = {
    CHECKBOX: "ds-checkbox",
    PROGRESS: "progress"
  };

  const BUTTON_IDS = {
    BULK_DELETE: "bulk-delete",
    ADD_CHECKBOXES: "add-checkboxes",
    TOGGLE_CHECKBOXES: "toggle-checkboxes",
    REMOVE_CHECKBOXES: "remove-checkboxes"
  };

  const EVENTS = {
    DELETE: "delete"
  };

  window.UI_CONFIG = UI_CONFIG;
  window.CSS_CLASSES = CSS_CLASSES;
  window.BUTTON_IDS = BUTTON_IDS;
  window.EVENTS = EVENTS;

  window.Selectors = UI_CONFIG.SELECTORS;
  window.CHECKBOX_CLASS = CSS_CLASSES.CHECKBOX;

} else {
  console.log("config.js already loaded, skipping re-initialization");
}
