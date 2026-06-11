(function() {
  'use strict';

  function getExtensionVersion() {
    try {
      const runtime = typeof chrome !== 'undefined' && chrome.runtime
        ? chrome.runtime
        : typeof browser !== 'undefined' && browser.runtime
          ? browser.runtime
          : null;

      if (runtime && runtime.getManifest) {
        return runtime.getManifest().version;
      }
    } catch (error) {
      console.warn('Unable to read extension version from manifest', error);
    }
    return 'unknown';
  }

  if (window.DeepSeekBulkDelete && window.DeepSeekBulkDelete.initialized) {
    console.log("DeepSeek Bulk Delete core already initialized");
    return;
  }

  window.DeepSeekBulkDelete = {
    version: getExtensionVersion(),
    initialized: false,
    modules: new Map(),
    state: {
      initialized: false,
      modulesLoaded: new Set(),
      operationsInProgress: new Set()
    },
    config: {
      debug: true,
      namespace: 'DeepSeekBulkDelete'
    },
    utils: {
      log: function(level, ...args) {
        const prefix = `[${window.DeepSeekBulkDelete.config.namespace}]`;
        if (console[level]) {
          console[level](prefix, ...args);
        }
      },
      debug: function(...args) {
        if (window.DeepSeekBulkDelete.config.debug) {
          this.log('log', '[DEBUG]', ...args);
        }
      },
      waitForElement: function(selector, timeout = 5000, interval = 100) {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const check = () => {
            const element = document.querySelector(selector);
            if (element) {
              resolve(element);
            } else if (Date.now() - startTime >= timeout) {
              reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            } else {
              setTimeout(check, interval);
            }
          };
          check();
        });
      },
      safeQuery: function(selector, context = document) {
        try {
          return context.querySelector(selector);
        } catch (error) {
          this.log('error', 'DOM query failed:', selector, error);
          return null;
        }
      },
      safeQueryAll: function(selector, context = document) {
        try {
          return context.querySelectorAll(selector);
        } catch (error) {
          this.log('error', 'DOM queryAll failed:', selector, error);
          return [];
        }
      }
    },
    registerModule: function(name, moduleFactory) {
      try {
        if (this.modules.has(name)) {
          this.utils.debug(`Module ${name} already registered, skipping`);
          return this.modules.get(name);
        }
        this.utils.debug(`Registering module: ${name}`);
        const moduleInstance = typeof moduleFactory === 'function'
          ? moduleFactory(this)
          : moduleFactory;
        this.modules.set(name, moduleInstance);
        this.state.modulesLoaded.add(name);
        this.utils.debug(`Module ${name} registered successfully`);
        return moduleInstance;
      } catch (error) {
        this.utils.log('error', `Failed to register module ${name}:`, error);
        return null;
      }
    },
    getModule: function(name) {
      return this.modules.get(name);
    },
    executeOperation: function(operationName, operationFn) {
      try {
        if (this.state.operationsInProgress.has(operationName)) {
          this.utils.debug(`Operation ${operationName} already in progress, skipping`);
          return;
        }
        this.utils.debug(`Starting operation: ${operationName}`);
        this.state.operationsInProgress.add(operationName);
        const result = operationFn();
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            this.state.operationsInProgress.delete(operationName);
            this.utils.debug(`Operation ${operationName} completed`);
          });
        } else {
          this.state.operationsInProgress.delete(operationName);
          this.utils.debug(`Operation ${operationName} completed`);
          return result;
        }
      } catch (error) {
        this.state.operationsInProgress.delete(operationName);
        this.utils.log('error', `Operation ${operationName} failed:`, error);
        const CommonUtils = this.getModule('CommonUtils');
        if (CommonUtils && CommonUtils.showNotification) {
          CommonUtils.showNotification(`Error in ${operationName}: ${error.message}`, 'error');
        }
        throw error;
      }
    },
    discoverExistingModules: function() {
      const moduleMapping = [
        { globalName: 'CommonUtils', moduleName: 'CommonUtils' },
        { globalName: 'DOMHandler', moduleName: 'DOMHandler' },
        { globalName: 'EventHandler', moduleName: 'EventHandler' },
        { globalName: 'ConversationHandler', moduleName: 'ConversationHandler' },
        { globalName: 'ChromeUtils', moduleName: 'ChromeUtils' }
      ];
      moduleMapping.forEach(({ globalName, moduleName }) => {
        if (window[globalName] && !this.modules.has(moduleName)) {
          this.modules.set(moduleName, window[globalName]);
          this.state.modulesLoaded.add(moduleName);
          this.utils.debug(`Auto-registered existing module: ${moduleName}`);
        }
      });
    },
    init: function() {
      if (this.initialized) {
        this.utils.debug('Core already initialized');
        return;
      }
      try {
        this.utils.log('log', `Initializing DeepSeek Bulk Delete v${this.version}`);
        setTimeout(() => {
          this.discoverExistingModules();
        }, 100);
        this.initialized = true;
        this.state.initialized = true;
        this.utils.debug('Core system initialized successfully');
      } catch (error) {
        this.utils.log('error', 'Failed to initialize core system:', error);
        this.initialized = false;
        this.state.initialized = false;
        throw error;
      }
    }
  };

  window.DeepSeekBulkDelete.init();

  if (window.DeepSeekBulkDelete.config.debug) {
    window.DBD = window.DeepSeekBulkDelete;
  }

})();
