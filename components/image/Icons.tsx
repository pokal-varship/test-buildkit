import React from 'react';

interface IconProps {
    icon: string;
    className?: string;
    color?: string;
    viewBox?: string;
    width?: number;
    height?: number;
    onClick?: () => void;
    unit?: string;
    strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({
    icon,
    className = '',
    color = 'currentColor',
    viewBox,
    width,
    height,
    onClick,
    unit,
    strokeWidth,
}) => {
    return (
        <svg
            className={className}
            width={`${width || 24}${unit || "px"}`}
            height={`${height || 24}${unit || "px"}`}
            fill={color}
            color={color}
            stroke={color}
            strokeWidth={strokeWidth}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            id={icon}
            viewBox={viewBox}
            onClick={onClick}
        >
            <use
                href={icon}
                xlinkHref={icon}
            />
        </svg>
    );
};

export default Icon;
