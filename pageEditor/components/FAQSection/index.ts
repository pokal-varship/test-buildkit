import { FAQSection } from "./component";
import { faqSectionFields, faqSectionDefaultProps, type FAQSectionProps } from "./fields";

export const faqSectionConfig = {
  fields: faqSectionFields,
  defaultProps: faqSectionDefaultProps,
  render: FAQSection,
  label: "FAQ",
};

export { FAQSection, type FAQSectionProps }; 