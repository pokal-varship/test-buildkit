'use client';

import CustomButton from '@components/buttons/Button';
import CloseCircleIcon from '@components/icons/CloseCircleIcon';
import Loader from '@components/loader/Loader';
import { CustomError } from '@components/header/types';
import { useToast } from '@components/toast/Toast';
import useLang from '@hooks/useLang';
import { postReviewReport } from '@services/reviewRatingService';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { LanguageCode, TranslationKeys } from 'types';
import RadioGroup from '../../app/orders/RadioGroup';
import { REPORT_REVIEW_REASONS } from './reportReview.config';

type ReportReviewModalProps = {
  reviewId: string;
  storeId: string;
  onClose: () => void;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  (error as CustomError).response?.data?.message || fallback;

const ReportReviewModal: FC<ReportReviewModalProps> = ({ reviewId, storeId, onClose }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const toast = useToast();
  const [selectedReasonCode, setSelectedReasonCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasonOptions = useMemo(
    () =>
      REPORT_REVIEW_REASONS.map((reason) => ({
        code: reason.code,
        label: lang[reason.labelKey],
      })),
    [lang]
  );

  const selectedReason = reasonOptions.find((reason) => reason.code === selectedReasonCode);

  const handleClose = useCallback(() => {
    setSelectedReasonCode('');
    onClose();
  }, [onClose]);

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await postReviewReport(
        {
          review_id: Number(reviewId),
          reason_code: selectedReason.code,
          reason_detail: selectedReason.label,
        },
        storeId
      );
      toast('success', lang.reportReviewSuccess);
      handleClose();
    } catch (error) {
      toast('error', getErrorMessage(error, lang.reportReviewError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const radioOptions = reasonOptions.map((reason) => ({
    label: reason.label,
    value: reason.code,
  }));

  return (
    <div className="w-full flex flex-col relative h-full md:max-w-[475px] bg-[var(--cards-containers)]">
      <div className="flex flex-col flex-1 h-full overflow-y-auto hide-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3 md-heading-2 font-700 text-[var(--primary-text)]">{lang.reportReview}</h2>
          <CloseCircleIcon
            width={32}
            height={32}
            onClick={handleClose}
            className="cursor-pointer shrink-0"
          />
        </div>

        <RadioGroup
          options={radioOptions}
          optionContainerClassName="gap-3"
          value={selectedReasonCode}
          onChange={(option) => setSelectedReasonCode(option.value)}
          name="reportReviewReason"
          containerClassName="mb-4"
          labelClassName="text-base"
          radioClassName="report-review-radio"
        />
      </div>

      <CustomButton
        disabled={!selectedReasonCode || isSubmitting}
        onClick={handleSubmit}
        className="w-full mt-4"
      >
        {isSubmitting ? <Loader color="var(--button-primary-text)" size={24} /> : lang.Submit}
      </CustomButton>
    </div>
  );
};

export default ReportReviewModal;
