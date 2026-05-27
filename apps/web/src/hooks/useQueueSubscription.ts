import { useCallback, useEffect, useRef, useState } from 'react';
import { IMessage } from '@stomp/stompjs';
import { useWebSocket, ConnectionStatus } from './useWebSocket';
import { apiService, QueueEntry } from '@/services/api';

interface QueueStats {
  totalWaiting: number;
  averageWaitTime: number;
  longestWait?: number;
}

interface UseQueueSubscriptionOptions {
  /** Polling interval for REST fallback (ms) */
  pollingInterval?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Auto-start subscription on mount */
  autoStart?: boolean;
}

interface UseQueueSubscriptionReturn {
  /** Current queue entries */
  queue: QueueEntry[];
  /** Queue statistics */
  stats: QueueStats | null;
  /** Connection status */
  connectionStatus: ConnectionStatus;
  /** Whether using REST fallback */
  usingFallback: boolean;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Manually refresh queue (via REST) */
  refresh: () => Promise<void>;
  /** Reset fallback and try WebSocket again */
  retryWebSocket: () => void;
}

/**
 * Custom hook for subscribing to real-time queue updates.
 * 
 * Features:
 * - WebSocket subscription to /topic/queue
 * - Automatic REST polling fallback after WebSocket failures
 * - Queue statistics updates
 * - Manual refresh capability
 */
export function useQueueSubscription(options: UseQueueSubscriptionOptions = {}): UseQueueSubscriptionReturn {
  const {
    pollingInterval = 10000, // 10 seconds
    debug = false,
    autoStart = true,
  } = options;

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  const {
    connectionStatus,
    useFallback,
    subscribe,
    connect,
    resetFallback,
  } = useWebSocket({
    autoConnect: autoStart,
    maxReconnectAttempts: 3,
    debug,
  });

  // Fetch queue via REST API
  const fetchQueueREST = useCallback(async () => {
    try {
      if (debug) console.log('[QueueSubscription] Fetching queue via REST');
      
      const queueData = await apiService.getQueue();
      setQueue(queueData);
      
      // Also fetch stats
      try {
        const statsData = await apiService.getQueueStats();
        setStats(statsData);
      } catch (statsError) {
        // Stats might require authentication, ignore error
        if (debug) console.log('[QueueSubscription] Stats fetch failed (might require auth)');
      }
      
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch queue';
      setError(message);
      console.error('[QueueSubscription] REST fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [debug]);

  // Handle incoming WebSocket queue message
  const handleQueueMessage = useCallback((message: IMessage) => {
    try {
      const data = JSON.parse(message.body);
      if (debug) console.log('[QueueSubscription] Received queue update:', data);
      setQueue(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('[QueueSubscription] Failed to parse queue message:', err);
    }
  }, [debug]);

  // Handle incoming WebSocket stats message
  const handleStatsMessage = useCallback((message: IMessage) => {
    try {
      const data = JSON.parse(message.body);
      if (debug) console.log('[QueueSubscription] Received stats update:', data);
      setStats(data);
    } catch (err) {
      console.error('[QueueSubscription] Failed to parse stats message:', err);
    }
  }, [debug]);

  // Subscribe to WebSocket topics
  const setupWebSocketSubscription = useCallback(() => {
    if (connectionStatus !== 'connected') {
      return;
    }

    if (debug) console.log('[QueueSubscription] Setting up WebSocket subscriptions');

    // Subscribe to queue updates
    const queueSub = subscribe('/topic/queue', handleQueueMessage);
    
    // Subscribe to stats updates
    const statsSub = subscribe('/topic/queue/stats', handleStatsMessage);

    subscriptionRef.current = { queueSub, statsSub };

    // Initial fetch to populate data
    fetchQueueREST();
  }, [connectionStatus, subscribe, handleQueueMessage, handleStatsMessage, fetchQueueREST, debug]);

  // Start REST polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    if (debug) console.log(`[QueueSubscription] Starting REST polling every ${pollingInterval}ms`);

    // Initial fetch
    fetchQueueREST();

    // Set up interval
    pollingRef.current = setInterval(fetchQueueREST, pollingInterval);
  }, [fetchQueueREST, pollingInterval, debug]);

  // Stop REST polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      if (debug) console.log('[QueueSubscription] Stopping REST polling');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [debug]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchQueueREST();
  }, [fetchQueueREST]);

  // Retry WebSocket connection
  const retryWebSocket = useCallback(() => {
    stopPolling();
    resetFallback();
  }, [stopPolling, resetFallback]);

  // Handle connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      stopPolling();
      setupWebSocketSubscription();
    } else if (useFallback || connectionStatus === 'fallback') {
      // Clean up WebSocket subscriptions
      if (subscriptionRef.current) {
        subscriptionRef.current.queueSub?.unsubscribe();
        subscriptionRef.current.statsSub?.unsubscribe();
        subscriptionRef.current = null;
      }
      startPolling();
    }
  }, [connectionStatus, useFallback, setupWebSocketSubscription, startPolling, stopPolling]);

  // Initial load if not auto-starting WebSocket
  useEffect(() => {
    if (!autoStart) {
      fetchQueueREST();
    }
  }, [autoStart, fetchQueueREST]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (subscriptionRef.current) {
        subscriptionRef.current.queueSub?.unsubscribe();
        subscriptionRef.current.statsSub?.unsubscribe();
      }
    };
  }, [stopPolling]);

  return {
    queue,
    stats,
    connectionStatus,
    usingFallback: useFallback || connectionStatus === 'fallback',
    loading,
    error,
    refresh,
    retryWebSocket,
  };
}

export default useQueueSubscription;
