import { StickyButton } from "./component";
import { stickyButtonFields, StickyButtonProps } from "./fields";

export const StickyButtonConfig = {
  fields: stickyButtonFields,
  defaultProps: {
    basicContent: {
      text: "Order Online",
      link: "#",
      target: "_self",
      rel: "",
    },
    styling: {
      backgroundColor: "var(--button-primary-background)",
      textColor: "var(--primary-text)",
      fontSize: "14px",
      fontWeight: "600",
      padding: "12px 24px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      zIndex: "1000",
    },
    behavior: {
      showWhenBannerHidden: true,
      scrollThreshold: 100,
      animationDuration: 300,
      showOnMobile: true,
    },
  },
  render: StickyButton,
};

export { StickyButton };
export type { StickyButtonProps }; 