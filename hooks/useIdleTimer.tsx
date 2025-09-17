"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

export const useIdleTimer = (timeout = 300000, options = {}) => {
  const [isIdle, setIsIdle] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeout);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastActiveTimeRef = useRef(Date.now());

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsIdle(false);
    setRemainingTime(timeout);
    lastActiveTimeRef.current = Date.now();
    
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      setRemainingTime(0);
      
      if (options.onIdle) {
        options.onIdle();
      }
    }, timeout);
  }, [timeout, JSON.stringify(options)]);

  const pause = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      const elapsed = Date.now() - lastActiveTimeRef.current;
      setRemainingTime(prev => prev - elapsed);
    }
  }, []);

  const resume = useCallback(() => {
    if (!isIdle) {
      lastActiveTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
        setRemainingTime(0);
        
        if (options.onIdle) {
          options.onIdle();
        }
      }, remainingTime);
    }
  }, [isIdle, remainingTime, JSON.stringify(options)]);

  const getElapsedTime = useCallback(() => {
    return Date.now() - lastActiveTimeRef.current;
  }, []);

  const getLastActiveTime = useCallback(() => {
    return new Date(lastActiveTimeRef.current);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleEvent = () => {
      if (isIdle && options.onActive) {
        options.onActive();
      }
      reset();
    };
    
    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });
    
    reset();
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [reset, isIdle, JSON.stringify(options)]);

  return {
    isIdle,
    remainingTime,
    reset,
    pause,
    resume,
    getElapsedTime,
    getLastActiveTime,
  };
};