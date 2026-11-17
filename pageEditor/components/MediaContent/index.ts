import type { ComponentConfig } from "@measured/puck";
import { MediaContent } from "./component";
import { MediaContentDefaultProps, MediaContentFields, MediaContentProps } from "./fields";
import ImageUploadField from "../MainBanner/ImageUploadField";


export const mediaContentConfig: ComponentConfig<MediaContentProps> = {
  fields: MediaContentFields,
  defaultProps:MediaContentDefaultProps ,
  render: MediaContent,
  label: "Feature Section",
};

export { MediaContent, ImageUploadField, type MediaContentProps }; 