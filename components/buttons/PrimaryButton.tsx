import Loader from '@components/loader/Loader';
import { cn } from '@lib/utils';
import React from 'react'

type PrimaryButtonProps = {
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}
const PrimaryButton = ({ isDisabled, onClick, className, children, isLoading }: PrimaryButtonProps) => {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "w-full border-none rounded-lg py-3 font-semibold cursor-pointer mt-4 transition",
        isDisabled
          ? "bg-[var(--secondary-background)] text-[var(--secondary-text)]"
          : "bg-[var(--button-primary-background)] text-[var(--button-primary-text)]",
        "hover:bg-[var(--button-primary-hover-background)] hover:text-[var(--button-primary-hover-text)]",
        className
      )}
    >
      {isLoading ? <Loader color="black" size={24} /> : children}
    </button>
  );
}

export default PrimaryButton