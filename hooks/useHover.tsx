"use client"

import { useState, useRef, useEffect } from 'react';

export const useHover = () => {
  const [value, setValue] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      const handleMouseOver = () => setValue(true);
      const handleMouseOut = () => setValue(false);

      node.addEventListener('mouseover', handleMouseOver);
      node.addEventListener('mouseout', handleMouseOut);

      return () => {
        node.removeEventListener('mouseover', handleMouseOver);
        node.removeEventListener('mouseout', handleMouseOut);
      };
    }
  }, [ref.current]);

  return [ref, value];
};