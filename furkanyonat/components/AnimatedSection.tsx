import React, { Children, cloneElement, isValidElement } from 'react';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

interface AnimatedSectionProps {
  children: React.ReactNode;
  id: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, id }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <section 
      id={id} 
      ref={ref}
      className={`transition-opacity duration-700 ease-out ${isIntersecting ? 'opacity-100' : 'opacity-0'}`}
    >
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          // Pass index as a CSS custom property for staggered animation
          const style = { '--stagger-index': index } as React.CSSProperties;
          return cloneElement(child as React.ReactElement<any>, { style });
        }
        return child;
      })}
    </section>
  );
};

export default AnimatedSection;
