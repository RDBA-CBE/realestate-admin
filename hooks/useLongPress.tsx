import { useCallback, useRef } from 'react';

export const useLongPress = (
  callback,
  { delay = 250, shouldPreventDefault = true } = {}
) => {
  const timeout = useRef(null);
  const target = useRef(null);

  const start = useCallback(
    (event) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }

      timeout.current = setTimeout(() => callback(event), delay);
    },
    [callback, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && callback(event);

      if (target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [callback]
  );

  return {
    onMouseDown: (e) => start(e),
    onTouchStart: (e) => start(e),
    onMouseUp: (e) => clear(e, false),
    onMouseLeave: (e) => clear(e, false),
    onTouchEnd: (e) => clear(e),
  };
};

const isTouchEvent = (event) => {
  return 'touches' in event;
};

const preventDefault = (event) => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};