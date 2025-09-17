"use client"

import { useState, useCallback, useRef } from 'react';

export const useUndoState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const historyRef = useRef([initialValue]);
  const pointerRef = useRef(0);

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current -= 1;
      setState(historyRef.current[pointerRef.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current += 1;
      setState(historyRef.current[pointerRef.current]);
    }
  }, []);

  const setValue = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(state) : value;
    
    // Remove future history if we're not at the end
    if (pointerRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, pointerRef.current + 1);
    }
    
    historyRef.current.push(newValue);
    pointerRef.current = historyRef.current.length - 1;
    setState(newValue);
  }, [state]);

  const clearHistory = useCallback(() => {
    historyRef.current = [state];
    pointerRef.current = 0;
  }, [state]);

  return {
    value: state,
    setValue,
    undo,
    redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < historyRef.current.length - 1,
    history: historyRef.current,
    pointer: pointerRef.current,
    clearHistory,
  };
};