import CustomButton from '@components/buttons/Button';
import SecondaryButton from '@components/buttons/secondaryButton';
import useLang from '@hooks/useLang';
import React from 'react';
import { LanguageCode, TranslationKeys } from 'types';

interface LogoutModalProps {
    onClose: () => void;
    logout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose, logout }) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    return (
        <div className="dialog-container">
            <div className='modalContent'>
                <div className="dialog-header">
                    <h2 className='dialog-title'>{lang.leavingSoSoon}</h2>
                    {/* <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={16}
                        height={16}
                        color={"var(--primary-text)"}
                        className="cursor-pointer"
                        viewBox='0 0 16 16'
                        onClick={onClose}
                    /> */}
                </div>
                <h4 className='dialog-description'>{lang.areYouSureYouWantToLogout}</h4>
                <div className={"buttonContainer"}>
                    <SecondaryButton className="cancelButton" onClick={onClose}>{lang.cancel}</SecondaryButton>
                    <CustomButton className="logoutButton" onClick={logout}>{lang.yes}, {lang.logout}</CustomButton>
                </div>
            </div>
            <style>{`
                .dialog-container  {
                    width: 400px;
                    padding: 0px 10px;
                    min-width: 400px;
                    background-color: var(--tertiary-background);
                }

                .modalContent {
                    border-radius: 8px;
                    text-align: center;
                }
   
                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .buttonContainer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                    gap: 10px;
                }

                .dialog-title{
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color:var(--primary-text);
                }
                .dialog-description{
                    color:var(--primary-text);
                    font-size: var(--heading-h4);
                    font-weight: var(--font-regular);
                    text-align: start;
                }
                .cancelButton{
                    width: 100%;
                    font-size: var(--description-font);
                    font-weight: var(--font-bold);
                }
                .logoutButton{
                    width: 100%;
                    font-size: var(--description-font);
                    font-weight: var(--font-bold);
                }
                @media (max-width: 768px) {
                    .dialog-container {
                        width: 100%;
                        min-width: 0px;
                        padding: 0px;
                    }
                    .modalContent {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LogoutModal;
