import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver((mutations) => {
        // Only scroll if the mutation affects content or structure
        const shouldScroll = mutations.some(mutation => 
          mutation.type === 'childList' || 
          (mutation.type === 'attributes' && 
           !mutation.attributeName?.includes('opacity') &&
           !mutation.attributeName?.includes('hover'))
        );

        if (shouldScroll) {
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'], // Only observe these attributes
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}
