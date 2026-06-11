if (typeof window.utilsLoaded === "undefined") {
  console.log("utils.js loaded");

  window.utilsLoaded = true;

  const CommonUtils = {
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    generateTimestamp() {
      return new Date().toISOString().replace("T", " ").substr(0, 19);
    },

    async waitForElement(selector, parent = document, timeout = UI_CONFIG.TIMEOUTS.ELEMENT_WAIT) {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeout) {
        const element = parent.querySelector(selector);
        if (element) return element;
        await this.delay(UI_CONFIG.DELAYS.SHORT);
      }
      throw new Error(`Element ${selector} not found within ${timeout}ms`);
    },

    async waitForElementToDisappear(selector, timeout = UI_CONFIG.TIMEOUTS.ELEMENT_WAIT) {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeout) {
        const element = document.querySelector(selector);
        if (!element) return;
        await this.delay(UI_CONFIG.DELAYS.SHORT);
      }
      throw new Error(`Element ${selector} did not disappear within ${timeout}ms`);
    },

    async waitForElementByText(selector, textOptions, parent = document, timeout = UI_CONFIG.TIMEOUTS.ELEMENT_WAIT) {
      const startedAt = Date.now();
      const texts = Array.isArray(textOptions) ? textOptions : [textOptions];

      while (Date.now() - startedAt < timeout) {
        const elements = parent.querySelectorAll(selector);
        const element = Array.from(elements).find(el => {
          const textContent = el.textContent.trim();
          return texts.some(text =>
            textContent === text || textContent.includes(text)
          );
        });
        if (element) return element;
        await this.delay(UI_CONFIG.DELAYS.SHORT);
      }
      return null;
    },

    async waitForElementByStrategy(operation, parent = document, timeout = UI_CONFIG.TIMEOUTS.ELEMENT_WAIT) {
      const strategies = UI_CONFIG.BUTTON_STRATEGIES[operation.toUpperCase()];
      if (!strategies) {
        throw new Error(`No strategies defined for operation: ${operation}`);
      }

      const startedAt = Date.now();

      while (Date.now() - startedAt < timeout) {
        for (const strategy of strategies) {
          if (strategy === 'text-fallback') {
            const prefix = operation === 'DELETE' ? 'DELETE' : 'ARCHIVE';
            const textOptions = Object.entries(UI_CONFIG.STRINGS)
              .filter(([key]) => key === prefix || key.startsWith(prefix + '_'))
              .map(([, value]) => value);

            const elements = parent.querySelectorAll('div[role="menuitem"], ' + UI_CONFIG.SELECTORS.MENU_OPTION);
            const element = Array.from(elements).find(el => {
              const textContent = el.textContent.trim();
              return textOptions.some(text =>
                textContent === text || textContent.includes(text)
              );
            });

            if (element) {
              return element;
            }
          } else {
            const element = parent.querySelector(strategy);
            if (element) {
              return element;
            }
          }
        }
        await this.delay(UI_CONFIG.DELAYS.SHORT);
      }

      return null;
    },

    getSelectedConversations() {
      return [...document.querySelectorAll(UI_CONFIG.SELECTORS.conversationsCheckbox)];
    },

    removeAllCheckboxes() {
      const checkboxes = document.querySelectorAll(`.${CSS_CLASSES.CHECKBOX}`);
      checkboxes.forEach(checkbox => checkbox.remove());
    },

    showNotification(message, type = 'info') {
      console.log(`[${type.toUpperCase()}] ${message}`);
      if (type === 'error') {
        alert(message);
      }
    }
  };

  const ChromeUtils = {
    getUserInfo() {
      return Promise.resolve({ id: 'local', email: '' });
    },

    sendProgress(buttonId, progress) {
      chrome.runtime.sendMessage({
        action: "updateProgress",
        buttonId: buttonId,
        progress: progress
      });
    },

    sendComplete(buttonId) {
      chrome.runtime.sendMessage({
        action: "operationComplete",
        buttonId: buttonId
      });
    }
  };

  window.CommonUtils = CommonUtils;
  window.ChromeUtils = ChromeUtils;

} else {
  console.log("utils.js already loaded, skipping re-initialization");
}
