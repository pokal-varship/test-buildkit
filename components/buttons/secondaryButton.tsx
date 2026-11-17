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
    background-color: ${({ backgroundColor }) => backgroundColor || 'var(--button-secondary-background)'};
    border: ${({ border }) => border || 'var(--button-secondary-border-width) solid var(--button-secondary-border-color)'};
    border-radius: ${({ borderRadius }) => borderRadius || '8px'};
    padding: ${({ padding }) => padding || '10px 20px'};
    font-size: ${({ fontSize }) => fontSize || 'var(--button-secondary-font-size)'};
    cursor: pointer;
    font-weight: ${({ fontWeight }) => fontWeight || '500'};
    font-family: ${({ fontFamily }) => fontFamily || 'var(--font-family)'};
    color: ${({ color }) => color || 'var(--button-secondary-text)'};
    width: ${({ width }) => width || 'auto'};
    &:hover {
        background-color: ${({ hoverColor }) => hoverColor || 'var(--button-secondary-hover-background)'};
        color: ${({ hoverColor }) => hoverColor || 'var(--button-secondary-hover-text)'};
    }
    &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
    }
`;

// Component props interface
interface SecondaryButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    label?: string;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    styles?: StyledButtonProps;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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

export default SecondaryButton;