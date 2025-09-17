"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const targetRef = useRef(null);
  const observerRef = useRef(null);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  const observe = useCallback(() => {
    if (targetRef.current && observerRef.current) {
      observerRef.current.observe(targetRef.current);
    }
  }, []);

  const unobserve = useCallback(() => {
    if (targetRef.current && observerRef.current) {
      observerRef.current.unobserve(targetRef.current);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
      
      if (options.onChange) {
        options.onChange(entry.isIntersecting, entry);
      }
    }, options);
    
    observerRef.current = observer;
    
    return () => {
      observer.disconnect();
    };
  }, [JSON.stringify(options)]);

  useEffect(() => {
    if (targetRef.current && observerRef.current) {
      observerRef.current.observe(targetRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    targetRef,
    isIntersecting,
    entry,
    disconnect,
    observe,
    unobserve,
  };
};