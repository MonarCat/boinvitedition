
import { useState, useCallback } from 'react';
import { useSecurityMonitoring } from './useSecurityMonitoring';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

export const useRateLimiting = (config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) => {
  const [requestCounts, setRequestCounts] = useState<Map<string, RequestRecord>>(new Map());
  const { monitorRateLimiting } = useSecurityMonitoring();

  const checkRateLimit = useCallback((endpoint: string): boolean => {
    const now = Date.now();
    const record = requestCounts.get(endpoint);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      setRequestCounts(prev => new Map(prev.set(endpoint, {
        count: 1,
        resetTime: now + config.windowMs
      })));
      return true;
    }

    if (record.count >= config.maxRequests) {
      monitorRateLimiting(endpoint, record.count, endpoint);
      return false;
    }

    // Increment count
    setRequestCounts(prev => new Map(prev.set(endpoint, {
      ...record,
      count: record.count + 1
    })));
    
    return true;
  }, [config, requestCounts, monitorRateLimiting]);

  const getRemainingRequests = useCallback((endpoint: string): number => {
    const record = requestCounts.get(endpoint);
    if (!record || Date.now() > record.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - record.count);
  }, [config.maxRequests, requestCounts]);

  return {
    checkRateLimit,
    getRemainingRequests
  };
};
