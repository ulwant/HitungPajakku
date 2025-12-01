import React, { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  step?: number; // px to scroll by; defaults to container width * 0.8
}

const NextPrevScroller: React.FC<Props> = ({ children, className = '', step }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateState = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
  };

  useEffect(() => {
    updateState();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateState());
    el.addEventListener('scroll', updateState, { passive: true });
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateState);
      ro.disconnect();
    };
  }, []);

  const handleScrollBy = (dir: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;
    const amount = step ?? Math.floor(el.clientWidth * 0.8);
    const target = dir === 'left' ? el.scrollLeft - amount : el.scrollLeft + amount;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Prev */}
      <button
        aria-hidden={!canLeft}
        onClick={() => handleScrollBy('left')}
        className={`absolute left-1 z-20 p-1 rounded-full text-slate-600 bg-white/80 shadow-sm -ml-1 transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        title="Sebelumnya"
      >
        ‹
      </button>

      <div ref={ref} className="flex gap-1 w-full overflow-hidden">
        <div className="flex gap-1 whitespace-nowrap">
          {children}
        </div>
      </div>

      {/* Next */}
      <button
        aria-hidden={!canRight}
        onClick={() => handleScrollBy('right')}
        className={`absolute right-1 z-20 p-1 rounded-full text-slate-600 bg-white/80 shadow-sm -mr-1 transition-opacity ${canRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        title="Berikutnya"
      >
        ›
      </button>
    </div>
  );
};

export default NextPrevScroller;
