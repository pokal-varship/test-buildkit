// Component exports
export { 
  default as mainBannerConfig, 
  MainBanner, 
  type MainBannerProps 
} from "./MainBanner";


export { 
  default as popularItemsSectionConfig, 
  type PopularItemsSectionProps 
} from "./PopularItems";

export { 
  mediaContentConfig, 
  MediaContent, 
  type MediaContentProps 
} from "./MediaContent";

export { 
  iconsSectionConfig, 
  OurServices, 
  type IconsSectionProps 
} from "./IconsSection";

export { 
  testimonialsSectionConfig, 
  TestimonialsSection, 
  type TestimonialsSectionProps 
} from "./TestimonialsSection";

export { 
  faqSectionConfig, 
  FAQSection, 
  type FAQSectionProps 
} from "./FAQSection";

export { 
  visitUsSectionConfig, 
  VisitUsSection, 
  type VisitUsSectionProps 
} from "./VisitUsSection";

export { 
  StickyButtonConfig, 
  StickyButton,
  type StickyButtonProps 
} from "./StickyButton";

export { 
  meetOurTeamSectionConfig, 
  MeetOurTeamSection, 
  type MeetOurTeamSectionProps 
} from "./MeetOurTeam";

export { 
  promotionalBannerSectionConfig, 
  PromotionalBannerSection, 
  type promotionalBannerSectionProps 
} from "./PromotionalBanner";




// Import the configurations and types
import mainBannerConfig, { type MainBannerProps } from "./MainBanner";
import PopularItemsSectionConfig, { type PopularItemsSectionProps } from "./PopularItems";
import { mediaContentConfig, type MediaContentProps } from "./MediaContent";
import { iconsSectionConfig, type IconsSectionProps } from "./IconsSection";
import { testimonialsSectionConfig, type TestimonialsSectionProps } from "./TestimonialsSection";
import { faqSectionConfig, type FAQSectionProps } from "./FAQSection";
import { visitUsSectionConfig, type VisitUsSectionProps } from "./VisitUsSection";
import { StickyButtonConfig, type StickyButtonProps } from "./StickyButton";
import { meetOurTeamSectionConfig, MeetOurTeamSectionProps } from "./MeetOurTeam";
import { promotionalBannerSectionConfig, promotionalBannerSectionProps } from "./PromotionalBanner";


// Combined component configurations for Puck
export const componentConfigs = {
  MainBanner: mainBannerConfig,
  PopularItemsSection: PopularItemsSectionConfig,
  MediaContent: mediaContentConfig,
  OurServices: iconsSectionConfig,
  Testimonials: testimonialsSectionConfig,
  FAQSection: faqSectionConfig,
  VisitUs: visitUsSectionConfig,
  StickyButton: StickyButtonConfig,
  MeetOurTeam: meetOurTeamSectionConfig,
  PromotionalBanner: promotionalBannerSectionConfig,
};

// Combined types for all components
export type ComponentProps =
  | MainBannerProps
  | PopularItemsSectionProps
  | MediaContentProps
  | IconsSectionProps
  | TestimonialsSectionProps
  | FAQSectionProps
  | VisitUsSectionProps
  | StickyButtonProps
  | MeetOurTeamSectionProps
  | promotionalBannerSectionProps; 