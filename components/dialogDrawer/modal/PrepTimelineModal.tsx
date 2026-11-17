import React from 'react';
import { X_ICON } from '@config/Header/image.config';
import Icon from '@components/image/Icons';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import PrepTimeContent from '@components/productDetailPage/PrepTimeContent';

interface PrepTimelineModalProps {
  onClose: () => void;
  preparationTime?: number;
  cookingTime?: number;
  totalTime?: number;
}

const PrepTimelineModal: React.FC<PrepTimelineModalProps> = ({
  onClose,
  preparationTime,
  cookingTime,
  totalTime,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  return (
    <div className="prep-timeline-modal">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[var(--primary-text)] font-[var(--font-bold)] text-base">
          {lang.preparationTimeline}
        </h3>
        <Icon
          icon={`${X_ICON}#cross`}
          width={20}
          height={20}
          color={"var(--primary-text)"}
          className="cursor-pointer"
          viewBox="0 0 24 24"
          onClick={onClose}
        />
      </div>

      {/* Shared content component */}
      <PrepTimeContent
        preparationTime={preparationTime}
        cookingTime={cookingTime}
        totalTime={totalTime}
      />

      <style>{`
        .prep-timeline-modal {
          padding: 16px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default PrepTimelineModal;

