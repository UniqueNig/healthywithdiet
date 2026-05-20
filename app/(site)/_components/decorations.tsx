import type { SVGProps } from 'react';

export function LeafCluster(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M100 210 C 100 180, 100 130, 100 60" />
        <path d="M100 170 C 80 160, 60 150, 50 130 C 70 130, 90 145, 100 170 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M100 140 C 120 130, 140 120, 150 100 C 130 100, 110 115, 100 140 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M100 110 C 78 102, 58 92, 50 70 C 72 72, 92 86, 100 110 Z" fill="currentColor" fillOpacity="0.12" />
        <path d="M100 85 C 120 76, 140 66, 148 44 C 128 44, 110 60, 100 85 Z" fill="currentColor" fillOpacity="0.12" />
        <path d="M100 60 C 90 40, 80 24, 70 12 C 86 16, 96 36, 100 60 Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M100 60 C 110 40, 120 24, 130 12 C 114 16, 104 36, 100 60 Z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="100" cy="60" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}

export function ScribbleUnderline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 220 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
      {...props}
    >
      <path
        d="M3 12 C 40 4, 80 15, 120 9 C 150 5, 180 13, 217 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function SectionDivider(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <line x1="2" y1="9" x2="48" y2="9" />
        <line x1="72" y1="9" x2="118" y2="9" />
        <path d="M55 4 C 60 0, 65 0, 60 9 C 65 18, 60 18, 55 14 Z" fill="currentColor" />
      </g>
    </svg>
  );
}

export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        backgroundImage:
          'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    />
  );
}

export function PlateMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="0.6" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M40 22 C 32 30, 32 38, 40 44 C 48 38, 48 30, 40 22 Z" fill="currentColor" fillOpacity="0.18" />
        <line x1="40" y1="44" x2="40" y2="58" />
      </g>
    </svg>
  );
}
