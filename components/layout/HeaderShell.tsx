/** Minimal header placeholder while the real header hydrates (if ever suspended). */
export default function HeaderShell() {
  return (
    <header
      className="w-full border-b border-[var(--borders-dividers)] bg-[var(--primary-background)]"
      style={{ minHeight: 64 }}
      aria-hidden
    />
  );
}
