import { LanguageSet } from "../translations/LanguageSet/LanguageSet";
import { useLanguageStore } from "../redux/slices/languageSlice"; // Ensure this is the correct import

type Language = keyof typeof LanguageSet;

export const useLang = (): [typeof LanguageSet[Language], Language] => {
    const language = useLanguageStore(); // Access language directly
    try {
        const lang = LanguageSet[language as Language];
        return [lang, language as Language];
    } catch {

        return [LanguageSet.en, 'en'] as const;
    }
};

export default useLang;
