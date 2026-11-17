import React from 'react';

interface HeadingTagProps {
    title: string;
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    className?: string;
}

const HeadingTag: React.FC<HeadingTagProps> = ({ title, tag, className }) => {
    const Tag = tag;
    return <Tag className={className} style={{ fontFamily: "var(--font-family)" }}>{title}</Tag>;
};

export default HeadingTag;
