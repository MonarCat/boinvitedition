/**
 * WebSocket connection utilities for handling Supabase and Pusher connection issues
 */

interface WebSocketStatus {
  connected: boolean;
  error: string | null;
  reconnecting: boolean;
  lastAttempt: Date | null;
}

/**
 * Keep track of websocket connection status across the application
 */
class WebSocketConnectionManager {
  private connectionStatus: Record<string, WebSocketStatus> = {};
  private listeners: Set<(status: Record<string, WebSocketStatus>) => void> = new Set();
  private reconnectTimers: Record<string, NodeJS.Timeout> = {};
  
  constructor() {
    // Monitor browser online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleBrowserOnline);
      window.addEventListener('offline', this.handleBrowserOffline);
    }
  }
  
  /**
   * Register a connection to monitor
   */
  registerConnection(id: string): void {
    if (!this.connectionStatus[id]) {
      this.connectionStatus[id] = {
        connected: false,
        error: null,
        reconnecting: false,
        lastAttempt: null
      };
    }
  }
  
  /**
   * Update the connection status
   */
  updateStatus(id: string, status: Partial<WebSocketStatus>): void {
    if (!this.connectionStatus[id]) {
      this.registerConnection(id);
    }
    
    this.connectionStatus[id] = {
      ...this.connectionStatus[id],
      ...status
    };
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Schedule a reconnection attempt
   */
  scheduleReconnect(
    id: string, 
    reconnectFn: () => void, 
    delay: number = 5000
  ): void {
    // Clear any existing timer
    if (this.reconnectTimers[id]) {
      clearTimeout(this.reconnectTimers[id]);
    }
    
    // Update status to reconnecting
    this.updateStatus(id, { 
      reconnecting: true,
      lastAttempt: new Date()
    });
    
    // Schedule reconnection
    this.reconnectTimers[id] = setTimeout(() => {
      reconnectFn();
    }, delay);
  }
  
  /**
   * Cancel a scheduled reconnection
   */
  cancelReconnect(id: string): void {
    if (this.reconnectTimers[id]) {
      clearTimeout(this.reconnectTimers[id]);
      delete this.reconnectTimers[id];
    }
    
    this.updateStatus(id, { reconnecting: false });
  }
  
  /**
   * Get current status of all connections
   */
  getStatus(): Record<string, WebSocketStatus> {
    return { ...this.connectionStatus };
  }
  
  /**
   * Subscribe to status updates
   */
  subscribe(listener: (status: Record<string, WebSocketStatus>) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in WebSocket status listener:', error);
      }
    });
  }
  
  /**
   * Handle browser coming back online
   */
  private handleBrowserOnline = (): void => {
    console.log('🌐 Browser online - WebSocket connections can resume');
    
    // Update all connections that had errors to try reconnecting
    Object.keys(this.connectionStatus).forEach(id => {
      if (this.connectionStatus[id].error) {
        this.updateStatus(id, { 
          error: null,
          // Don't change the reconnecting status if it's already being handled
        });
      }
    });
  };
  
  /**
   * Handle browser going offline
   */
  private handleBrowserOffline = (): void => {
    console.log('🔌 Browser offline - WebSocket connections will fail');
    
    // Update all connections to offline
    Object.keys(this.connectionStatus).forEach(id => {
      this.updateStatus(id, { 
        connected: false,
        error: 'Browser is offline'
      });
      
      // Cancel any scheduled reconnects as they'll fail
      this.cancelReconnect(id);
    });
  };
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleBrowserOnline);
      window.removeEventListener('offline', this.handleBrowserOffline);
    }
    
    // Clear all timers
    Object.values(this.reconnectTimers).forEach(timer => {
      clearTimeout(timer);
    });
    
    // Clear listeners
    this.listeners.clear();
  }
}

// Export singleton instance
export const webSocketManager = new WebSocketConnectionManager();

/**
 * Hook up WebSocket diagnostic logging to console
 * Useful during development to track connection issues
 */
export const enableWebSocketDiagnostics = (): (() => void) => {
  // Keep a record of the last known statuses to avoid redundant logging
  let lastStatuses: Record<string, WebSocketStatus> = {};
  
  // Subscribe to status changes
  const unsubscribe = webSocketManager.subscribe((newStatus) => {
    Object.entries(newStatus).forEach(([id, status]) => {
      const lastStatus = lastStatuses[id];
      
      // Only log if something changed
      if (!lastStatus || 
          lastStatus.connected !== status.connected ||
          lastStatus.error !== status.error ||
          lastStatus.reconnecting !== status.reconnecting) {
        
        // Log connection changes
        if (lastStatus?.connected !== status.connected) {
          if (status.connected) {
            console.log(`🌐 WebSocket '${id}' connected`);
          } else {
            console.warn(`🔌 WebSocket '${id}' disconnected`);
          }
        }
        
        // Log errors
        if (status.error && lastStatus?.error !== status.error) {
          console.error(`❌ WebSocket '${id}' error: ${status.error}`);
        }
        
        // Log reconnection attempts
        if (status.reconnecting && !lastStatus?.reconnecting) {
          console.log(`🔄 WebSocket '${id}' attempting to reconnect...`);
        } else if (!status.reconnecting && lastStatus?.reconnecting) {
          console.log(`✅ WebSocket '${id}' reconnection complete`);
        }
      }
    });
    
    // Update last known statuses
    lastStatuses = { ...newStatus };
  });
  
  return unsubscribe;
};

/**
 * Register and set up monitoring for Supabase WebSocket
 */
export const setupSupabaseWebSocketMonitoring = (): void => {
  webSocketManager.registerConnection('supabase');
  
  // Update status based on supabase connection events
  // This relies on console messages since Supabase doesn't expose connection events directly
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.warn = function(message: unknown, ...args: unknown[]) {
    // Check for Supabase websocket messages
    if (typeof message === 'string') {
      if (message.includes('WebSocket') && message.includes('closed') && message.includes('supabase')) {
        webSocketManager.updateStatus('supabase', { 
          connected: false,
          error: 'WebSocket connection closed'
        });
      }
    }
    originalConsoleWarn.call(console, message, ...args);
  };
  
  console.error = function(message: unknown, ...args: unknown[]) {
    // Check for Supabase error messages
    if (typeof message === 'string') {
      if ((message.includes('supabase') || message.includes('realtime')) && 
          message.includes('error')) {
        webSocketManager.updateStatus('supabase', { 
          connected: false,
          error: message
        });
      }
    }
    originalConsoleError.call(console, message, ...args);
  };
  
  // Enable diagnostics in development
  if (process.env.NODE_ENV !== 'production') {
    enableWebSocketDiagnostics();
  }
};

/**
 * Register and set up monitoring for Pusher WebSocket
 */
export const setupPusherWebSocketMonitoring = (): void => {
  webSocketManager.registerConnection('pusher');
  
  // This uses the same console message interception approach
  // You could also integrate directly with Pusher client if available
};

// Export all the utilities
export type {
  WebSocketStatus
};

export {
  webSocketManager as default
};
