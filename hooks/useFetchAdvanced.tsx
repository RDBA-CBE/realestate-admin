"use client"

import { useState, useEffect, useCallback, useRef } from 'react';

export const useFetchAdvanced = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const retryCountRef = useRef(0);

  const execute = useCallback(async (overrides = {}) => {
console.log('✌️execute --->', );
    const {
      enableCache = options.enableCache !== false,
      cacheKey = url,
      maxRetries = options.maxRetries || 3,
      retryDelay = options.retryDelay || 1000,
      skip = false,
    } = overrides;

    if (skip) return;

    // Check cache first if enabled
    if (enableCache && cacheRef.current.has(cacheKey)) {
      setData(cacheRef.current.get(cacheKey));
      setStatus('success');
      return;
    }

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setStatus('loading');
    setError(null);

    try {
      const mergedOptions = {
        ...options,
        signal: abortControllerRef.current.signal,
      };

      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // Cache the response if enabled
      if (enableCache) {
        cacheRef.current.set(cacheKey, jsonData);
      }
      
      setData(jsonData);
      setStatus('success');
      retryCountRef.current = 0;
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('aborted');
        return;
      }
      
      setError(err.message);
      setStatus('error');
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setTimeout(() => {
          execute({ ...overrides, skip: false });
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearCache = useCallback((key = null) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const refetch = useCallback((overrides = {}) => {
console.log('✌️refetch --->', );
    return execute(overrides);
  }, [execute]);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, options.immediate]);

  return {
    data,
    loading,
    error,
    status,
    execute,
    abort,
    refetch,
    clearCache,
    retryCount: retryCountRef.current,
  };
};