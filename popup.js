const CORE_SCRIPT_FILES = [
  "extensionCore.js",
  "config.js",
  "globals.js",
  "utils.js",
  "domHandler.js",
  "conversationHandler.js",
  "checkboxManager.js"
];

const DELAY_SETTINGS_CONFIG = {
  storageKey: "DeepSeekBulkDelete_delaySettings",
  defaults: {
    baseDelayMs: 1200,
    autoSlowdown: true
  },
  minBaseDelayMs: 300,
  maxBaseDelayMs: 10000,
  batchSize: 10
};

function executeScriptFiles(tabId, files) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: files,
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(results);
      }
    );
  });
}

function executeScriptFunction(tabId, func, args = []) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        func: func,
        args: args,
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(results);
      }
    );
  });
}

async function loadCoreScripts(tabId) {
  await executeScriptFiles(tabId, CORE_SCRIPT_FILES);
}

function loadGlobalsThenExecute(tabId, secondaryScript, callback) {
  (async () => {
    await loadCoreScripts(tabId);
    await executeScriptFiles(tabId, [secondaryScript]);
    if (callback) callback();
  })().catch((error) => {
    console.error(`Failed to execute ${secondaryScript}:`, error);
    alert("Unable to run this operation on the current tab.");
  });
}

async function setOperationDelaySettings(tabId, delaySettings) {
  await executeScriptFunction(
    tabId,
    (settings) => {
      window.DeepSeekBulkDeleteOperationSettings = settings;
      return true;
    },
    [delaySettings]
  );
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      resolve(tab);
    });
  });
}

function resetOperationButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.disabled = false;
  button.classList.remove("progress");
  button.style.removeProperty("--progress");
  setDefaultButtonContent(button, buttonId);
}

const SettingsManager = {
  sanitize(settings = {}) {
    const rawDelay = Number(settings.baseDelayMs);
    const baseDelayMs = Math.min(
      DELAY_SETTINGS_CONFIG.maxBaseDelayMs,
      Math.max(
        DELAY_SETTINGS_CONFIG.minBaseDelayMs,
        Number.isFinite(rawDelay)
          ? rawDelay
          : DELAY_SETTINGS_CONFIG.defaults.baseDelayMs
      )
    );

    return {
      baseDelayMs: Math.round(baseDelayMs),
      autoSlowdown:
        typeof settings.autoSlowdown === "boolean"
          ? settings.autoSlowdown
          : DELAY_SETTINGS_CONFIG.defaults.autoSlowdown
    };
  },

  async getSettings() {
    const rawSettings = localStorage.getItem(DELAY_SETTINGS_CONFIG.storageKey);
    let parsedSettings = {};
    try {
      parsedSettings = rawSettings ? JSON.parse(rawSettings) : {};
    } catch (error) {
      console.warn("Invalid delay settings found in localStorage:", error);
    }
    return this.sanitize(parsedSettings);
  },

  async saveSettings(settings) {
    const sanitizedSettings = this.sanitize(settings);
    localStorage.setItem(
      DELAY_SETTINGS_CONFIG.storageKey,
      JSON.stringify(sanitizedSettings)
    );
    return sanitizedSettings;
  },

  async resetSettings() {
    return this.saveSettings(DELAY_SETTINGS_CONFIG.defaults);
  }
};

async function executeBulkOperation(tabId, scriptName, buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.classList.add("progress");
  }

  try {
    await loadCoreScripts(tabId);
    const delaySettings = await SettingsManager.getSettings();
    await setOperationDelaySettings(tabId, delaySettings);
    await executeScriptFiles(tabId, [scriptName]);
  } catch (error) {
    console.error(`Failed to execute ${buttonId}:`, error);
    resetOperationButton(buttonId);
    alert("Unable to run this operation on the current tab.");
  }
}

function addButtonListener(buttonId, scriptName) {
  document.getElementById(buttonId).addEventListener("click", async () => {
    const tab = await getActiveTab();
    if (!tab) return;

    if (buttonId === "bulk-delete") {
      await executeBulkOperation(tab.id, scriptName, buttonId);
    } else {
      loadGlobalsThenExecute(tab.id, scriptName);
    }
  });
}

function updateProgressBar(buttonId, progress) {
  console.log(`Updating progress bar for ${buttonId}:`, progress);
  const button = document.getElementById(buttonId);
  button.classList.add("progress");
  button.style.setProperty("--progress", `${progress}%`);
  button.setAttribute("data-progress", progress);

  if (progress === 100) {
    button.disabled = true;
    setProgressButtonContent(button, "100%", "Delete Complete");

    setTimeout(() => {
      button.disabled = false;
      button.classList.remove("progress");
      setDefaultButtonContent(button, buttonId);
    }, 500);
  } else {
    button.disabled = true;
    setProgressButtonContent(button, `${progress}%`, "Deleting...");
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Received message:", request);
  if (request.action === "updateProgress") {
    updateProgressBar(request.buttonId, request.progress);
  } else if (request.action === "operationComplete") {
    const button = document.getElementById(request.buttonId);
    button.disabled = false;
    button.classList.remove("progress");
    updateProgressBar(request.buttonId, 100);
  }
});

function initializeButtons() {
  addButtonListener("add-checkboxes", "addCheckboxes.js");
  addButtonListener("bulk-delete", "bulkDeleteConversations.js");
  addButtonListener("toggle-checkboxes", "toggleCheckboxes.js");
  addButtonListener("remove-checkboxes", "removeCheckboxes.js");
}

async function initializeSettings() {
  const settingsButton = document.getElementById("settings-button");
  const settingsPanel = document.getElementById("settingsPanel");
  const operationDelayInput = document.getElementById("operationDelayInput");
  const autoSlowdownInput = document.getElementById("autoSlowdownInput");
  const delayPreview = document.getElementById("delayPreview");
  const saveButton = document.getElementById("saveDelaySettings");
  const resetButton = document.getElementById("resetDelaySettings");

  if (
    !settingsButton ||
    !settingsPanel ||
    !operationDelayInput ||
    !autoSlowdownInput ||
    !delayPreview ||
    !saveButton ||
    !resetButton
  ) {
    return;
  }

  const applySettingsToForm = (settings) => {
    operationDelayInput.value = settings.baseDelayMs;
    autoSlowdownInput.checked = settings.autoSlowdown;
    updateDelayPreview();
  };

  const readSettingsFromForm = () => {
    return SettingsManager.sanitize({
      baseDelayMs: operationDelayInput.value,
      autoSlowdown: autoSlowdownInput.checked
    });
  };

  const showSavedState = () => {
    const originalText = saveButton.textContent;
    saveButton.textContent = "Saved";
    setTimeout(() => {
      saveButton.textContent = originalText;
    }, 900);
  };

  function updateDelayPreview() {
    const settings = readSettingsFromForm();

    if (!settings.autoSlowdown) {
      delayPreview.textContent =
        `Fixed ${settings.baseDelayMs} ms between conversations.`;
      return;
    }

    const secondBatchDelay = Math.round(settings.baseDelayMs * 1.25);
    const firstCooldown = settings.baseDelayMs * 3;
    delayPreview.textContent =
      `First 10: ${settings.baseDelayMs} ms each. Next batch: ${secondBatchDelay} ms each, with ${firstCooldown} ms cooldown between batches.`;
  }

  const closeSettings = () => {
    settingsPanel.hidden = true;
    settingsButton.classList.remove("is-active");
  };

  settingsButton.addEventListener("click", () => {
    settingsPanel.hidden = !settingsPanel.hidden;
    settingsButton.classList.toggle("is-active", !settingsPanel.hidden);
  });

  const settingsClose = document.getElementById("settingsClose");
  if (settingsClose) {
    settingsClose.addEventListener("click", closeSettings);
  }

  settingsPanel.addEventListener("click", (event) => {
    if (event.target === settingsPanel) closeSettings();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsPanel.hidden) closeSettings();
  });

  operationDelayInput.addEventListener("input", updateDelayPreview);
  autoSlowdownInput.addEventListener("change", updateDelayPreview);

  saveButton.addEventListener("click", async () => {
    const savedSettings = await SettingsManager.saveSettings(readSettingsFromForm());
    applySettingsToForm(savedSettings);
    showSavedState();
  });

  resetButton.addEventListener("click", async () => {
    const savedSettings = await SettingsManager.resetSettings();
    applySettingsToForm(savedSettings);
  });

  applySettingsToForm(await SettingsManager.getSettings());
}

function createTextSpan(className, textContent) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = textContent;
  return span;
}

function setDefaultButtonContent(button, buttonId) {
  button.replaceChildren(createTextSpan("button-text", "Bulk Delete"));
}

function setProgressButtonContent(button, progressText, buttonText) {
  button.replaceChildren(
    createTextSpan("progress-text", progressText),
    createTextSpan("button-text", buttonText)
  );
}

async function loadVersion() {
  try {
    const manifestData = chrome.runtime.getManifest();
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge && manifestData.version) {
      versionBadge.textContent = `v${manifestData.version}`;
    }
  } catch (error) {
    console.error('Error loading version:', error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeButtons();
  initializeSettings();
  loadVersion();
});
