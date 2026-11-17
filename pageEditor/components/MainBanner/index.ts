import {MainBanner } from "./component";
import { mainBannerFields as fields, mainBannerDefaultProps as defaultProps } from "./fields";
import type { ComponentConfig } from "@measured/puck";
import type { MainBannerProps } from "./fields";
import ImageUploadField from "./ImageUploadField";

export { MainBanner, ImageUploadField };
export type { MainBannerProps } from "./fields";

const mainBannerConfig: ComponentConfig<MainBannerProps> = {
  fields: fields,
  defaultProps: defaultProps,
  render: MainBanner,
  label: "Main Banner",
};

export default mainBannerConfig; 