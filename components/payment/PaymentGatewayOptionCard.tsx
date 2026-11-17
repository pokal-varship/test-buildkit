'use client';

import { cn } from '@lib/utils';

export type PaymentGatewayOptionCardProps = {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  className?: string;
};

export function PaymentGatewayOptionCard({
  selected,
  onSelect,
  title,
  subtitle,
  iconSrc,
  iconAlt,
  disabled = false,
  className,
}: PaymentGatewayOptionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-xl border p-4 text-left',
        selected
          ? 'border-[var(--primary-color)] bg-[var(--button-primary-active-background)]'
          : 'border-[var(--borders-dividers)] bg-[var(--cards-containers)]',
        disabled && 'pointer-events-none opacity-60',
        className
      )}
    >
      {iconSrc ? (
        <img src={iconSrc} alt={iconAlt ?? title} width={44} height={44} className="shrink-0" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="md-heading-5 heading-6 m-0 font-500 leading-tight text-[var(--primary-text)]">{title}</p>
        {subtitle ? (
          <p className="md-heading-6 extra-small-font m-0 mt-1 font-400 leading-tight text-[var(--secondary-text)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          'ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-[var(--button-primary-background)]'
            : 'border-[var(--borders-dividers)]'
        )}
        aria-hidden
      >
        <span
          className={cn(
            '',
            selected
              ? 'h-3 w-3 rounded-full border-2 border-[var(--button-primary-background)] bg-[var(--button-primary-background)]'
              : ''
          )}
        />
      </div>
    </button>
  );
}
