import { useState, useCallback } from 'react';

export const useQueue = (initialValue = []) => {
  const [queue, setQueue] = useState(initialValue);

  const enqueue = useCallback((value) => {
    setQueue(prevQueue => [...prevQueue, value]);
  }, []);

  const dequeue = useCallback(() => {
    if (queue.length === 0) return undefined;
    
    const firstElement = queue[0];
    setQueue(prevQueue => prevQueue.slice(1));
    return firstElement;
  }, [queue]);

  const peek = useCallback(() => {
    if (queue.length === 0) return undefined;
    return queue[0];
  }, [queue]);

  const clear = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    enqueue,
    dequeue,
    peek,
    clear,
    size: queue.length,
    isEmpty: queue.length === 0,
  };
};