/** Provisional Evidanor mark: three evidence lines held in an open frame. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="currentColor" />
    <path d="M11 8H8v16h3M14 9h10M14 16h7M14 23h10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="24" cy="16" r="1.6" fill="#A8E0DE" />
  </svg>;
}
