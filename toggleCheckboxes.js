/**
 * DeepSeek Bulk Delete - Toggle Checkboxes Operation
 */

(function() {
  'use strict';

  // Wait for core system to be ready
  if (!window.DeepSeekBulkDelete || !window.DeepSeekBulkDelete.initialized) {
    console.error('[ToggleCheckboxes] Core system not ready, deferring execution');
    setTimeout(arguments.callee, 50);
    return;
  }

  const core = window.DeepSeekBulkDelete;
  const utils = core.utils;

  utils.debug('ToggleCheckboxes script loaded');

  /**
   * Main function to toggle all checkboxes
   */
  function toggleAllCheckboxes() {
    return core.executeOperation('toggleCheckboxes', () => {
      utils.log('log', 'Starting checkbox toggle operation');
      
      // Get CheckboxManager module
      const CheckboxManager = core.getModule('CheckboxManager');
      
      if (!CheckboxManager) {
        throw new Error('CheckboxManager module not available');
      }

      // Use CheckboxManager to toggle all checkboxes
      const toggledCount = CheckboxManager.toggleAllCheckboxes();
      
      const result = {
        success: true,
        toggledCount: toggledCount,
        message: toggledCount > 0 
          ? `Successfully toggled ${toggledCount} checkboxes`
          : 'No checkboxes found to toggle'
      };

      utils.log('log', result.message);
      return result;
    });
  }

  // Execute the operation
  try {
    toggleAllCheckboxes();
  } catch (error) {
    utils.log('error', 'Failed to execute toggleCheckboxes operation:', error);
    
    // Show user notification if possible
    const CommonUtils = core.getModule('CommonUtils');
    if (CommonUtils && CommonUtils.showNotification) {
      CommonUtils.showNotification(`Failed to toggle checkboxes: ${error.message}`, 'error');
    }
  }

})();