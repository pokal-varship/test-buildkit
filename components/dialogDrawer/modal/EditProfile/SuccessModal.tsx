import CustomButton from '@components/buttons/Button';
import { SUCCESS_CIRCLE_ICON } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { useProductUrl } from '@hooks/useProductUrl';
import { close_dialog } from '@lib/modalHandler';
import { selectIsQrFlowActive } from '@redux/slices/qrFlowSlice';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LanguageCode, TranslationKeys } from 'types';
import Icon from '@components/image/Icons';

interface SuccessModalProps {
    onClose?: () => void;
    title: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({title}) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const router = useRouter();
    const isQrFlowActive = useSelector(selectIsQrFlowActive);
    const { getEditProfileUrl } = useProductUrl();
    const onHandleOk = () => {
        close_dialog(["emailSuccess"]);
        router.push(isQrFlowActive ? getEditProfileUrl() : "/");
    };
  return (
    <div className="dialog-container-email-success">
        <div className="dialog-container-email-success-image">
          <Icon 
            icon={`${SUCCESS_CIRCLE_ICON}#success-circle`} 
            width={120} 
            height={120} 
            viewBox="0 0 22 22" 
            color="var(--success)" 
          />
        </div>

        <div className="text-center">
        <h3 className="title-text">{title}</h3>
        </div>

        <CustomButton
          onClick={onHandleOk}
          aria-label="Close"
          className="ok-button"
        >
          {lang.ok}
        </CustomButton>
      <style>{`
        .dialog-container-email-success {
            width: 100%;
            padding: 0px 10px;
            background-color: var(--cards-containers);
            min-width: 300px;
        }
        .title-text {
            color: var(--primary-text);
            font-size: var(--heading-h2);
            font-weight: var(--font-bold);
            margin-bottom: 20px;
            text-transform: capitalize;
        }
        .ok-button {
            width: 100%;
            font-weight: var(--font-bold);
            font-size: var(--heading-h3);
            text-transform: uppercase;
        }
        .dialog-container-email-success-image {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;
