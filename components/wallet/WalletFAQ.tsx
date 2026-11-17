'use client';

import Icon from '@components/image/Icons';
import { ARROW_DOWN_HEADER_ICON, ARROW_UP_HEADER_ICON } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { useState } from 'react';

const WalletFAQ: React.FC = () => {
    const [lang] = useLang();
    const [openIndex, setOpenIndex] = useState(0);

    const faqItems = [
        {
            question: lang.walletPage.faqWhereIsMyCashQuestion,
            answer: lang.walletPage.faqWhereIsMyCashAnswer,
        },
        {
            question: lang.walletPage.faqWhereDoesCashExpireQuestion,
            answer: lang.walletPage.faqWhereDoesCashExpireAnswer,
        },
        {
            question: lang.walletPage.faqWhereIsCashApplicableQuestion,
            answer: lang.walletPage.faqWhereIsCashApplicableAnswer,
        },
        {
            question: lang.walletPage.faqWhenRewardBonusCreditedQuestion,
            answer: lang.walletPage.faqWhenRewardBonusCreditedAnswer,
        },
        {
            question: lang.walletPage.faqWhatIsRewardBonusQuestion,
            answer: lang.walletPage.faqWhatIsRewardBonusAnswer,
        },
    ];

    const toggleItem = (index: number) => {
        setOpenIndex((current) => (current === index ? -1 : index));
    };

    return (
        <section className="mt-6 md:mt-0">
            <h2 className="heading-4 md-heading-3 font-700 m-0 mb-4 text-[var(--primary-text)]">
                {lang.walletPage.faqTitle}
            </h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {faqItems.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <li
                            key={item.question}
                            className="overflow-hidden rounded-[10px] border border-[var(--rating-border-primary)] bg-[var(--cards-containers)]"
                        >
                            <button
                                type="button"
                                className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left"
                                onClick={() => toggleItem(index)}
                                aria-expanded={isOpen}
                            >
                                <span className="font-600 text-[length:var(--description-font)] text-[var(--primary-text)]">
                                    {item.question}
                                </span>
                                <Icon
                                    icon={
                                        isOpen
                                            ? `${ARROW_UP_HEADER_ICON}#arrow-up`
                                            : `${ARROW_DOWN_HEADER_ICON}#arrow-down`
                                    }
                                    width={12}
                                    height={7}
                                    color="var(--primary-text)"
                                    viewBox="0 0 12 7"
                                    className="shrink-0"
                                />
                            </button>
                            {isOpen && (
                                <p className="font-400 m-0 px-4 pb-4 text-[length:var(--small-font)] leading-normal text-[var(--secondary-text)]">
                                    {item.answer}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default WalletFAQ;
