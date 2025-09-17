"use client"
import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        
        // Send any queued messages
        while (messageQueueRef.current.length > 0 && wsRef.current.readyState === WebSocket.OPEN) {
          const message = messageQueueRef.current.shift();
          wsRef.current.send(typeof message === 'object' ? JSON.stringify(message) : message);
        }
        
        if (options.onOpen) {
          options.onOpen();
        }
      };
      
      wsRef.current.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          data = event.data;
        }
        
        setLastMessage(data);
        setMessages(prev => [...prev, data]);
        
        if (options.onMessage) {
          options.onMessage(data);
        }
      };
      
      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        
        if (!event.wasClean && options.shouldReconnect !== false) {
          const reconnectDelay = options.reconnectInterval || 3000;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
        
        if (options.onClose) {
          options.onClose(event);
        }
      };
      
      wsRef.current.onerror = (error) => {
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
      };
    } catch (err) {
      setError(err);
    }
  }, [url, JSON.stringify(options)]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof message === 'object' ? JSON.stringify(message) : message);
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(message);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect,
  };
};