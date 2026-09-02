import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const BOTTOM_THRESHOLD_PX = 96;

export const useAutoScroll = (changeSignal: string) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldFollowRef = useRef(true);
  const [isAwayFromBottom, setIsAwayFromBottom] = useState(false);

  const updateScrollPosition = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distance <= BOTTOM_THRESHOLD_PX;

    shouldFollowRef.current = isNearBottom;
    setIsAwayFromBottom(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    shouldFollowRef.current = true;
    setIsAwayFromBottom(false);
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  useLayoutEffect(() => {
    if (shouldFollowRef.current) {
      scrollToBottom('auto');
    }
  }, [changeSignal, scrollToBottom]);

  return {
    containerRef,
    isAwayFromBottom,
    onScroll: updateScrollPosition,
    scrollToBottom,
  };
};
