if (typeof window.globalsLoaded === "undefined") {
  console.log("globals.js loaded");
  window.globalsLoaded = true;

  const GlobalState = {
    shiftPressed: false,
    lastCheckedCheckbox: null,
    setShiftPressed(pressed) {
      this.shiftPressed = pressed;
    },
    setLastCheckedCheckbox(checkbox) {
      this.lastCheckedCheckbox = checkbox;
    },
    isShiftPressed() {
      return this.shiftPressed;
    },
    getLastCheckedCheckbox() {
      return this.lastCheckedCheckbox;
    }
  };

  window.GlobalState = GlobalState;
  window.shiftPressed = false;
  window.lastCheckedCheckbox = null;

} else {
  console.log("globals.js already loaded, skipping re-initialization");
}
