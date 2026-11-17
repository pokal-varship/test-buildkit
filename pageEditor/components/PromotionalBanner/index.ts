import type { ComponentConfig } from "@measured/puck";
import PromotionalBannerSection from "./component";
import { promotionalBannerSectionFields as fields, promotionalBannerSectionDefaultProps as defaultProps, type promotionalBannerSectionProps } from "./field";

export const promotionalBannerSectionConfig: ComponentConfig<promotionalBannerSectionProps> = {
  fields,
  defaultProps,
  render: PromotionalBannerSection,
  label: "Promotional Banner",
};

export { PromotionalBannerSection };
export { promotionalBannerSectionProps };
