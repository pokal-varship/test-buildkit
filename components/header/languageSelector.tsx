import { ARROW_DOWN_IMAGE, ARROW_UP_IMAGE } from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import { setLanguage } from "@redux/slices/languageSlice";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setCookie } from "@lib/cookie";
import { useLanguage } from "context/LanguageContext";

const languages = [
    { code: "EN", flag: "https://flagcdn.com/h40/us.png", name: "English" },
    { code: "AR", flag: "https://flagcdn.com/h40/ar.png", name: "Arabic" },
];

const LanguageSelector: React.FC = () => {
    const { selectedLang, setSelectedLang } = useLanguage();
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const selectLanguage = (lang: { code: string; flag: string }) => {
        setSelectedLang(lang);
        dispatch(setLanguage(lang.code.toLowerCase()));
        document.documentElement.setAttribute("lang", lang.code.toLowerCase());
        setCookie("lang", lang.code.toLowerCase());
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative inline-block text-left language-selector" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="flex items-center">
                <img
                  title="Language Icon"
                  src={selectedLang.flag}
                  alt={selectedLang.code + " language"}
                  style={{ width: "24px", height: "13px" }}
                  className="mr-2"
                  loading="lazy"
                />
                <span className="font-semibold">{selectedLang.code}</span>
                <Icon
                    icon={isOpen ? `${ARROW_UP_IMAGE}#arrow-up` : `${ARROW_DOWN_IMAGE}#arrow-down`}
                    width={24}
                    height={24}
                    color={"var(--primary-text)"}
                    className="arrow-icon"
                />
            </button>

            {isOpen && (
                <div className="absolute mt-2 w-32 border border-gray-300 rounded-md shadow-lg language-selector-containers">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => selectLanguage(lang)}
                            className={`flex items-center w-full px-4 py-2 language-selector-button ${selectedLang.code === lang.code ? "selected-language" : ""
                                }`}
                        >
                            <img
                              fetchPriority="high"
                              title="Language Icon"
                              src={lang.flag}
                              alt={lang.code + " language"}
                              style={{ width: "24px", height: "13px" }}
                              className="mr-2"
                            />
                            {lang.code}
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                .language-selector-containers {
                    color: var(--primary-text);
                    background-color: var(--cards-containers);
                    left: 0;
                    bottom: 40px;
                }
                .arrow-icon {
                    width: 10px;
                    height: 6px;
                    margin-left: 5px;
                }
                .language-selector {
                    margin-right: 0px;
                }
                .selected-language {
                    background-color: var(--primary-color);
                }
                @media (max-width: 768px) {
                    .language-selector-containers {
                        bottom: 30px;
                        left: auto;
                        right: 0;
                    }
                    .language-selector {
                        margin-right: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LanguageSelector;
