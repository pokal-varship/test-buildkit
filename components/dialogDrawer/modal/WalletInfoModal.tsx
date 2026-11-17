'use client';

import CustomButton from '@components/buttons/Button';
import Icon from '@components/image/Icons';
import { CROSS_ICON } from '@config/Header/image.config';
import useIsMobile from '@hooks/useIsMobile';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';

interface WalletInfoModalProps {
    title: string;
    description: string;
    onClose: () => void;
}

const WalletInfoModal: React.FC<WalletInfoModalProps> = ({ title, description, onClose }) => {
    const isMobile = useIsMobile();
    const [lang]: [TranslationKeys, LanguageCode] = useLang();

    return (
        <div className="w-full min-w-0 max-w-none bg-[var(--cards-containers)] px-4 py-5 pb-6 md:min-w-[320px] md:max-w-[420px] md:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="heading-3 md-heading-2 m-0 text-left font-700 leading-snug text-[var(--primary-text)]">
                    {title}
                </h2>
                {isMobile && (
                    <button
                        type="button"
                        className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-1"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <Icon
                            icon={`${CROSS_ICON}#cross`}
                            width={16}
                            height={16}
                            color="var(--primary-text)"
                            className="cursor-pointer"
                            viewBox="0 0 16 16"
                        />
                    </button>
                )}
            </div>
            <p className="m-0 text-left font-400 leading-normal text-[var(--primary-text)] [font-size:var(--small-font)] md:mb-6 md:[font-size:var(--description-font)]">
                {description}
            </p>
            {!isMobile && (
                <CustomButton
                    className="heading-4 min-h-12 !w-full rounded-[10px] font-700 text-[var(--button-primary-text)] hover:text-[var(--button-primary-hover-text)]"
                    onClick={onClose}
                >
                    {lang.ok}
                </CustomButton>
            )}
        </div>
    );
};

export default WalletInfoModal;
