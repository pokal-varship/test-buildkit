import CustomButton from '@components/buttons/Button';
import SecondaryButton from '@components/buttons/secondaryButton';
import Icon from '@components/image/Icons';
import { CROSS_ICON } from '@config/Header/image.config';
import React from 'react';

interface CancelOrderProps {
    onClose?: () => void;
    onYes?: () => void;
    onNo?: () => void;
    title?: string;
    description?: string;
    yesButtonText?: string;
    noButtonText?: string;
}

const CancelOrder: React.FC<CancelOrderProps> = ({ onClose, onYes, onNo, title, description, yesButtonText, noButtonText }) => {
    return (
        <div className="dialog-container">
            <div className='modalContent'>
                <div className="dialog-header-cancel-order">
                    <h2 className='dialog-title'>{title}</h2>
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
                <h4 className='dialog-description'>{description}</h4>
                <div className={"buttonContainer"}>
                    <SecondaryButton className="cancelButton" onClick={onNo}>{noButtonText}</SecondaryButton>
                    <CustomButton className="logoutButton" onClick={onYes}>{yesButtonText}</CustomButton>
                </div>
            </div>
            <style>{`
                .dialog-container  {
                    width: 100%;
                    padding: 0px 10px;
                    min-width: 400px;
                    background-color: var(--cards-containers);
                }

                .modalContent {
                    border-radius: 8px;
                    text-align: center;
                }
   
                .dialog-header-cancel-order {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    text-align: left;
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
                .cross-icon{
                    display: none;
                }
                @media (max-width: 768px) {
                    .dialog-container {
                        width: 100%;
                        min-width: 0px;
                        padding: 0px;
                    }
                    .modalContent {
                        padding: 20px 16px;
                    }
                    .cross-icon{
                        display: block;
                    }
                    .dialog-title{
                        font-size: var(--heading-h4);
                    }
                    .dialog-description{
                        font-size: var(--heading-h5);
                    }
                }
            `}</style>
        </div>
    );
};

export default CancelOrder;
