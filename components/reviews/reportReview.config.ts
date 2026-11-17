import { TranslationKeys } from 'types';

export type ReportReviewReasonLabelKey = keyof Pick<
  TranslationKeys,
  | 'reportReasonFakeOrSpam'
  | 'reportReasonIrrelevant'
  | 'reportReasonOffensiveLanguage'
  | 'reportReasonPersonalInfo'
  | 'reportReasonPromotional'
  | 'reportReasonDuplicate'
  | 'reportReasonOther'
  | 'reportReasonScam'
>;

export type ReportReviewReason = {
  code: string;
  labelKey: ReportReviewReasonLabelKey;
};

export const REPORT_REVIEW_REASONS: ReportReviewReason[] = [
  { code: 'fake_or_spam_review', labelKey: 'reportReasonFakeOrSpam' },
  { code: 'irrelevant_inappropriate_review', labelKey: 'reportReasonIrrelevant' },
  { code: 'offensive_abusive_language', labelKey: 'reportReasonOffensiveLanguage' },
  { code: 'personal_information', labelKey: 'reportReasonPersonalInfo' },
  { code: 'promotional_content', labelKey: 'reportReasonPromotional' },
  { code: 'duplicate_review', labelKey: 'reportReasonDuplicate' },
  { code: 'other', labelKey: 'reportReasonOther' },
  { code: 'scam', labelKey: 'reportReasonScam' },
];
