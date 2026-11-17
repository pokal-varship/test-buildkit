import CustomButton from '@components/buttons/Button';
import { ExtendedSession } from '@components/header/types';
import Icon from '@components/image/Icons';
import { CROSS_ICON } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { open_dialog } from '@lib/modalHandler';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { LanguageCode, TranslationKeys } from 'types';
import { Store } from '@components/type/store.types';
import useProductUrl from '@hooks/useProductUrl';

interface AllergyInfoModalProps {
    onClose: () => void;
    store: Store;
}

const AllergyInfoModal: React.FC<AllergyInfoModalProps> = ({ onClose, store }) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const { getCheckoutUrl } = useProductUrl();

    const handleContinue = () => {
        if (session?.user?.email) {
            router.push(getCheckoutUrl(store.slug));
            onClose();
        } else {
            onClose();
            open_dialog("login", {
                open: true,
                propsData: {
                    onSuccess: () => {
                        router.push(getCheckoutUrl(store.slug));
                    }
                },
                type: "login",
                handlerDialog: () => { },
                handleClose: () => { },
                anchor: 'bottom',
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
    return (
        <div className="modal-container">
            <div className="modal-content">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="modal-heading">{lang.allergyInfo}</h2>
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
                <h4 className="modal-description">
                    {lang.allergyInfoDescription}
                </h4>
                <div className="flex items-center justify-end">
                    <CustomButton
                        onClick={handleContinue}
                        className="modal-button"
                    >
                        {lang.continue}
                    </CustomButton>
                </div>
                <style>{`
                .modal-container {
                    width: 100%;
                    padding: 0px 10px;
                    min-width: 400px;
                    background-color: var(--cards-containers);
                }
                .modal-content {
                    padding: 0px;
                }
                .modal-heading {
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .modal-description {
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    color: var(--primary-text);
                    margin-bottom: 20px;
                }
                .modal-button {
                    background-color: var(--primary-color);
                    color: var(--black);
                    border: 1px solid var(--primary-color);
                    width: 150px;
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                }
                .modal-button:hover {
                    color: var(--black);
                }
                @media (max-width: 768px) {
                    .modal-container {
                        min-width: 300px;
                        padding: 0px;
                    }
                }
            `}</style>
            </div>
        </div>
    );
};

export default AllergyInfoModal;
