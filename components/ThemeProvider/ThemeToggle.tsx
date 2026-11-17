import React from "react";
import Icon from "@components/image/Icons";
import { useTheme } from "../../context/ThemeProvider";
import { MOON_DARK_IMAGE, MOON_IMAGE, SUN_DARK_IMAGE, SUN_IMAGE } from "@config/Header/image.config";

const ThemeToggle: React.FC = () => {
    const { toggleTheme, theme } = useTheme();

    const handleToggle = (newTheme: 'light' | 'dark') => {
        if (theme !== newTheme) {
            toggleTheme(newTheme);
        }
    };

    return (
        <div className="theme-toggle">
            <div className={`toggle ${theme !== 'light' ? "active" : ""}`}>
                <span className="moon-icon" onClick={() => handleToggle('dark')}>
                    <Icon
                        icon={`${MOON_IMAGE}#moon`}
                        width={18}
                        height={18}
                        color={theme === 'light' ? "var(--white)" : "var(--primary-icon-color)"}
                        viewBox="0 0 15 16"
                    />
                </span>
                <span className="sun-icon" onClick={() => handleToggle('light')}>
                    <Icon
                        icon={`${SUN_IMAGE}#sun`}
                        width={18}
                        height={18}
                        color={theme === 'light' ? "var(--primary-icon-color)" : "var(--white)"}
                        viewBox= "0 0 17 16"
                    />
                </span>
            </div>
            <style>{`
                .theme-toggle {
                    cursor: pointer;
                    width: 60px;
                    height: 30px;
                    background-color: var(--black);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 5px;
                    position: relative;
                    transition: background 0.3s ease;
                    border: ${theme !== 'light' && "1px solid var(--primary-color)"};
                }
                
                .toggle {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .moon-icon {
                    background-color: ${theme !== 'light' && "var(--primary-color)"};
                    padding: 3px;
                    border-radius: 50%;
                }

                .sun-icon {
                    background-color: ${theme === 'light' && "var(--primary-color)"};
                    padding: 3px;
                    border-radius: 50%;
                }

                .moon-icon svg,
                .sun-icon svg {
                    width: 18px;
                    height: 18px;
                }
            `}</style>
        </div>
    );
};

export default ThemeToggle;
