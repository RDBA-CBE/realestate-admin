"use client"

import { useState, useCallback } from 'react';

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggleIsOn = useCallback(() => {
    setValue(prevValue => !prevValue);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggleIsOn, setTrue, setFalse];
};