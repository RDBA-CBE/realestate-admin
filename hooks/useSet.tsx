import { useState, useCallback } from 'react';

export const useSet = (initialValue = []) => {
  const [set, setSet] = useState(new Set(initialValue));

  const add = useCallback((value) => {
    setSet(prevSet => {
      const newSet = new Set(prevSet);
      newSet.add(value);
      return newSet;
    });
  }, []);

  const remove = useCallback((value) => {
    setSet(prevSet => {
      const newSet = new Set(prevSet);
      newSet.delete(value);
      return newSet;
    });
  }, []);

  const clear = useCallback(() => {
    setSet(new Set());
  }, []);

  const has = useCallback((value) => {
    return set.has(value);
  }, [set]);

  const size = set.size;

  return {
    set,
    add,
    remove,
    clear,
    has,
    size,
    values: Array.from(set.values()),
  };
};