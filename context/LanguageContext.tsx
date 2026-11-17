'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie } from '@lib/cookie';
import { setLanguage } from '@redux/slices/languageSlice';
import { useDispatch } from 'react-redux';

interface Language {
    code: string;
    flag: string;
}

interface LanguageContextType {
    selectedLang: Language;
    setSelectedLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export default function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode, initialLanguage: string }) {
    const dispatch = useDispatch();
    const [selectedLang, setSelectedLang] = useState<Language>({
        code: initialLanguage?.toUpperCase() || "EN",
        flag: "https://flagcdn.com/h40/us.png",
    });

    useEffect(() => {
        const cookieLang = getCookie("lang")?.toUpperCase();
        if (cookieLang) {
            setSelectedLang({ code: cookieLang, flag: `https://flagcdn.com/h40/${cookieLang.toLowerCase() === 'en' ? 'us' : cookieLang.toLowerCase()}.png` });
            dispatch(setLanguage(cookieLang.toLowerCase()));
            document.documentElement.setAttribute("lang", cookieLang.toLowerCase());
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ selectedLang, setSelectedLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}; 