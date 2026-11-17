"use client";
import { ExtendedSession } from '@components/header/types';
import Icon from '@components/image/Icons';
import Loader from '@components/loader/Loader';
import { CONTACT_PROFILE_IMAGE, CROSS_ICON, EDIT_PROFILE_IMAGE, LOGOUT_IMAGE, ORDER_IMAGE } from '@config/Header/image.config';
import useAnalytics from '@hooks/useAnalytics';
import useLang from '@hooks/useLang';
import { removeCookie } from '@lib/cookie';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import { logout } from '@services/authService';
import { useTheme } from 'context/ThemeProvider';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface ProfileDrawerProps {
    session: ExtendedSession;
    onClose: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ session, onClose }) => {
    const [lang] = useLang();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const { trackSignIn } = useAnalytics();
    const handleEditProfile = () => {
        setLoading(true);
        router.push("/editProfile");
        close_dialog(["profileMenu"]);
        setLoading(false);
    }

    const handleOrders = () => {
        if (session?.user?.email) {
            router.push("/orders");
            close_dialog(["profileMenu"]);
        } else {
            const source = window.location.pathname === "/" ? "homepage" : (window.location.pathname || "homepage");
            trackSignIn(source, "profile");
            open_dialog("login", {
              open: true,
              propsData: {
                onSuccess: () => {
                  router.push("/orders");
                },
              },
              type: "login",
              handlerDialog: () => {},
              handleClose: () => {},
              anchor: "bottom",
              onlyDialog: false,
              sxStyle: {
                '& .MuiDialogContent-root': {
                    padding: '20px 16px',
                    backgroundColor: 'var(--tertiary-background)',
                },
            },
            });
        }
    }

    const handleLogout = async () => {
        if (!session?.user) return;
        close_dialog(['logout', 'profileMenu']);
        setLoading(true);
        try {
            if (session.user.clientName) {
                await logout(
                    String(session.user.clientName),
                    String(session.user.userId),
                    String(session.user?.refreshToken)
                )
            }
            await signOut();
            removeCookie("token");
            window.location.reload();
            removeCookie('orderType');
        } catch {

        }
    }

    const confirmLogoutDialog = async () => {
        open_dialog("logout", {
            open: true,
            propsData: { logout: handleLogout },
            type: "logout",
            handlerDialog: () => { },
            handleClose: () => { },
            anchor: 'bottom',
            className: "logout-dialog"
        });
        close_dialog(["profileMenu"]);
    };

    const openDeleteAccountDialog = () => {
        close_dialog(["profileMenu"]);
        open_dialog("deleteAccountPopup", {
            open: true,
            propsData: {},
            type: "deleteAccountPopup",
            handlerDialog: () => {},
            handleClose: () => {
                close_dialog(["deleteAccountPopup"]);
            },
            anchor: "bottom",
            onlyDialog: true,
            sxStyle: {
                "& .MuiPaper-root": {
                    maxWidth: "500px",
                    width: "100%",
                },
            },
        });
    };

    if (loading) {
        return <div className="">
            <Loader />
        </div>
    }

    return (
        <div className="profile-dropdown">
            <div className="profile-header-edit">
                <img fetchPriority="high"  title='contact profile' src={CONTACT_PROFILE_IMAGE} alt="contact profile" width={45} height={45} />
                <div className="flex items-center justify-between w-full">
                    <div className="profile-details">
                        <p className="user-name">{session?.user?.firstName} {session?.user?.lastName}</p>
                        <p className="user-email">{session?.user?.email}</p>
                    </div>
                    <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={16}
                        height={16}
                        color={"var(--primary-text)"}
                        className="cursor-pointer cross-icon"
                        viewBox='0 0 16 16'
                        onClick={onClose}
                    />
                </div>
            </div>
            <div className="profile-menu-container">
                <div className="profile-container" onClick={handleEditProfile}>
                    <Icon
                        icon={`${EDIT_PROFILE_IMAGE}#edit-profile`}
                        width={20}
                        height={20}
                        color={"var(--primary-text)"}
                        viewBox="0 0 24 24"
                        className='navigation-icon'
                    />
                    <span className="edit-profile-text">{lang.editProfile}</span>
                </div>
                <div onClick={handleOrders} className="profile-container">
                    <Icon
                        icon={`${ORDER_IMAGE}#order`}
                        width={20}
                        height={20}
                        color={"var(--primary-text)"}
                        viewBox="0 0 24 24"
                        className='navigation-icon'
                    />
                    <span className="edit-profile-text">{lang.orders}</span>
                </div>
                <div className="profile-container" onClick={openDeleteAccountDialog}>
                    <Icon
                        icon={`${LOGOUT_IMAGE}#logout`}
                        width={20}
                        height={20}
                        color={"var(--error)"}
                        viewBox="0 0 24 24"
                        className='navigation-icon'
                    />
                    <span className="edit-profile-text edit-profile-text-danger">{lang.deleteAccount}</span>
                </div>
                <div className="profile-container" onClick={confirmLogoutDialog}>
                    <Icon
                        icon={`${LOGOUT_IMAGE}#logout`}
                        width={20}
                        height={20}
                        color={"var(--primary-text)"}
                        viewBox="0 0 24 24"
                        className='navigation-icon'
                    />
                    <span className="edit-profile-text">{lang.logout}</span>
                </div>
            </div>
            <style>{`
                .edit-profile-text{
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    margin-left: 10px;
                    color: var(--primary-text);
                }
                .edit-profile-text-danger{
                    color: var(--error);
                }
                .profile-container{
                    display: flex;
                    align-items: center;
                    padding: 22px 15px;
                    background-color: var(--primary-background);
                    border-bottom: ${theme === 'light' ? '1px solid var(--borders-dividers)' : '1px solid #212121'};
                }
                .profile-header-edit{
                    background-color: #f8e7c9;
                    padding:20px 15px;
                    display: flex;
                    align-items: center;
                    margin-bottom: 0px;
                }
                .user-name{
                    font-size: var(--description-font);
                    font-weight: var(--font-semi-bold);
                    font-family: var(--font-family);
                    margin-left: 10px;
                    text-transform: capitalize;
                }
                .user-email{
                    font-size: var(--description-font);
                    font-weight: var(--font-semi-bold);
                    font-family: var(--font-family);
                    color: #666;
                    margin-left: 10px;
                }
                .logout-icon{
                    margin-left: -x;
                }
                @media (max-width: 768px) {
                    .logout-icon{
                        margin-left: 0px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfileDrawer;
