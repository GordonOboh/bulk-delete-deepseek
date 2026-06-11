if (typeof window.domHandlerLoaded === "undefined") {
  console.log("domHandler.js loaded");

  window.domHandlerLoaded = true;

  const DOMHandler = {
    createCheckbox(index) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = CSS_CLASSES.CHECKBOX;
      checkbox.dataset.index = index;
      checkbox.style.cssText = `
        margin-right: 8px;
        margin-left: 4px;
        position: relative;
        top: 1px;
      `;
      return checkbox;
    },

    getConversationTitle(conversationElement) {
      const titleElement = conversationElement.querySelector(UI_CONFIG.SELECTORS.TITLE_SELECTOR);
      if (titleElement) {
        return titleElement.textContent.trim();
      }
      return conversationElement.textContent.trim() || "this conversation";
    },

    findInteractiveElement(conversationElement) {
      return conversationElement.querySelector("button");
    },

    getConversationElementFromCheckbox(checkbox) {
      return checkbox.closest(UI_CONFIG.SELECTORS.CONVERSATION_SELECTOR);
    },

    findConversationMenuButton(conversationElement) {
      const titleEl = conversationElement.querySelector(UI_CONFIG.SELECTORS.TITLE_SELECTOR);
      if (titleEl && titleEl.nextElementSibling) {
        const button = titleEl.nextElementSibling.querySelector("div[role='button']");
        if (button) return button;
      }
      return conversationElement.querySelector(UI_CONFIG.SELECTORS.THREE_DOT_BUTTON);
    },

    dispatchHoverEvent(element) {
      const hoverEvent = new MouseEvent("mouseover", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(hoverEvent);
    },

    dispatchPointerDownEvent(element) {
      const pointerDownEvent = new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
      });
      element.dispatchEvent(pointerDownEvent);
    },

    getHistoryConversations() {
      const sidebar = document.querySelector(UI_CONFIG.SELECTORS.SIDEBAR);
      if (!sidebar) return [];
      const chatList = sidebar.querySelector(UI_CONFIG.SELECTORS.CHAT_LIST);
      if (!chatList) return [];
      return Array.from(chatList.querySelectorAll(UI_CONFIG.SELECTORS.CONVERSATION_SELECTOR));
    },

    getProjectConversations() {
      return [];
    },

    getAllConversations() {
      const conversations = [
        ...this.getProjectConversations(),
        ...this.getHistoryConversations()
      ];
      return conversations.filter((conversation, index, allConversations) =>
        allConversations.indexOf(conversation) === index
      );
    },

    toggleConversationInteraction(conversation, disable = true) {
      if (conversation.matches("a")) {
        conversation.style.pointerEvents = "auto";
        conversation.style.cursor = disable ? "pointer" : "";
        return;
      }
      const link = conversation.querySelector("a");
      if (link) {
        if (disable) {
          link.style.pointerEvents = "none";
          link.style.cursor = "default";
        } else {
          link.style.pointerEvents = "auto";
          link.style.cursor = "pointer";
        }
      }
    }
  };

  const EventHandler = {
    handleCheckboxClick(event, checkbox) {
      event.stopPropagation();
      this.handleShiftSelection(checkbox);
      GlobalState.setLastCheckedCheckbox(checkbox);
    },

    handleShiftSelection(clickedCheckbox) {
      if (GlobalState.isShiftPressed() && GlobalState.getLastCheckedCheckbox()) {
        const allCheckboxes = Array.from(
          document.querySelectorAll(`.${CSS_CLASSES.CHECKBOX}`)
        );
        const start = allCheckboxes.indexOf(GlobalState.getLastCheckedCheckbox());
        const end = allCheckboxes.indexOf(clickedCheckbox);

        if (start !== -1 && end !== -1) {
          const [lower, upper] = start < end ? [start, end] : [end, start];
          for (let i = lower; i <= upper; i++) {
            allCheckboxes[i].checked = true;
          }
        }
      }
    },

    toggleCheckboxInConversation(conversation, event) {
      event.preventDefault();
      event.stopPropagation();

      const checkbox = conversation.querySelector(`.${CSS_CLASSES.CHECKBOX}`);
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        this.handleShiftSelection(checkbox);
        if (checkbox.checked) {
          GlobalState.setLastCheckedCheckbox(checkbox);
        }
      }
    },

    addKeyboardListeners() {
      document.addEventListener("keydown", (event) => {
        if (event.key === "Shift") {
          GlobalState.setShiftPressed(true);
        }
      });

      document.addEventListener("keyup", (event) => {
        if (event.key === "Shift") {
          GlobalState.setShiftPressed(false);
        }
      });
    }
  };

  window.DOMHandler = DOMHandler;
  window.EventHandler = EventHandler;

  if (window.DeepSeekBulkDelete && window.DeepSeekBulkDelete.registerModule) {
    window.DeepSeekBulkDelete.registerModule('DOMHandler', DOMHandler);
    window.DeepSeekBulkDelete.registerModule('EventHandler', EventHandler);
  } else {
    const registerModules = () => {
      if (window.DeepSeekBulkDelete && window.DeepSeekBulkDelete.registerModule) {
        window.DeepSeekBulkDelete.registerModule('DOMHandler', DOMHandler);
        window.DeepSeekBulkDelete.registerModule('EventHandler', EventHandler);
      } else {
        setTimeout(registerModules, 50);
      }
    };
    registerModules();
  }

} else {
  console.log("domHandler.js already loaded, skipping re-initialization");
}
