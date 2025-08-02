/**
 * Utility for managing localStorage quota and automatic cleanup
 */

interface StorageItem {
  key: string;
  timestamp: number;
  size: number;
}

export class StorageManager {
  private static readonly MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB (conservative limit)
  private static readonly CLEANUP_THRESHOLD = 0.8; // Start cleanup at 80% capacity
  
  /**
   * Safely set an item in localStorage with automatic cleanup
   */
  static setItem(key: string, value: string): void {
    try {
      // Try to set the item directly first
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting cleanup...');
        this.cleanup();
        
        try {
          // Try again after cleanup
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('Failed to store item even after cleanup:', retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Get current storage usage information
   */
  static getStorageInfo(): { used: number; items: StorageItem[] } {
    let totalSize = 0;
    const items: StorageItem[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = new Blob([key, value]).size;
        totalSize += size;

        // Try to extract timestamp from report items
        let timestamp = Date.now();
        if (key.startsWith('report-')) {
          try {
            const data = JSON.parse(value);
            // Use report creation time if available, otherwise current time
            timestamp = data.timestamp || Date.now();
          } catch {
            // If parsing fails, use current time
          }
        }

        items.push({ key, timestamp, size });
      }
    }

    return { used: totalSize, items };
  }

  /**
   * Clean up old items to free space
   */
  static cleanup(): void {
    const { used, items } = this.getStorageInfo();
    
    if (used < this.MAX_STORAGE_SIZE * this.CLEANUP_THRESHOLD) {
      return; // No cleanup needed
    }

    // Sort by timestamp (oldest first) and prioritize report items for cleanup
    const sortedItems = items
      .filter(item => item.key.startsWith('report-')) // Only cleanup report items
      .sort((a, b) => a.timestamp - b.timestamp);

    let freedSpace = 0;
    const targetFreeSpace = this.MAX_STORAGE_SIZE * 0.3; // Free 30% of max capacity

    for (const item of sortedItems) {
      if (freedSpace >= targetFreeSpace) {
        break;
      }

      console.log(`Removing old report: ${item.key}`);
      localStorage.removeItem(item.key);
      freedSpace += item.size;
    }

    console.log(`Cleanup completed. Freed ${freedSpace} bytes.`);
  }

  /**
   * Get a safe storage key with timestamp
   */
  static createReportKey(reportId: string): string {
    return `report-${reportId}`;
  }

  /**
   * Store a report with automatic cleanup
   */
  static storeReport(reportId: string, reportData: any): void {
    // Add timestamp to report data for better tracking
    const dataWithTimestamp = {
      ...reportData,
      timestamp: Date.now()
    };

    const key = this.createReportKey(reportId);
    const value = JSON.stringify(dataWithTimestamp);
    
    this.setItem(key, value);
  }

  /**
   * Get storage usage as percentage
   */
  static getUsagePercentage(): number {
    const { used } = this.getStorageInfo();
    return (used / this.MAX_STORAGE_SIZE) * 100;
  }
}
