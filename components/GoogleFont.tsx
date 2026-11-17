'use client'
import React, { useEffect } from "react";

const GoogleFont = () => {
  const fontName = process.env.NEXT_PUBLIC_FONT_FAMILY;
  const fonts = fontName?.split(",");
  const primaryFont = fonts?.[0]?.trim();
  const formattedFont = primaryFont?.replace(/ /g, "+");

  useEffect(() => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700&display=swap`;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.media = 'print'; // Prevents blocking render
    link.onload = () => {
      link.media = 'all'; // Apply once loaded
    };

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [formattedFont]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
    </>
  );
};

export default GoogleFont;
