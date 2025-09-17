"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

export const useWorker = (workerScript, options = {}) => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef(null);
  const messageIdRef = useRef(0);
  const callbacksRef = useRef(new Map());

  const postMessage = useCallback((message, transferable = []) => {
    if (!workerRef.current) return null;
    
    const id = messageIdRef.current++;
    const messageWithId = { id, data: message };
    
    return new Promise((resolve, reject) => {
      callbacksRef.current.set(id, { resolve, reject });
      workerRef.current.postMessage(messageWithId, transferable);
    });
  }, []);

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsRunning(false);
      callbacksRef.current.clear();
    }
  }, []);

  useEffect(() => {
    if (typeof Worker === 'undefined') {
      setError(new Error('Web Workers are not supported in this environment'));
      return;
    }

    try {
      const worker = new Worker(workerScript);
      workerRef.current = worker;
      setIsRunning(true);

      worker.onmessage = (event) => {
        const { id, result, error } = event.data;
        const callback = callbacksRef.current.get(id);
        
        if (callback) {
          if (error) {
            callback.reject(error);
          } else {
            callback.resolve(result);
          }
          callbacksRef.current.delete(id);
        }
        
        setResult(result);
      };

      worker.onerror = (error) => {
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
      };

      worker.onmessageerror = (error) => {
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
      };

      return () => {
        terminate();
      };
    } catch (err) {
      setError(err);
    }
  }, [workerScript, terminate, JSON.stringify(options)]);

  return {
    result,
    error,
    isRunning,
    postMessage,
    terminate,
  };
};