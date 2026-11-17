'use client';

import React from 'react';
import styled from 'styled-components';

// Define types for the styled button props
interface StyledButtonProps {
    backgroundColor?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    boxShadow?: string;
    transition?: string;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    width?: string;
    hoverColor?: string;
    [key: string]: unknown; // Changed from any to unknown
}

// Create the styled button with proper typing
const StyledButton = styled.button<StyledButtonProps>`
    background-color: ${({ backgroundColor }) => backgroundColor || 'var(--button-primary-background)'};
    border: ${({ border }) => border || 'var(--button-primary-border-width) solid var(--button-primary-border-color)'};
    border-radius: ${({ borderRadius }) => borderRadius || '8px'};
    padding: ${({ padding }) => padding || '10px'};
    font-size: ${({ fontSize }) => fontSize || 'var(--button-primary-font-size)'};
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    font-weight: ${({ fontWeight }) => fontWeight || '500'};
    font-family: ${({ fontFamily }) => fontFamily || 'var(--font-family)'};
    color: ${({ color }) => color || 'var(--button-primary-text)'};
    width: ${({ width }) => width || 'auto'};
    &:hover {
        background-color: ${({ hoverColor }) => hoverColor || 'var(--button-primary-hover-background)'};
        color: ${({ hoverColor }) => hoverColor || 'var(--button-primary-hover-text)'};
    }
    &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
    }
`;

// Component props interface
interface ButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    label?: string;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    styles?: StyledButtonProps & React.CSSProperties | string;
}

const CustomButton: React.FC<ButtonProps> = ({
    onClick,
    label,
    className,
    disabled = false,
    type = 'button',
    styles = {},
    children,
}) => {
    return (
        <StyledButton
            onClick={onClick}
            className={className}
            disabled={disabled}
            type={type}
            style={styles}
        >
            {label || children}
        </StyledButton>
    );
};

export default CustomButton;