"use client";
import { ThemeContext } from "@components/ThemeProvider/ThemeContext";
import { getCookie, setCookie } from "@lib/cookie";
import dynamic from "next/dynamic";
import NextTopLoader from 'nextjs-toploader';
import React, { useContext, useState, useEffect, ReactNode } from "react";
import { Theme } from "types";

export const ThemeProvider: React.FC<{
  children: ReactNode;
  initialTheme: Theme;
}> = ({ children, initialTheme }) => {
  const storedTheme = getCookie("theme") as Theme;
  const defaultTheme = storedTheme || initialTheme;
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setCookie("theme", theme);
  }, [theme]);

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <NextTopLoader showSpinner={false} color={'var(--primary-color)'} />
      {children}
    </ThemeContext.Provider>
  );
};

// Define and export the useTheme hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
