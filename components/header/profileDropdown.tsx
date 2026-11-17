'use client'
import { ARROW_DOWN_HEADER_ICON, ARROW_UP_HEADER_ICON, MENU_CONTACT_IMAGE } from "@config/Header/image.config";
import { useEffect, useRef, useState } from "react";
import ProfileMenu from './userProfileMenu';
import { ExtendedSession } from "./types";
import Icon from "@components/image/Icons";
import SecondaryButton from '@components/buttons/secondaryButton';

const ProfileDropdown: React.FC<{ session: ExtendedSession }> = ({ session }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div ref={dropdownRef} className="relative inline-block">
            <SecondaryButton
                className={`flex items-center gap-2 !rounded-lg !border !border-[var(--primary-color)] !px-3 !py-2 transition-colors max-w-[140px] w-full ${isOpen ? '!bg-[var(--button-primary-active-background)]' : '!bg-[var(--primary-background)] hover:!bg-[var(--button-primary-active-background)] hover:!text-[var(--primary-text)]'}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <Icon
                    icon={`${MENU_CONTACT_IMAGE}#user`}
                    width={20}
                    height={20}
                    color={"var(--primary-text)"}
                    viewBox="0 0 24 24"
                    className="flex-shrink-0"
                />
                <span className="font-medium username-text truncate flex-1 min-w-0">{session?.user?.firstName}</span>
                <Icon
                    icon={isOpen ? `${ARROW_UP_HEADER_ICON}#arrow-up` : `${ARROW_DOWN_HEADER_ICON}#arrow-down`}
                    width={12}
                    height={7}
                    color={"var(--primary-text)"}
                    viewBox="0 0 12 7"
                />
            </SecondaryButton>
            {isOpen && <ProfileMenu isOpen={isOpen} setIsOpen={setIsOpen} session={session} />}
            <style>{`
                .arrow-up {
                    width: 15px;
                    height: 10px;
                }
                .username-text{
                    font-size: var(--description-font);
                    font-weight: var(--font-semi-bold);
                    text-transform: capitalize;
                    font-family: var(--font-family);
                }
                .email-text{
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    font-family: var(--font-family);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
};

export default ProfileDropdown;
