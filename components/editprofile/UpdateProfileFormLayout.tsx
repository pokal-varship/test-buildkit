'use client'

import Icon from "@components/image/Icons";
import Loader from "@components/loader/Loader";
import {
    ARROW_LEFT_ICON,
    CROSS_ICON,
    CROSS_ICON_DARK,
} from "@config/Header/image.config";
import { useTheme } from "context/ThemeProvider";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export interface CustomError extends Error {
    status?: number;
    response?: {
        data?: {
            message?: string;
            data?: { expiresIn?: number };
        };
    };
}

export interface UpdateProfileFormLayoutProps {
    title: string;
    onClose?: () => void;
    loading?: boolean;
    children: ReactNode;
    button: ReactNode;
    /** Optional class for the main content area (e.g. for phone input wrapper) */
    contentClassName?: string;
}

const UpdateProfileFormLayout: React.FC<UpdateProfileFormLayoutProps> = ({
    title,
    onClose,
    loading = false,
    children,
    button,
    contentClassName,
}) => {
    const router = useRouter();
    const { theme } = useTheme();

    const handleClose = () => (onClose ? onClose() : router.back());

    return (
        <>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
                    <Loader />
                </div>
            )}
            <div className="dialog-container-edit-profile">
                <div className={`dialog-container-edit-profile-content ${contentClassName ?? ""}`.trim()}>
                    <div className="header-container-update-email">
                        <div className="flex items-center justify-between w-full">
                            <p className="update-email-text">{title}</p>
                            <Icon
                                icon={`${theme === "light" ? `${CROSS_ICON}#cross` : `${CROSS_ICON_DARK}#cross-dark`}`}
                                width={24}
                                height={24}
                                className="cursor-pointer"
                                viewBox="0 0 24 24"
                                onClick={handleClose}
                            />
                        </div>
                    </div>

                    <div className="header-container-edit-profile">
                        <div className="profile-header-edit-profile">
                            <div className="flex items-center w-full gap-3">
                            <Icon
                                icon={`${ARROW_LEFT_ICON}#arrow`}
                                unit="px"
                                color={"var(--primary-text)"}
                                className="cursor-pointer"
                                viewBox="0 0 22 17"
                                onClick={handleClose}
                            />
                                <div className="profile-details">
                                    <p className="edit-profile-details-text">{title}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {children}
                </div>
                <div className="button-container">{button}</div>
            </div>
            <style>{`
                .dialog-container-edit-profile-content {
                    width: 100%;
                    background-color: var(--tertiary-background);
                }
                .dialog-container-edit-profile {
                    height: 100%;
                    min-width: 450px;
                    padding: 0px 10px;
                }
                .header-container-update-email {
                    margin-bottom: 12px;
                }
                .update-email-text {
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .form-group-edit-profile {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 12px;
                    color: var(--primary-text);
                }
                .label-text {
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    color: var(--secondary-text);
                    margin-bottom: 6px;
                }
                .get-otp {
                    width: 100%;
                    font-weight: var(--font-bold);
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 5px;
                }
                .header-container-edit-profile {
                    display: none;
                }
                .profile-header-edit-profile {
                    background-color: var(--primary-background);
                    padding: 20px 15px;
                    display: flex;
                    align-items: center;
                }
                .form-group-edit-profile input {
                    width: 100%;
                    padding: 10px;
                    border-radius: 8px;
                    background-color: var(--cards-containers);
                    border: 1px solid var(--borders-dividers);
                }
                .form-group-edit-profile input:focus-visible {
                    outline: none;
                }
                .edit-profile-phone-number-input .react-tel-input {
                    width: 100%;
                }
                @media (max-width: 768px) {
                    .header-container-edit-profile {
                        display: block;
                        margin-bottom: 15px;
                    }
                    .header-container-update-email {
                        display: none;
                    }
                    .dialog-container-edit-profile {
                        min-width: 100%;
                        height: calc(100vh - 100px);
                        padding: 0px;
                    }
                    .dialog-container-edit-profile-content {
                        padding: 0px;
                        height: 100%;
                        background-color: var(--tertiary-background);
                    }
                    .form-group-edit-profile {
                        padding: 0px 20px;
                        margin-top: 25px;
                    }
                    .button-container {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        padding: 25px 20px;
                        background-color: var(--primary-background);
                    }
                    .profile-header-edit-profile {
                        padding: 16px;
                        border-bottom: 1px solid var(--borders-dividers);
                    }
                    .edit-profile-details-text {
                        font-size: var(--heading-h4);
                        font-weight: var(--font-semi-bold);
                        color: var(--primary-text);
                    }
                }
            `}</style>
        </>
    );
};

export default UpdateProfileFormLayout;
