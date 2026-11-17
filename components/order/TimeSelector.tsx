'use client'
import CustomButton from "@components/buttons/Button";
import Icon from "@components/image/Icons";
import { ARROW_DOWN_IMAGE, CLOCK_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { useEffect, useRef, useState } from "react";
import { LanguageCode, TranslationKeys } from "types";

const TimeSelector = ({ time, handleScheduleOrder }: { time: string[], handleScheduleOrder: (time: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [lang]: [TranslationKeys,LanguageCode] = useLang();
    
    const timeOptions = time;

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
        <div className="w-full max-w-md mx-auto" ref={dropdownRef}>
            <div className="relative">
                {/* Dropdown button */}
                <CustomButton
                    className="time-selector-button flex items-center justify-between"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center">
                        <img src={CLOCK_ICON} width={20} height={20} className="mr-2" alt="Clock Icon" title="Clock Icon" />
                        <span className="text-gray-800">{selectedTime || lang.chooseTime}</span>
                    </div>
                    <Icon
                        icon={`${ARROW_DOWN_IMAGE}#arrow-down`}
                        width={15}
                        height={15}
                        color={'var(--primary-text)'}
                        viewBox="0 0 9 6"
                    />
                </CustomButton>

                {/* Dropdown menu */}
                {isOpen && (
                    <div className="time-selector-dropdown absolute mt-1 w-full ">
                        {timeOptions.map((option, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setSelectedTime(option);
                                    setIsOpen(false);
                                    handleScheduleOrder(option);
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                .time-selector-dropdown {
                    max-height: 200px;
                    overflow-y: auto;
                    background-color: var(--cards-containers);
                    border-radius: 8px;
                }
                .time-selector-button {
                    border-radius: 8px;
                    width: 100%;
                    color:var(--black);
                    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
                    padding: 12px 15px;
                    background: linear-gradient(to bottom, #FFFACF, #FFE727);
                }
                .time-selector-button:hover {
                    color:var(--black);
                    background: linear-gradient(to bottom, #FFFACF, #FFE727);
                }
            `}</style>
        </div>
    );
}

export default TimeSelector;