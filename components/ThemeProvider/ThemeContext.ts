import { createContext } from "react";
import { Theme } from "types";

export type ThemeContextType = {
    theme: Theme;
    toggleTheme: (newTheme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
});
