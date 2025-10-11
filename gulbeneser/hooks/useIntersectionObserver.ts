import { useState, useEffect, useRef } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: IntersectionObserverOptions
): [React.Dispatch<React.SetStateAction<Element | null>>, IntersectionObserverEntry | null] => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [node, setNode] = useState<Element | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntry(entry);
        if (options.triggerOnce) {
          observer.current?.unobserve(entry.target);
        }
      } else {
         if (!options.triggerOnce) {
             setEntry(null);
         }
      }
    }, options);

    const { current: currentObserver } = observer;
    if (node) {
      currentObserver.observe(node);
    }

    return () => currentObserver.disconnect();
  }, [node, options.threshold, options.root, options.rootMargin, options.triggerOnce]);

  return [setNode, entry];
};
