import { cn } from '@lib/utils';
import React from 'react';

type TextAreaFieldProps = {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange: (value: string) => void;
    containerClassName?: string;
    labelClassName?: string;
    textAreaClassName?: string;
};

const TextAreaField: React.FC<TextAreaFieldProps> = ({
    label,
    placeholder = '',
    value,
    onChange,
    containerClassName = '',
    labelClassName = '',
    textAreaClassName = '',
}) => {
    return (
        <div className={cn(`flex flex-col space-y-1`, containerClassName)}>
            {label && <label className={cn("font-medium", labelClassName)}>{label}</label>}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn("w-full p-2 h-[73px] border bg-[var(--cards-containers)] text-[var(--secondary-text)] border-[var(--borders-dividers)] rounded focus:outline-none resize-none", textAreaClassName)}
            />
        </div>
    );
};

export default TextAreaField;
