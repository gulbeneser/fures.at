import { useState, useRef, useEffect, RefCallback } from 'react';

interface ObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (options: ObserverOptions): [RefCallback<Element>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<Element | null>(null);
  const { triggerOnce = false, ...observerOptions } = options;

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(([entry]) => {
      if (triggerOnce) {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (nodeRef.current && observer.current) {
            observer.current.unobserve(nodeRef.current);
          }
        }
      } else {
        setIsIntersecting(entry.isIntersecting);
      }
    }, observerOptions);

    if (nodeRef.current) {
      observer.current.observe(nodeRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [triggerOnce, observerOptions.root, observerOptions.rootMargin, observerOptions.threshold]);
  
  const refCallback: RefCallback<Element> = (node) => {
    if (node) {
      nodeRef.current = node;
      if (observer.current) {
        observer.current.observe(node);
      }
    }
  };

  return [refCallback, isIntersecting];
};
