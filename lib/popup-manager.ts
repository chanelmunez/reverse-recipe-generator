/**
 * Global popup manager to ensure only one ingredient popup is visible at a time
 */
class PopupManager {
  private static currentPopupId: string | null = null
  private static closeCallbacks = new Map<string, () => void>()

  /**
   * Register a popup with the manager
   * @param popupId - Unique identifier for the popup
   * @param closeCallback - Function to call when this popup should be closed
   */
  static registerPopup(popupId: string, closeCallback: () => void): void {
    this.closeCallbacks.set(popupId, closeCallback)
  }

  /**
   * Unregister a popup from the manager
   * @param popupId - Unique identifier for the popup
   */
  static unregisterPopup(popupId: string): void {
    this.closeCallbacks.delete(popupId)
    if (this.currentPopupId === popupId) {
      this.currentPopupId = null
    }
  }

  /**
   * Request to open a popup, closing any currently open popup
   * @param popupId - Unique identifier for the popup to open
   * @returns true if the popup can be opened, false if it's already open
   */
  static requestOpen(popupId: string): boolean {
    console.log('PopupManager.requestOpen called for:', popupId, 'Current popup:', this.currentPopupId)
    
    // If this popup is already open, don't do anything
    if (this.currentPopupId === popupId) {
      console.log('Popup already open, returning false')
      return false
    }

    // FORCE close ALL popups first to ensure clean state
    console.log('Force closing all popups before opening new one')
    this.closeCallbacks.forEach((closeCallback, id) => {
      if (id !== popupId) {
        console.log('Force closing popup:', id)
        try {
          closeCallback()
        } catch (error) {
          console.error('Error closing popup:', id, error)
        }
      }
    })

    // Set this popup as the current one
    console.log('Setting current popup to:', popupId)
    this.currentPopupId = popupId
    return true
  }

  /**
   * Notify that a popup has been closed
   * @param popupId - Unique identifier for the popup that was closed
   */
  static notifyClose(popupId: string): void {
    if (this.currentPopupId === popupId) {
      this.currentPopupId = null
    }
  }

  /**
   * Close all popups
   */
  static closeAll(): void {
    console.log('PopupManager.closeAll called, current popup:', this.currentPopupId)
    
    if (this.currentPopupId) {
      const closeCallback = this.closeCallbacks.get(this.currentPopupId)
      if (closeCallback) {
        console.log('Calling close callback for:', this.currentPopupId)
        closeCallback()
      }
      this.currentPopupId = null
    }
    
    // Also close any orphaned popups by calling all registered close callbacks
    console.log('Closing all registered popups as fallback')
    this.closeCallbacks.forEach((closeCallback, popupId) => {
      console.log('Calling fallback close for:', popupId)
      closeCallback()
    })
  }

  /**
   * Get the currently open popup ID
   */
  static getCurrentPopupId(): string | null {
    return this.currentPopupId
  }

  /**
   * Check if a specific popup is currently open
   */
  static isPopupOpen(popupId: string): boolean {
    return this.currentPopupId === popupId
  }
}

export { PopupManager }
