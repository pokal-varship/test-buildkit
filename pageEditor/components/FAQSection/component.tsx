"use client";

import React, { useState } from "react";

// Utility function to parse padding values
const parsePadding = (padding: string) => {
  if (!padding) return { top: '0', right: '0', bottom: '0', left: '0' };
  
  const parts = padding.trim().split(/\s+/);
  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  } else if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  } else if (parts.length === 4) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }
  return { top: '0', right: '0', bottom: '0', left: '0' };
};

// Utility function to convert spacing value to pixels
// const getSpacingValue = (value: string) => {
//   if (!value) return '0px';
//   // If it's already a CSS unit, return as is
//   if (value.includes('px') || value.includes('rem') || value.includes('em') || value.includes('%')) {
//     return value;
//   }
//   // If it's just a number, convert to pixels (assuming Tailwind spacing scale)
//   const num = parseFloat(value);
//   if (!isNaN(num)) {
//     return `${num * 4}px`; // Tailwind spacing scale: 1 = 4px
//   }
//   return '0px';
// };

import { FAQSectionProps } from "./fields";

export const FAQSection = (props: FAQSectionProps & Record<string, any>) => {
  const {
    basicContent = {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about dining with us",
    },
    styling = {
      layout: {
        backgroundColor: "transparent",
        maxWidth: "100%",
        mobile: {
          maxWidth: "100%",
          backgroundColor: "transparent",
        }
      },
      spacing: {
        padding: "80px 20px",
        margin: "0",
        mobile: {
          padding: "40px 16px",
          margin: "0",
        }
      },
      typography: {
        title: {
          fontSize: "32px",
          fontWeight: "600",
          color: "var(--primary-text)",
          lineHeight: "1.2",
          alignment: "center",
          mobile: {
            fontSize: "24px",
            fontWeight: "600",
            color: "var(--primary-text)",
            lineHeight: "1.2",
            alignment: "center",
          }
        },
        subtitle: {
          fontSize: "16px",
          fontWeight: "400",
          color: "var(--secondary-text)",
          lineHeight: "1.3",
          alignment: "center",
          mobile: {
            fontSize: "14px",
            fontWeight: "400",
            color: "var(--secondary-text)",
            lineHeight: "1.3",
            alignment: "center",
          }
        },
        faq: {
          question: {
            fontSize: "16px",
            fontWeight: "600",
            color: "var(--primary-text)",
            lineHeight: "1.3",
            mobile: {
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--primary-text)",
              lineHeight: "1.3",
            }
          },
          answer: {
            fontSize: "14px",
            fontWeight: "400",
            color: "var(--secondary-text)",
            lineHeight: "1.3",
            mobile: {
              fontSize: "12px",
              fontWeight: "400",
              color: "var(--secondary-text)",
              lineHeight: "1.3",
            }
          }
        }
      }
    },
    advanceSettings = {
      faqs: [
        {
          question: "Do you accept reservations?",
          answer: "Yes, we accept reservations for parties of all sizes. You can book a table by calling us at +44 20 7123 4567 or using our online booking system. We recommend booking in advance, especially for weekend dinners.",
        },
        {
          question: "Do you offer vegetarian and vegan options?",
          answer: "Absolutely! We have a wide variety of vegetarian and vegan dishes on our menu. Our chefs are happy to accommodate dietary restrictions and preferences.",
        },
        {
          question: "Is parking available?",
          answer: "Yes, we have a small parking area available for our customers. There's also street parking available nearby.",
        },
      ],
      accordion: {
        behavior: {
          allowMultiple: true,
          defaultOpen: false,
        },
        appearance: {
          showIcons: true,
          iconColor: "#2d2d2d",
          activeIconColor: "#2d2d2d",
          iconSize: "20px",
          mobile: {
            iconSize: "18px",
            iconColor: "#2d2d2d",
            activeIconColor: "#2d2d2d",
          }
        },
      },
    },
  } = props;

  // Extract values from the new structure
  const title = basicContent?.title || "Frequently Asked Questions";
  const subtitle = basicContent?.subtitle || "Everything you need to know about dining with us";
  const faqs = advanceSettings?.faqs || [];
  const accordion = advanceSettings?.accordion;

  const [openItems, setOpenItems] = useState<number[]>(
    accordion?.behavior?.defaultOpen 
      ? Array.from({ length: faqs.length }, (_, i) => i) 
      : faqs.length > 0 ? [0] : []
  );

  const toggleItem = (index: number) => {
    // Always close other items when opening one - single accordion behavior
    setOpenItems(prev => 
      prev.includes(index) ? [] : [index]
    );
  };

  const isOpen = (index: number) => openItems.includes(index);

  // Parse padding values from the new structure
  const desktopPadding = parsePadding(styling?.spacing?.padding || "80px 20px");
  const mobilePadding = parsePadding(styling?.spacing?.mobile?.padding || "40px 16px");

  // Chevron Down Icon Component
  const ChevronDownIcon = ({ color, size, mobileSize, isRotated }: { 
    color: string; 
    size: string; 
    mobileSize: string;
    isRotated: boolean;
  }) => (
    <svg 
      className="transition-transform duration-200 ease-in-out"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={"var(--primary-text)"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ 
        transform: isRotated ? 'rotate(180deg)' : 'rotate(0deg)',
        width: `clamp(${mobileSize}, 4vw, ${size})`,
        height: `clamp(${mobileSize}, 4vw, ${size})`,
      }}
    >
      <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
  );

  return (

    <> 
    <div 
      className="faq-section"
      style={{ 
        backgroundColor: styling?.layout?.backgroundColor || "transparent",
        maxWidth: styling?.layout?.maxWidth || "100%",
        paddingTop: `clamp(${mobilePadding.top}, 8vw, ${desktopPadding.top})`,
        paddingRight: `clamp(${mobilePadding.right}, 4vw, ${desktopPadding.right})`,
        paddingBottom: `clamp(${mobilePadding.bottom}, 8vw, ${desktopPadding.bottom})`,
        paddingLeft: `clamp(${mobilePadding.left}, 4vw, ${desktopPadding.left})`,
        margin: styling?.spacing?.margin || "0",
      }}
    >
      <div 
        className="container mx-auto md:px-32"
      >
        {/* Header */}
        <div 
          className="text-center mb-3 md:mb-8">
          {title && (
          <h2 
            className="font-semibold leading-tight mb-5 md:mb-6 faqTitle"
          >
            {title}
          </h2>
          )}
          {subtitle && (
            <p 
              className="leading-relaxed faqSubtitle"
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* FAQ Items */}
        <div className="w-full">
          {faqs.map((faq: any, index: number) => (
            <div 
              key={index}
              className="border-b border-[var(--rating-border-primary)] last:border-b-0 mb-4"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left flex justify-between items-start focus:outline-none transition-colors duration-200"
                style={{
                  paddingTop: `clamp(1rem, 3vw, 1.5rem)`,
                  paddingBottom: `clamp(1rem, 3vw, 1.5rem)`,
                }}
                aria-expanded={isOpen(index)}
                aria-controls={`faq-answer-${index}`}
              >
                <span 
                  className="flex-1 leading-relaxed faqQuestion"
                >
                  {faq?.question}
                </span>
                {accordion?.appearance?.showIcons && (
                  <div 
                    className="flex-shrink-0 transition-transform duration-200 ease-in-out"
                    style={{
                      marginLeft: `clamp(0.5rem, 2vw, 1rem)`,
                      marginTop: '0.25rem',
                    }}
                  >
                    <ChevronDownIcon 
                      color={isOpen(index) ? (accordion?.appearance?.activeIconColor || "var(--primary-text)") : (accordion?.appearance?.iconColor || "var(--primary-text)")}
                      size={accordion?.appearance?.iconSize || "20px"}
                      mobileSize={accordion?.appearance?.mobile?.iconSize || "18px"}
                      isRotated={isOpen(index)}
                    />
                  </div>
                )}
              </button>
              
              <div 
                id={`faq-answer-${index}`}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ 
                  maxHeight: isOpen(index) ? '1000px' : '0',
                  opacity: isOpen(index) ? '1' : '0',
                }}
              >
                <div 
                  style={{ 
                    paddingBottom: `clamp(1rem, 3vw, 1.5rem)`,
                    paddingRight: `clamp(2rem, 4vw, 3rem)`,
                  }}
                >
                  <p 
                    className="leading-relaxed"
                    style={{ 
                      color: styling?.typography?.faq?.answer?.color || "#757575",
                      fontSize: `clamp(${styling?.typography?.faq?.answer?.mobile?.fontSize || "14px"}, 3.5vw, ${styling?.typography?.faq?.answer?.fontSize || "16px"})`,
                      fontWeight: styling?.typography?.faq?.answer?.fontWeight || "400",
                      lineHeight: styling?.typography?.faq?.answer?.lineHeight || "1.3",
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <style>
      {
        `
        .faqTitle {
           color: ${styling?.typography?.title?.color || "#2d2d2d"};
           font-size: ${styling?.typography?.title?.fontSize || "36px"};
           font-weight: ${styling?.typography?.title?.fontWeight || "600"};
           line-height: ${styling?.typography?.title?.lineHeight || "1.2"};
           text-align: ${styling?.typography?.title?.alignment || "center"};
        }
        
        .faqSubtitle {
          color: ${styling?.typography?.subtitle?.color || "#757575"};
          font-size: ${styling?.typography?.subtitle?.fontSize || "16px"};
          font-weight: ${styling?.typography?.subtitle?.fontWeight || "400"};
          line-height: ${styling?.typography?.subtitle?.lineHeight || "1.5"};
          text-align: ${styling?.typography?.subtitle?.alignment || "center"};
        }

        .faqQuestion {
          color: ${styling?.typography?.faq?.question?.color || "#2d2d2d"};
          font-size: ${styling?.typography?.faq?.question?.fontSize || "16px"};
          font-weight: ${styling?.typography?.faq?.question?.fontWeight || "600"};
          line-height: ${styling?.typography?.faq?.question?.lineHeight || "1.3"};
          padding-right: clamp(1rem, 3vw, 2rem);
        }

        @media only screen and (max-width: 768px) {
          .faqTitle {
           color: ${styling?.typography?.title?.mobile?.color || styling?.typography?.title?.color || "#2d2d2d"} !important;
           font-size: ${styling?.typography?.title?.mobile?.fontSize || "24px"} !important;
           font-weight: ${styling?.typography?.title?.mobile?.fontWeight || styling?.typography?.title?.fontWeight || "600"} !important;
           line-height: ${styling?.typography?.title?.mobile?.lineHeight || "1.3"} !important;
           text-align: ${styling?.typography?.title?.mobile?.alignment || styling?.typography?.title?.alignment || "center"} !important;
          }

          .faqSubtitle {
            color: ${styling?.typography?.subtitle?.mobile?.color || styling?.typography?.subtitle?.color || "#757575"};
            font-size: ${styling?.typography?.subtitle?.mobile?.fontSize || "14px"};
            font-weight: ${styling?.typography?.subtitle?.mobile?.fontWeight || styling?.typography?.subtitle?.fontWeight || "400"};
            line-height: ${styling?.typography?.subtitle?.mobile?.lineHeight || "1.5"};
            text-align: ${styling?.typography?.subtitle?.mobile?.alignment || styling?.typography?.subtitle?.alignment || "center"};
          }
          
          .faqQuestion {
            color: ${styling?.typography?.faq?.question?.mobile?.color || styling?.typography?.faq?.question?.color || "#2d2d2d"} !important;
            font-size: ${styling?.typography?.faq?.question?.mobile?.fontSize || "16px"} !important;
            font-weight: ${styling?.typography?.faq?.question?.mobile?.fontWeight || styling?.typography?.faq?.question?.fontWeight || "600"} !important;
            line-height: ${styling?.typography?.faq?.question?.mobile?.lineHeight || "1.4"} !important;
          }
        }
        `
      }
    </style>


    </>
  );
}; 