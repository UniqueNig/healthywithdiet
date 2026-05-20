'use client';

import { useEffect, useRef } from 'react';

const ITEMS = [
  'Recipes',
  'Nutrition',
  'Catering',
  'Food Science',
  'Education',
  'Business',
  'Home Cooking',
  'Wellness',
];

export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const animation = node.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-50%)' },
      ],
      {
        duration: 40000,
        iterations: Infinity,
        easing: 'linear',
      },
    );

    return () => animation.cancel();
  }, []);

  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="relative overflow-hidden border-y border-border bg-primary-deep text-primary-fg">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-primary-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-primary-deep to-transparent" />
      <div
        ref={trackRef}
        className="flex w-max items-center py-4 will-change-transform"
      >
        {doubled.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex items-center">
            <span className="px-10 font-serif text-xl italic tracking-wide text-primary-fg/90 sm:text-2xl">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary-fg/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
