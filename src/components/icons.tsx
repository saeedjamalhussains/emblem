// Thin-stroke line icons in the kit's style.
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function BagIcon({ className = "h-[18px] w-[18px]" }: P) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden>
      <path d="M4 6.5h12l-.8 10.5H4.8L4 6.5Z" />
      <path d="M7.5 8.5V5a2.5 2.5 0 0 1 5 0v3.5" />
    </svg>
  );
}

export function UserIcon({ className = "h-[18px] w-[18px]" }: P) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...base} aria-hidden>
      <circle cx="10" cy="7" r="3.2" />
      <path d="M3.8 17c.9-3.1 3.3-4.6 6.2-4.6s5.3 1.5 6.2 4.6" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: P) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden>
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  );
}

export function ArrowIcon({ className = "h-3.5 w-3.5" }: P) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function CheckIcon({ className = "h-3.5 w-3.5" }: P) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden>
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}
