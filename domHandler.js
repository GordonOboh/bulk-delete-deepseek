if (typeof window.domHandlerLoaded === "undefined") {
  console.log("domHandler.js loaded");

  window.domHandlerLoaded = true;

  // DOM manipulation utilities
  const DOMHandler = {
    // Create checkbox with consistent styling
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

    // Create flex container for conversation layout
    createFlexContainer() {
      const container = document.createElement("div");
      container.style.cssText = `
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0;
      `;
      return container;
    },

    // Get conversation title safely
    getConversationTitle(conversationElement) {
      const titleElement = conversationElement.querySelector(UI_CONFIG.SELECTORS.TITLE_SELECTOR);
      if (titleElement) {
        return titleElement.textContent.trim();
      }

      const projectLink = conversationElement.querySelector(
        UI_CONFIG.SELECTORS.PROJECT_CONVERSATION_LINK_SELECTOR
      );
      if (projectLink) {
        return projectLink.textContent.trim();
      }

      return conversationElement.textContent.trim() || "this conversation";
    },

    // Find interactive element in conversation
    findInteractiveElement(conversationElement) {
      return conversationElement.querySelector(UI_CONFIG.SELECTORS.INTERACTIVE_ELEMENT_SELECTOR);
    },

    getConversationElementFromCheckbox(checkbox) {
      return checkbox.closest('[data-bulk-delete-conversation-owner="true"]')
        || checkbox.parentElement;
    },

    findConversationMenuButton(conversationElement) {
      const selector = UI_CONFIG.SELECTORS.CONVERSATION_MENU_BUTTON
        || UI_CONFIG.SELECTORS.threeDotButton;
      const directButton = conversationElement.querySelector(selector);
      if (directButton) {
        return directButton;
      }

      const parent = conversationElement.parentElement;
      if (!parent) {
        return null;
      }

      const conversationRect = conversationElement.getBoundingClientRect();
      const candidates = Array.from(parent.querySelectorAll(selector));
      const alignedCandidates = candidates
        .map((button) => {
          const rect = button.getBoundingClientRect();
          const overlapsVertically =
            rect.bottom >= conversationRect.top &&
            rect.top <= conversationRect.bottom;
          const centerDistance = Math.abs(
            (rect.top + rect.bottom) / 2 -
            (conversationRect.top + conversationRect.bottom) / 2
          );

          return { button, overlapsVertically, centerDistance };
        })
        .filter((candidate) => candidate.overlapsVertically)
        .sort((a, b) => a.centerDistance - b.centerDistance);

      return alignedCandidates[0] ? alignedCandidates[0].button : null;
    },

    // Dispatch hover event
    dispatchHoverEvent(element) {
      const hoverEvent = new MouseEvent("mouseover", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(hoverEvent);
    },

    // Dispatch pointer down event
    dispatchPointerDownEvent(element) {
      const pointerDownEvent = new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
      });
      element.dispatchEvent(pointerDownEvent);
    },

    // Get all conversations from history
    getHistoryConversations() {
      const history = document.querySelector(UI_CONFIG.SELECTORS.HISTORY);
      if (!history) {
        return [];
      }
      return Array.from(history.querySelectorAll(UI_CONFIG.SELECTORS.CONVERSATION_SELECTOR));
    },

    getProjectConversations() {
      return Array.from(
        document.querySelectorAll(UI_CONFIG.SELECTORS.PROJECT_CONVERSATION_SELECTOR)
      ).filter((conversation) =>
        conversation.querySelector(UI_CONFIG.SELECTORS.PROJECT_CONVERSATION_LINK_SELECTOR)
      );
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

    // Toggle conversation link interaction
    toggleConversationInteraction(conversation, disable = true) {
      if (conversation.matches("a")) {
        // Sidebar conversations are anchors themselves. Disabling pointer
        // events on the host anchor also blocks the injected checkbox.
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

  // Event handling utilities
  const EventHandler = {
    // Handle checkbox click with shift selection
    handleCheckboxClick(event, checkbox) {
      event.stopPropagation();
      this.handleShiftSelection(checkbox);
      GlobalState.setLastCheckedCheckbox(checkbox);
    },

    // Handle shift key selection
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

    // Toggle checkbox in conversation
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

    // Add keyboard event listeners
    addKeyboardListeners() {
      console.log("Adding keyboard event listeners...");
      
      document.addEventListener("keydown", (event) => {
        if (event.key === "Shift") {
          console.log("Shift key pressed");
          GlobalState.setShiftPressed(true);
        }
      });

      document.addEventListener("keyup", (event) => {
        if (event.key === "Shift") {
          console.log("Shift key released");
          GlobalState.setShiftPressed(false);
        }
      });
    }
  };

  // Export to global scope (for backward compatibility)
  window.DOMHandler = DOMHandler;
  window.EventHandler = EventHandler;

  // Register modules with the core system
  if (window.ChatGPTBulkDelete && window.ChatGPTBulkDelete.registerModule) {
    window.ChatGPTBulkDelete.registerModule('DOMHandler', DOMHandler);
    window.ChatGPTBulkDelete.registerModule('EventHandler', EventHandler);
  } else {
    // Fallback: wait for core system to be ready
    const registerModules = () => {
      if (window.ChatGPTBulkDelete && window.ChatGPTBulkDelete.registerModule) {
        window.ChatGPTBulkDelete.registerModule('DOMHandler', DOMHandler);
        window.ChatGPTBulkDelete.registerModule('EventHandler', EventHandler);
      } else {
        setTimeout(registerModules, 50);
      }
    };
    registerModules();
  }

} else {
  console.log("domHandler.js already loaded, skipping re-initialization");
}
