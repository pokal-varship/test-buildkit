import type { ComponentConfig } from "@measured/puck";
import { iconsSectionDefaultProps, iconsSectionFields, IconsSectionProps } from "./fields";
import OurServices from "./component";

export const iconsSectionConfig: ComponentConfig<IconsSectionProps> = {
  fields: iconsSectionFields,
  defaultProps: iconsSectionDefaultProps,
  render: OurServices,
  label: "Our Services",
};

export { OurServices, type IconsSectionProps }; 