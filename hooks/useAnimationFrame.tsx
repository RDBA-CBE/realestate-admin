"use client"

import { useRef, useEffect } from 'react';

export const useAnimationFrame = (callback) => {
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [callback]);
};