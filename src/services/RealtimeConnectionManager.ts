import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RealtimeSubscriptionOptions {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

export type RealtimePayload = {
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  commit_timestamp: string;
};

export type ChannelStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR';
export type EventListener = (payload: RealtimePayload) => void;
export type StatusListener = (status: ChannelStatus) => void;

/**
 * Singleton service for managing Supabase realtime connections
 * This helps reduce the number of WebSocket connections and centralize connection management
 */
export class RealtimeConnectionManager {
  private static instance: RealtimeConnectionManager;
  private channels: Map<string, ReturnType<typeof supabase.channel>>;
  private eventListeners: Map<string, Set<EventListener>>;
  private statusListeners: Map<string, Set<StatusListener>>;
  private reconnectTimers: Map<string, NodeJS.Timeout>;
  private reconnectAttempts: Map<string, number>;
  private maxReconnectAttempts = 10;
  private initialReconnectDelay = 2000; // 2 seconds

  private constructor() {
    this.channels = new Map();
    this.eventListeners = new Map();
    this.statusListeners = new Map();
    this.reconnectTimers = new Map();
    this.reconnectAttempts = new Map();
    
    // Listen for online/offline events to manage reconnections
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
    
    console.log('🌐 RealtimeConnectionManager initialized');
  }

  public static getInstance(): RealtimeConnectionManager {
    if (!RealtimeConnectionManager.instance) {
      RealtimeConnectionManager.instance = new RealtimeConnectionManager();
    }
    return RealtimeConnectionManager.instance;
  }

  /**
   * Get a unique channel key based on subscription options
   */
  private getChannelKey(options: RealtimeSubscriptionOptions): string {
    return `${options.schema || 'public'}.${options.table}.${options.event || '*'}.${options.filter || 'all'}`;
  }

  /**
   * Subscribe to realtime changes
   * Returns a subscription ID that can be used to unsubscribe
   */
  public subscribe(
    options: RealtimeSubscriptionOptions,
    onEvent: EventListener,
    onStatus?: StatusListener
  ): string {
    const channelKey = this.getChannelKey(options);
    
    // Create event listener set if it doesn't exist
    if (!this.eventListeners.has(channelKey)) {
      this.eventListeners.set(channelKey, new Set());
    }
    
    // Add event listener
    this.eventListeners.get(channelKey)?.add(onEvent);
    
    // Add status listener if provided
    if (onStatus) {
      if (!this.statusListeners.has(channelKey)) {
        this.statusListeners.set(channelKey, new Set());
      }
      this.statusListeners.get(channelKey)?.add(onStatus);
    }
    
    // If channel doesn't exist yet, create it
    if (!this.channels.has(channelKey)) {
      this.createChannel(options, channelKey);
    }
    
    console.log(`🔔 Subscribed to ${channelKey}`);
    return channelKey;
  }

  /**
   * Create and configure a new Supabase realtime channel
   */
  private createChannel(options: RealtimeSubscriptionOptions, channelKey: string): void {
    try {
      const channel = supabase.channel(`pooled-${channelKey}`);
      
      channel.on(
        'postgres_changes' as unknown as 'system', // Type casting required due to Supabase client typings
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table: options.table,
          filter: options.filter
        },
        (payload: RealtimePayload) => {
          const eventListeners = this.eventListeners.get(channelKey);
          if (eventListeners) {
            eventListeners.forEach(listener => {
              try {
                listener(payload);
              } catch (error) {
                console.error(`❌ Error in event listener for ${channelKey}:`, error);
              }
            });
          }
        }
      ).subscribe((status: ChannelStatus) => {
        // Reset reconnect attempts on successful connection
        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts.set(channelKey, 0);
          if (this.reconnectTimers.has(channelKey)) {
            clearTimeout(this.reconnectTimers.get(channelKey));
            this.reconnectTimers.delete(channelKey);
          }
        }
        
        // Handle connection failures
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.handleChannelError(options, channelKey);
        }
        
        // Notify all status listeners
        const statusListeners = this.statusListeners.get(channelKey);
        if (statusListeners) {
          statusListeners.forEach(listener => {
            try {
              listener(status);
            } catch (error) {
              console.error(`❌ Error in status listener for ${channelKey}:`, error);
            }
          });
        }
      });
      
      this.channels.set(channelKey, channel);
      console.log(`📡 Channel created for ${channelKey}`);
    } catch (error) {
      console.error(`❌ Error creating channel for ${channelKey}:`, error);
      this.handleChannelError(options, channelKey);
    }
  }

  /**
   * Handle channel connection errors with exponential backoff
   */
  private handleChannelError(options: RealtimeSubscriptionOptions, channelKey: string): void {
    // Get current attempts or initialize to 0
    const attempts = this.reconnectAttempts.get(channelKey) || 0;
    
    // Stop if we've exceeded max attempts
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`⛔ Max reconnect attempts (${this.maxReconnectAttempts}) reached for ${channelKey}`);
      toast.error('Real-time connection failed', {
        description: `Cannot establish connection to ${options.table}. Some updates may be delayed.`,
        duration: 10000,
      });
      return;
    }
    
    // Calculate backoff delay with exponential increase and some jitter
    const delay = this.initialReconnectDelay * Math.pow(1.5, attempts) * (0.9 + Math.random() * 0.2);
    
    // Set reconnect timer
    if (this.reconnectTimers.has(channelKey)) {
      clearTimeout(this.reconnectTimers.get(channelKey));
    }
    
    console.log(`🔄 Reconnect attempt ${attempts + 1} for ${channelKey} in ${Math.round(delay)}ms`);
    
    const timer = setTimeout(() => {
      try {
        // Remove old channel
        const oldChannel = this.channels.get(channelKey);
        if (oldChannel) {
          supabase.removeChannel(oldChannel);
        }
        
        // Create new channel
        this.createChannel(options, channelKey);
        console.log(`🔄 Reconnection attempt ${attempts + 1} executed for ${channelKey}`);
      } catch (error) {
        console.error(`❌ Error during reconnection for ${channelKey}:`, error);
      }
    }, delay);
    
    // Store timer and increment attempts
    this.reconnectTimers.set(channelKey, timer);
    this.reconnectAttempts.set(channelKey, attempts + 1);
  }

  /**
   * Unsubscribe a specific listener from a channel
   */
  public unsubscribe(subscriptionId: string, listener: EventListener): void {
    const eventListeners = this.eventListeners.get(subscriptionId);
    if (eventListeners) {
      eventListeners.delete(listener);
      
      // If no more listeners, clean up the channel
      if (eventListeners.size === 0) {
        this.cleanupChannel(subscriptionId);
      }
    }
  }

  /**
   * Unsubscribe all listeners and remove channel
   */
  public unsubscribeAll(subscriptionId: string): void {
    this.cleanupChannel(subscriptionId);
  }

  /**
   * Clean up channel resources
   */
  private cleanupChannel(channelKey: string): void {
    try {
      // Remove from listener maps
      this.eventListeners.delete(channelKey);
      this.statusListeners.delete(channelKey);
      
      // Clear any reconnect timers
      if (this.reconnectTimers.has(channelKey)) {
        clearTimeout(this.reconnectTimers.get(channelKey));
        this.reconnectTimers.delete(channelKey);
      }
      
      // Remove reconnect attempts counter
      this.reconnectAttempts.delete(channelKey);
      
      // Remove and clean up the channel
      const channel = this.channels.get(channelKey);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelKey);
      }
      
      console.log(`🧹 Cleaned up channel ${channelKey}`);
    } catch (error) {
      console.error(`❌ Error cleaning up channel ${channelKey}:`, error);
    }
  }

  /**
   * Handle browser coming online
   */
  private handleOnline = (): void => {
    console.log('🌐 Browser online - reconnecting all channels');
    this.reconnectAll();
  };

  /**
   * Handle browser going offline
   */
  private handleOffline = (): void => {
    console.log('🔌 Browser offline - channels will reconnect when online');
    // Clear all reconnect timers as they'll fail while offline
    this.reconnectTimers.forEach((timer) => clearTimeout(timer));
    this.reconnectTimers.clear();
  };

  /**
   * Reconnect all channels
   */
  public reconnectAll(): void {
    console.log(`🔄 Reconnecting all channels (${this.channels.size} total)`);
    
    // For each channel, remove and recreate it
    this.channels.forEach((_, channelKey) => {
      const [schema, table, event, filter] = channelKey.split('.');
      
      const options: RealtimeSubscriptionOptions = {
        table,
        schema: schema === 'all' ? undefined : schema,
        event: event === 'all' ? '*' as const : event as 'INSERT' | 'UPDATE' | 'DELETE' | '*',
        filter: filter === 'all' ? undefined : filter
      };
      
      this.handleChannelError(options, channelKey);
    });
  }

  /**
   * Clean up all resources when the app is shutting down
   */
  public dispose(): void {
    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    // Clear all timers
    this.reconnectTimers.forEach(timer => clearTimeout(timer));
    
    // Remove all channels
    this.channels.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error removing channel during disposal:', error);
      }
    });
    
    // Clear all maps
    this.channels.clear();
    this.eventListeners.clear();
    this.statusListeners.clear();
    this.reconnectTimers.clear();
    this.reconnectAttempts.clear();
    
    console.log('🧹 RealtimeConnectionManager disposed');
  }
}

// Export a singleton instance for easy import
export const realtimeManager = RealtimeConnectionManager.getInstance();
