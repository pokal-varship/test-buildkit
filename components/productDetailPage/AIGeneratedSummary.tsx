import StarIcon from "@components/icons/Star";
import useLang from "@hooks/useLang";
import { TranslationKeys, LanguageCode } from "types";
import React from "react";
import { AI_ICON } from "@config/Header/image.config";

// Types
export type AIGeneratedSummaryProps = {
    cardData?: {
        title: string;
        descriptions: string[];
        emoji?: string;
        rating?: number;

    }[];
};

const cardDatas = [
    {
        title: 'What Customers Love',
        descriptions: ['Most criticisms focus on operational aspects rather than the core product quality, suggesting the burger itself is well-received while service elements could be improved.'],
        rating: 4,
    },
    {
        title: 'What Customers Love',
        descriptions: ['Most criticisms focus on operational aspectsroved.', 'Most criticisms focus on operational aspects'],
        emoji: '😊',
    },
];

const AIGeneratedSummary = ({
    cardData = cardDatas,
}: AIGeneratedSummaryProps) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    return (
        <section className="w-full rounded-[10px] bg-gradient-to-br from-[#f6eaff] to-[#eaf6ff] p-3 md:p-5 flex flex-col gap-4">
            <div className="flex gap-2">
                    <img
                    src={AI_ICON}
                    alt="AI Icon"
                    height={32}
                    width={31}
                    className="w-8 h-8"
                    />
                
                <div className="flex flex-col">
                    <span className=" text-[var(--primary-text-light)] font-600">{lang.overallCustomerSentiment}</span>
                <span className="small-font text-[var(--secondary-text)]">{lang.aiGeneratedSummary}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] ">
                {cardData.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-2 min-h-[120px] border border-[var(--inner-allignment-border)]">
                        <div className="flex gap-2">
                            {card.rating && (
                                <div className='flex text-[var(--primary-text-light)] small-font gap-1 bg-[var(--button-primary-background)]  rounded-[30px] min-w-[42px] max-w-[42px] h-[22px] justify-center items-center'>
                                    {card.rating}
                                    <StarIcon height={'12'} width={'12'} pathFillColor={'var(--primary-text-light)'} borderColor={'var(--primary-text-light)'} />
                                </div>
                            )}
                            {card.emoji && (
                                <span className="small-font text-[var(--primary-text-light)]">{card.emoji}</span>
                            )}
                            <p className=" text-[var(--primary-text-light)] small-font font-600">{card.title}</p>
                        </div>
                        <ul className={`${card.descriptions.length > 1 ? 'list-disc pl-4 ' : ''} small-font text-[var(--primary-text-light)]  flex flex-col gap-2`}>
                            {card.descriptions.map((description, idx) => (
                                <li key={idx} className="small-font text-[var(--primary-text-light)]">{description}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );

    <style>
        {`
            .small-font{
                font-size: var(--small-font);
            }
            .description-font{
                font-size: var(--description-font);
            }
             .extra-small-font {
                font-size: var(--extraSmall-font);
            }
             .heading-4 {
                font-size: var(--heading-h4);
            }
            .heading-5 {
                font-size: var(--heading-h5);
            }
            .heading-6 {
                font-size: var(--heading-h6);
            }
            .font-600 {
                font-weight: var(--font-semi-bold);
            }
                       
                @media (min-width: 768px) {
            .md-heading-4 {
                font-size: var(--heading-h4);
            }
        }
        `}
    </style>

};

export default AIGeneratedSummary; 