import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_CONFIG } from '@/config/api';
import { tokenStorage } from '@/lib/tokenStorage';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'fallback';

interface UseWebSocketOptions {
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Maximum reconnection attempts before fallback */
  maxReconnectAttempts?: number;
  /** Enable debug logging */
  debug?: boolean;
}

interface UseWebSocketReturn {
  /** STOMP client instance */
  client: Client | null;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Number of failed connection attempts */
  failureCount: number;
  /** Whether fallback mode is active (REST polling) */
  useFallback: boolean;
  /** Manually connect to WebSocket */
  connect: () => void;
  /** Manually disconnect from WebSocket */
  disconnect: () => void;
  /** Subscribe to a topic */
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
  /** Reset and try WebSocket again */
  resetFallback: () => void;
}

/**
 * Custom hook for WebSocket connection management with exponential backoff.
 * 
 * Features:
 * - Automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
 * - Falls back to REST polling after maxReconnectAttempts failures
 * - JWT authentication support via STOMP headers
 * - Connection status tracking
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    maxReconnectAttempts = 3,
    debug = false
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [failureCount, setFailureCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);

  // Calculate backoff delay: 1s, 2s, 4s, 8s, 16s, max 30s
  const getBackoffDelay = useCallback((attempt: number): number => {
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay;
  }, []);

  // Get WebSocket URL from API config
  const getWebSocketUrl = useCallback((): string => {
    // Convert HTTP URL to WebSocket URL
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    // Use SockJS endpoint
    return `${baseUrl}/ws`;
  }, []);

  // Create STOMP client
  const createClient = useCallback((): Client => {
    const wsUrl = getWebSocketUrl();
    
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      
      connectHeaders: {
        // Include JWT token if available
        ...(tokenStorage.getAccessToken() && !tokenStorage.isTokenExpired()
          ? { Authorization: `Bearer ${tokenStorage.getAccessToken()}` }
          : {}),
      },

      debug: (msg) => {
        if (debug) {
          console.log('[WebSocket]', msg);
        }
      },

      reconnectDelay: 0, // We handle reconnection manually

      onConnect: () => {
        if (debug) console.log('[WebSocket] Connected');
        setConnectionStatus('connected');
        setFailureCount(0);
        reconnectAttemptRef.current = 0;
      },

      onDisconnect: () => {
        if (debug) console.log('[WebSocket] Disconnected');
        setConnectionStatus('disconnected');
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message']);
        handleConnectionFailure();
      },

      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event);
        handleConnectionFailure();
      },

      onWebSocketClose: () => {
        if (debug) console.log('[WebSocket] WebSocket closed');
        if (connectionStatus === 'connected') {
          // Unexpected disconnect, try to reconnect
          handleConnectionFailure();
        }
      },
    });

    return client;
  }, [getWebSocketUrl, debug, connectionStatus]);

  // Handle connection failure and schedule reconnect
  const handleConnectionFailure = useCallback(() => {
    reconnectAttemptRef.current += 1;
    const attempt = reconnectAttemptRef.current;
    
    setFailureCount(attempt);

    if (attempt >= maxReconnectAttempts) {
      console.warn(`[WebSocket] Max reconnect attempts (${maxReconnectAttempts}) reached, switching to fallback mode`);
      setUseFallback(true);
      setConnectionStatus('fallback');
      return;
    }

    setConnectionStatus('reconnecting');
    
    const delay = getBackoffDelay(attempt);
    if (debug) {
      console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${attempt}/${maxReconnectAttempts})`);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (clientRef.current) {
        clientRef.current.activate();
      }
    }, delay);
  }, [maxReconnectAttempts, getBackoffDelay, debug]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (useFallback) {
      if (debug) console.log('[WebSocket] In fallback mode, skipping connect');
      return;
    }

    if (clientRef.current?.connected) {
      if (debug) console.log('[WebSocket] Already connected');
      return;
    }

    setConnectionStatus('connecting');
    
    if (!clientRef.current) {
      clientRef.current = createClient();
    }

    clientRef.current.activate();
  }, [createClient, useFallback, debug]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
    }

    setConnectionStatus('disconnected');
  }, []);

  // Subscribe to a topic
  const subscribe = useCallback((
    destination: string,
    callback: (message: IMessage) => void
  ): StompSubscription | null => {
    if (!clientRef.current?.connected) {
      console.warn('[WebSocket] Cannot subscribe: not connected');
      return null;
    }

    return clientRef.current.subscribe(destination, callback);
  }, []);

  // Reset fallback mode and try WebSocket again
  const resetFallback = useCallback(() => {
    setUseFallback(false);
    setFailureCount(0);
    reconnectAttemptRef.current = 0;
    setConnectionStatus('disconnected');
    
    // Recreate client and connect
    if (clientRef.current) {
      clientRef.current.deactivate();
    }
    clientRef.current = createClient();
    connect();
  }, [createClient, connect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !useFallback) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Only run on mount/unmount

  return {
    client: clientRef.current,
    connectionStatus,
    failureCount,
    useFallback,
    connect,
    disconnect,
    subscribe,
    resetFallback,
  };
}

export default useWebSocket;
