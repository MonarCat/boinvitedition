import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimeConnectionManager, realtimeManager } from '@/services/RealtimeConnectionManager';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => {
  const mockChannel = {
    on: vi.fn(() => mockChannel),
    subscribe: vi.fn(() => mockChannel),
  };
  
  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
      removeChannel: vi.fn(),
    },
  };
});

// Mock window events
const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('RealtimeConnectionManager', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  
  beforeEach(() => {
    // Silence console logs during tests
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = vi.fn();
    console.error = vi.fn();
  });
  
  afterEach(() => {
    // Restore original console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });
  
  it('should be a singleton', () => {
    const instance1 = RealtimeConnectionManager.getInstance();
    const instance2 = RealtimeConnectionManager.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  it('should subscribe to online/offline events', () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
  
  it('should subscribe to a channel', () => {
    const listener = vi.fn();
    const statusListener = vi.fn();
    
    const subscriptionId = realtimeManager.subscribe(
      {
        table: 'bookings',
        filter: 'business_id=eq.123'
      },
      listener,
      statusListener
    );
    
    expect(subscriptionId).toBeDefined();
    expect(subscriptionId).toContain('bookings');
  });
  
  it('should clean up resources on dispose', () => {
    realtimeManager.dispose();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
