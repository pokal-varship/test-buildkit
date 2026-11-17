import { COIN_ICON, LOGOUT_IMAGE, LOYALITY_ICON, ORDER_IMAGE, PROFILE_ICON, WALLET_ICON } from "@config/Header/image.config";
import formatCurrency from "@lib/helper/price";
import { logout } from "@services/authService";
import useLang from "@hooks/useLang";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import useWallet from "@hooks/useWallet";
import Loader from "@components/loader/Loader";
import Shimmer from "@components/ui/Shimmer";
import { ExtendedSession } from "./types";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import { removeCookie } from "@lib/cookie";
import Icon from "@components/image/Icons";
import { useRouter } from "next/navigation";
import useAnalytics from "@hooks/useAnalytics";
interface ProfileMenuProps {
    isOpen: boolean;
    session: ExtendedSession;
    setIsOpen: (isOpen: boolean) => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, setIsOpen, session }) => {
    const [lang] = useLang();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { trackSignIn } = useAnalytics();
    const userId = session?.user?.userId || session?.user?.id || "";
    const { summary, loading: walletLoading, handleGetWallet, handleClearWallet } = useWallet();

    const walletBalance = summary?.cashBalance ?? 0;
    const loyaltyPointsBalance = summary?.loyaltyPoints ?? 0;
    const isWalletSummaryLoading = walletLoading && !summary;

    useEffect(() => {
        if (!isOpen || !userId) return;
        handleGetWallet(userId, { page: 1, limit: 1 }).catch(() => undefined);
    }, [isOpen, userId, handleGetWallet]);
    const handleLogout = async () => {
        if (!session?.user) return;
        close_dialog(['logout']);
        setLoading(true);
        try {
            if (session.user.clientName) {
                await logout(
                    String(session.user.clientName),
                    String(session.user.userId),
                    String(session.user?.refreshToken)
                )
            }
            handleClearWallet();
            await signOut();
            removeCookie("token");
            window.location.reload();
            removeCookie('orderType');
        } catch {

        }
    };

    const confirmLogoutDialog = async () => {
        open_dialog("logout", {
            open: true,
            propsData: { logout: handleLogout },
            type: "logout",
            handlerDialog: () => { },
            handleClose: () => { },
            anchor: 'bottom',
            className: "logout-dialog",
            sxStyle: {
                '& .MuiPaper-root': {
                    backgroundColor: 'var(--tertiary-background)',
                },
            },
        });
    };

    const openDeleteAccountDialog = () => {
        setIsOpen(false);
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
                    backgroundColor: "var(--tertiary-background)",
                },
            },
        });
    };

    const handleEditProfile = () => {
        open_dialog("updateProfile", {
            open: true,
            propsData: {},
            type: "updateProfile",
            handlerDialog: () => { },
            handleClose: () => { },
            anchor: 'bottom',
            sxStyle: {
                '& .MuiPaper-root': {
                    backgroundColor: 'var(--tertiary-background)',
                },
            },
        });
    };

    const handleOrdersClick = () => {
      if (session?.user && (session.user.email || session.user.phoneNumber)) {
        router.push("/orders");
        setIsOpen(false);
      } else {
        const source = window.location.pathname === "/" ? "homepage" : (window.location.pathname || "homepage");
        trackSignIn(source, "orders");
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
    };

    const handleWalletClick = () => {
      router.push("/wallet");
      setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute left-[20px] mt-2 min-w-[280px] shadow-lg rounded-lg z-10 user-profile-menu">
            {loading ? (
                <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
                    <Loader />
                </div>
            ) : (
                <div className="profile-dropdown-container">
                    <div className="menu-item" onClick={handleEditProfile}>
                        <Icon
                            icon={`${PROFILE_ICON}#profile`}
                            width={20}
                            height={20}
                            color={"var(--primary-text)"}
                            className='navigation-icon-profile'
                            viewBox="0 0 23 23"
                        />
                        <span className="menu-text">{lang.editProfile}</span>
                    </div>

                    <div className="menu-item" onClick={handleOrdersClick}>
                        <Icon
                            icon={`${ORDER_IMAGE}#orders`}
                            width={20}
                            height={20}
                            color={"var(--primary-text)"}
                            viewBox="0 0 24 24"
                            className='navigation-icon-profile'
                        />
                        <span className="menu-text">{lang.orders}</span>
                    </div>

                    <div className="menu-item menu-item-with-badge" onClick={handleWalletClick}>
                        <Icon
                            icon={`${WALLET_ICON}#wallet`}
                            width={20}
                            height={20}
                            color={"var(--primary-text)"}
                            viewBox="0 0 24 24"
                            className="menu-icon-img navigation-icon-profile"
                        />
                        <span className="menu-text">{lang.wallet}</span>
                        <span className="menu-badge menu-badge-wallet">
                            {isWalletSummaryLoading ? (
                                <Shimmer
                                    height={12}
                                    width={52}
                                    borderRadius={9999}
                                    baseColor="rgba(255,255,255,0.25)"
                                    shimmerColor="rgba(255,255,255,0.45)"
                                    className="menu-badge-shimmer"
                                />
                            ) : (
                                formatCurrency({ amount: walletBalance }).trim()
                            )}
                        </span>
                    </div>

                    <div className="menu-item menu-item-with-badge" onClick={handleWalletClick}>
                        <Icon
                            icon={`${LOYALITY_ICON}#loyalty-icon`}
                            width={20}
                            height={20}
                            color={"var(--primary-text)"}
                            viewBox="0 0 24 24"
                            className="menu-icon-img navigation-icon-profile"
                        />
                        <span className="menu-text">{lang.loyaltyPoints}</span>
                        {isWalletSummaryLoading ? (
                            <span className="menu-badge menu-badge-loyalty">
                                <Shimmer
                                    height={12}
                                    width={56}
                                    borderRadius={9999}
                                    baseColor="rgba(255,255,255,0.25)"
                                    shimmerColor="rgba(255,255,255,0.45)"
                                    className="menu-badge-shimmer"
                                />
                            </span>
                        ) : (
                            loyaltyPointsBalance > 0 && (
                                <span className="menu-badge menu-badge-loyalty">
                                    <img
                                        src={COIN_ICON}
                                        alt={lang.loyaltyPoints}
                                        width={14}
                                        height={14}
                                        className="menu-badge-coin-icon"
                                    />
                                    {loyaltyPointsBalance.toLocaleString()}
                                </span>
                            )
                        )}
                    </div>

                    <div className="menu-item" onClick={openDeleteAccountDialog}>
                        <Icon
                            icon={`${LOGOUT_IMAGE}#logout`}
                            width={20}
                            height={20}
                            color={"var(--error)"}
                            viewBox="0 0 22 22"
                            className="logout-icon"
                        />
                        <span className="menu-text menu-text-danger">{lang.deleteAccount}</span>
                    </div>

                    <div className="menu-item" onClick={confirmLogoutDialog}>
                        <Icon
                            icon={`${LOGOUT_IMAGE}#logout`}
                            width={20}
                            height={20}
                            color={"var(--primary-text)"}
                            viewBox="0 0 22 22"
                            className="logout-icon"
                        />
                        <span className="menu-text">{lang.logout}</span>
                    </div>
                </div>
            )}

            <style>{`
                .user-profile-menu {
                    color: var(--primary-text);
                    background-color: var(--cards-containers);
                }

                .profile-dropdown-container {
                    padding: 15px 25px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .menu-item {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }
                .menu-icon-img {
                    display: block;
                    object-fit: contain;
                }

                .navigation-icon-profile {
                    flex-shrink: 0;
                    margin-right: 10px;
                }

                .menu-text {
                    font-size: var(--description-font);
                    font-weight: var(--font-semi-bold);
                    font-family: var(--font-family);
                    color: var(--primary-text);
                    white-space: nowrap;
                }

                .menu-text-danger {
                    color: var(--error);
                }

                .menu-badge {
                    flex-shrink: 0;
                    margin-left: 8px;
                    padding: 4px 5px;
                    border-radius: 9999px;
                    font-size: var(--extraSmall-font);
                    font-weight: var(--font-semi-bold);
                    font-family: var(--font-family);
                    color: var(--white);
                    line-height: 1.2;
                    white-space: nowrap;
                }

                .menu-badge-wallet {
                    background: linear-gradient(180deg, #FD7F12 0%, #ED64DD 100%);
                }

                .menu-badge-loyalty {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: linear-gradient(101.32deg, #B350FF 17.81%, #8D29F7 84.28%);
                }
                .menu-badge-coin-icon {
                    flex-shrink: 0;
                }

                .menu-badge-shimmer {
                    display: block;
                }

                .logout-dialog {
                    width: 400px !important;
                }
                .logout-icon {
                    margin-left: 3px;
                    margin-right: 7px;
                }

                @media (max-width: 768px) {
                    .logout-dialog {
                        width: 100% !important;
                    }

                    .menu-text {
                        font-size: var(--small-font);
                    }

                    .navigation-icon-profile,
                    .menu-icon-img {
                        width: 18px;
                        height: 18px;
                    }

                    .menu-badge {
                        padding: 3px 8px;
                        font-size: 10px;
                    }

                    .menu-badge-coin-icon {
                        width: 12px;
                        height: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfileMenu;
