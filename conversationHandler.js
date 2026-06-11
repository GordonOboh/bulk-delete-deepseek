if (typeof window.conversationHandlerLoaded === "undefined") {
  console.log("conversationHandler.js loaded");

  window.conversationHandlerLoaded = true;

  const ConversationHandler = {
    getDelaySettings() {
      const delayConfig = UI_CONFIG.OPERATION_DELAY;
      const operationSettings = window.DeepSeekBulkDeleteOperationSettings || {};
      const rawBaseDelay = Number(operationSettings.baseDelayMs);
      const baseDelayMs = Math.min(
        delayConfig.MAX_BASE_DELAY_MS,
        Math.max(
          delayConfig.MIN_BASE_DELAY_MS,
          Number.isFinite(rawBaseDelay)
            ? rawBaseDelay
            : delayConfig.DEFAULT_BASE_DELAY_MS
        )
      );

      return {
        baseDelayMs: Math.round(baseDelayMs),
        autoSlowdown:
          typeof operationSettings.autoSlowdown === "boolean"
            ? operationSettings.autoSlowdown
            : delayConfig.DEFAULT_AUTO_SLOWDOWN
      };
    },

    getIntraBatchDelay(settings, batchIndex) {
      if (!settings.autoSlowdown) {
        return settings.baseDelayMs;
      }
      const delayConfig = UI_CONFIG.OPERATION_DELAY;
      const multiplier = 1 + batchIndex * delayConfig.INTRA_BATCH_GROWTH;
      return Math.min(
        delayConfig.MAX_INTRA_BATCH_DELAY_MS,
        Math.round(settings.baseDelayMs * multiplier)
      );
    },

    getBatchCooldownDelay(settings, completedBatchIndex) {
      if (!settings.autoSlowdown) {
        return settings.baseDelayMs;
      }
      const delayConfig = UI_CONFIG.OPERATION_DELAY;
      const multiplier =
        delayConfig.BATCH_COOLDOWN_BASE_MULTIPLIER +
        completedBatchIndex * delayConfig.BATCH_COOLDOWN_GROWTH_MULTIPLIER;
      return Math.min(
        delayConfig.MAX_BATCH_COOLDOWN_MS,
        Math.round(settings.baseDelayMs * multiplier)
      );
    },

    getDelayAfterConversation(settings, currentIndex, totalCount) {
      if (currentIndex >= totalCount - 1) {
        return 0;
      }
      const delayConfig = UI_CONFIG.OPERATION_DELAY;
      const currentBatchIndex = Math.floor(currentIndex / delayConfig.BATCH_SIZE);
      const nextIndex = currentIndex + 1;
      const startsNextBatch = nextIndex % delayConfig.BATCH_SIZE === 0;

      if (startsNextBatch) {
        return this.getBatchCooldownDelay(settings, currentBatchIndex);
      }
      return this.getIntraBatchDelay(settings, currentBatchIndex);
    },

    async performOperation(operation, selectedConversations, buttonId) {
      if (selectedConversations.length === 0) {
        console.log(`No conversations to ${operation.toLowerCase()}.`);
        CommonUtils.removeAllCheckboxes();
        ChromeUtils.sendComplete(buttonId);
        return;
      }

      console.log(`Selected conversations for ${operation}:`, selectedConversations.length);

      let processedCount = 0;
      let skippedCount = 0;
      const delaySettings = this.getDelaySettings();

      for (let i = 0; i < selectedConversations.length; i++) {
        try {
          const result = await this.processConversation(operation, selectedConversations[i]);
          if (result) {
            processedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`Error processing conversation ${i + 1}:`, error);
          skippedCount++;
        }

        const progress = Math.round(((i + 1) / selectedConversations.length) * 100);
        ChromeUtils.sendProgress(buttonId, progress);

        const delayAfterConversation = this.getDelayAfterConversation(
          delaySettings, i, selectedConversations.length
        );
        if (delayAfterConversation > 0) {
          await CommonUtils.delay(delayAfterConversation);
        }
      }

      console.log(`${operation} completed: ${processedCount} processed, ${skippedCount} skipped`);
      ChromeUtils.sendComplete(buttonId);
    },

    async processConversation(operation, checkbox) {
      await CommonUtils.delay(UI_CONFIG.DELAYS.SHORT);

      const conversationElement = DOMHandler.getConversationElementFromCheckbox
        ? DOMHandler.getConversationElementFromCheckbox(checkbox)
        : checkbox.parentElement;
      const titleEl = conversationElement.querySelector(UI_CONFIG.SELECTORS.TITLE_SELECTOR);

      try {
        DOMHandler.dispatchHoverEvent(conversationElement);
        if (titleEl) DOMHandler.dispatchHoverEvent(titleEl);
        await CommonUtils.delay(UI_CONFIG.DELAYS.MEDIUM);

        const dotsButton = this.findThreeDotButton(conversationElement);
        if (!dotsButton) {
          throw new Error("Three-dot menu button not found");
        }

        DOMHandler.dispatchPointerDownEvent(dotsButton);
        dotsButton.click();
        await CommonUtils.delay(UI_CONFIG.DELAYS.LONG);

        const deleteButton = await this.waitForDeleteButton(operation);
        if (!deleteButton) {
          throw new Error(`${operation} button not found in context menu`);
        }

        deleteButton.click();

        if (operation === 'DELETE') {
          const confirmButton = await CommonUtils.waitForElement(
            UI_CONFIG.SELECTORS.CONFIRM_DELETE_BUTTON
          );
          if (confirmButton) {
            confirmButton.click();
            await CommonUtils.waitForElementToDisappear(
              UI_CONFIG.SELECTORS.CONFIRM_DELETE_BUTTON
            );
          }
        } else {
          await CommonUtils.delay(UI_CONFIG.DELAYS.EXTENDED);
        }

        return true;
      } catch (error) {
        console.log(`Could not complete ${operation.toLowerCase()} process:`, error);
        return false;
      }
    },

    findThreeDotButton(conversationElement) {
      const titleEl = conversationElement.querySelector(UI_CONFIG.SELECTORS.TITLE_SELECTOR);
      if (titleEl && titleEl.nextElementSibling) {
        return titleEl.nextElementSibling;
      }
      return DOMHandler.findConversationMenuButton(conversationElement);
    },

    async waitForDeleteButton(operation, parent = document, timeout = UI_CONFIG.TIMEOUTS.ELEMENT_WAIT) {
      try {
        return await CommonUtils.waitForElementByStrategy(operation, parent, timeout);
      } catch (error) {
        console.warn(`Strategy-based approach failed for ${operation}:`, error);
        const selector = UI_CONFIG.SELECTORS.DELETE_BUTTON;
        return await CommonUtils.waitForElement(selector, parent, timeout);
      }
    }
  };

  window.ConversationHandler = ConversationHandler;

} else {
  console.log("conversationHandler.js already loaded, skipping re-initialization");
}
