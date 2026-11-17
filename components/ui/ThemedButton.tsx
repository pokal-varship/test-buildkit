export const ThemedButton: React.FC<{
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}> = ({ children, variant = 'primary' }) => {
    return (
        <button
            className={`
          px-4 py-2 rounded
          ${variant === 'primary'
                ? 'bg-[var(--button-primary-background)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover-background)] hover:text-[var(--button-primary-hover-text)]'
                    : 'bg-[var(--button-secondary-background)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover-background)] hover:text-[var(--button-secondary-hover-text)]'}
          font-[var(--font-body)]
          hover:opacity-90 transition-opacity
        `}
        >
            {children}
        </button>
    );
};
