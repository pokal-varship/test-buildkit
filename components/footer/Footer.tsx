'use client'
import { getTenantConfig } from "@config/tenant.config";
import React from "react";
import ThemeToggle from "@components/ThemeProvider/ThemeToggle";
import LanguageSelector from "@components/header/languageSelector";
import Link from "next/link";
import useMenuModal from "@hooks/useMenuModal";
// import XIcon from "@components/icons/XIcon";
// import PinterestIcon from "@components/icons/PinterestIcon";
import InstagramIcon from "@components/icons/InstagramIcon";
import FacebookIcon from "@components/icons/FacebookIcon";
import useLang from "@hooks/useLang";
import { TranslationKeys } from "types";
import AppLogo from "@components/app-logo/app-logo";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCart } from "@redux/slices/cartSlice";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { useAnalytics } from "@hooks/useAnalytics";
import { NEWKOMMERCE_LOGO } from "@config/Header/image.config";

interface FooterProps {
  shouldShowCartSummary?: boolean;
}

const Footer: React.FC<FooterProps> = ({ shouldShowCartSummary = false }) => {
  const [lang] = useLang() as [TranslationKeys, 'en' | 'ar'];
  const tenant = getTenantConfig();
  const logoUrl = tenant.lightLogoUrl || tenant.darkLogoUrl;
  const { handleOpenMenuModal } = useMenuModal();
  const pathname = usePathname();
  const { cartData } = useSelector(selectCart);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const { track } = useAnalytics();

  if (isQrFlowActive) return null;

  // Check if it's homepage, events page, about us page
  const pageWithFooterPadding = pathname === '/' || pathname === '/events' || pathname === '/about-us';

  // Check if cart has items
  const hasCartItems = !!(
    cartData?.data?.items && 
    cartData.data.items.length > 0
  );

  // Apply pb-24 if: pageWithFooterPadding OR (shouldShowCartSummary AND hasCartItems) Otherwise use pb-7
  const bottomPadding = (pageWithFooterPadding || (shouldShowCartSummary && hasCartItems)) ? 'pb-24' : 'pb-7';

  // Fallbacks for demo; replace with real data as needed
  const brandDesc = tenant.footerBrandDescription;
  const address = tenant.supportAddress || lang.defaultAddress;
  const phone =  `${tenant.supportCountryCode} ${tenant.supportPhone}` || "+44 20 7123 4567";
  const email = tenant.supportEmail || "info@goldenspoon.co.uk";
  const copyright = tenant.copyright || lang.defaultCopyright;

  // Social links (add Pinterest/X if available in config)
  const socialLinks = [
    {
      href: tenant.socialFacebook || "#",
      component: FacebookIcon,
      label: "Facebook"
    },
    {
      href: tenant.socialInstagram || "#",
      component: InstagramIcon,
      label: "Instagram"
    },
    // {
    //   href: "#",
    //   component: XIcon,
    //   label: "X (Twitter)",
    // },
    // {
    //   href: "#",
    //   component: PinterestIcon,
    //   label: "Pinterest"
    // }
  ];

  // Quick links (update hrefs as needed)
  const quickLinks = [
    { label: lang.home, href: "/" },
    { label: lang.menu, isModal: true },
    { label: lang.events, href: "/events" },
    { label: lang.aboutUs, href: "/about-us" },
    // { label: "Contact Us", href: "/contact" }
  ];

  // Bottom links
  // const bottomLinks = [
  //   { label: "Terms & Privacy", href: "#" },
  //   { label: "Accessibility Statement", href: "#" }
  // ];

  return (
    <footer className={`bg-primary-background text-primary-text w-full pt-7 md:pt-0 ${bottomPadding} md:pb-7 px-4 min-h-[220px]`}>
      <div className="bg-[var(--tertiary-background)] footer-main max-width-container mx-auto flex flex-col md:flex-row flex-wrap justify-between items-start gap-7 pt-7 md:pt-9 rounded-2xl border border-[var(--borders-dividers)]">
        {/* Brand/Description */}
        <div className="footer-col brand-col md:mb-4 flex-1 max-w-[fit-content] md:max-w-[200px]">
          <div className="mb-4">
            <AppLogo
              logoUrl={logoUrl || ""}
              alt={`${tenant?.appName} Logo`}
              title={`${tenant?.appName} Logo`}
              imageClassName="w-auto h-6 md:h-8 object-contain logo"
            
            />
          </div>
          <div className="heading-5 font-500 md:mb-16">{brandDesc}</div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
        {/* Quick Links */}
        <div className="footer-col links-col md:mb-4 flex-1 md:max-w-[110px]">
          <div className="md-heading-4 font-700 mb-4">{lang.quickLinks}</div>
          <ul className="list-none p-0 m-0">
            {quickLinks.map(link => (
              <li key={link.label} className="mb-2">
                {link.isModal ? (
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      await track("footer_link_clicked", {
                        link_name: link.label,
                        source: pathname === "/" ? "homepage" : pathname,
                      });
                      handleOpenMenuModal();
                    }}
                    className="font-500 hover:text-primary-color transition-colors hover:text-[var(--primary-color)] bg-transparent border-none p-0 text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link 
                    href={link.href || "/"} 
                    className="font-500 hover:text-primary-color transition-colors hover:text-[var(--primary-color)]"
                    onClick={async () => {
                      // Track the event
                      await track("footer_link_clicked", {
                        link_name: link.label,
                        source: pathname === "/" ? "homepage" : pathname,
                      });
                      // Allow navigation to proceed
                    }}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Contact Info */}
        <div className="footer-col contact-col md:mb-4 flex-1 max-w-[275px]">
          <div className="md-heading-4 font-700 mb-4">{lang.contact}</div>
          <div className="space-y-1">
            {address && (
              <div className="font-500">
                <Link
                  className="contact-address-link" 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    await track("footer_link_clicked", {
                      link_name: "Address",
                      source: pathname === "/" ? "homepage" : pathname,
                    });
                  }}
                >
                  {address}
                </Link>
              </div>
            )}
            <div className="font-500">
              <Link 
                className="contacts-link" 
                href={`tel:${phone.replace(/\s+/g, '')}`}
                onClick={async () => {
                  await track("footer_link_clicked", {
                    link_name: "Phone",
                    source: pathname === "/" ? "homepage" : pathname,
                  });
                }}
              >
                {phone}
              </Link>
            </div>
            <div className="font-500">
              <Link 
                className="contacts-link" 
                href={`mailto:${email}`}
                onClick={async () => {
                  await track("footer_link_clicked", {
                    link_name: "Email",
                    source: pathname === "/" ? "homepage" : pathname,
                  });
                }}
              >
                {email}
              </Link>
            </div>
          </div>
        </div>
        {/* Social Icons */}
        <div className="footer-col h-full social-col md:mb-4 flex-1 w-full md:max-w-[152px]">
          <div className="flex flex-col gap-7 pb-5 md:pb-0 md:gap-20">
            <div className="justify-items-start md:justify-items-end">
          <div className="font-700 md-heading-4 mb-2 md:mb-4">{lang.followUs}</div>
          <div className="flex gap-3 mt-2 md:mb-1">
            {socialLinks.map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex items-center justify-center w-8 h-8"
                onClick={async () => {
                  await track("footer_link_clicked", {
                    link_name: social.label,
                    source: pathname === "/" ? "homepage" : pathname,
                  });
                }}
              >
                <social.component width={24} height={24} className="cursor-pointer" />
              </a>
            ))}
          </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end md:gap-4 justify-between">
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          <LanguageSelector />
          </div>
          </div>


        </div>
        {/* Divider */}
        <div className="w-full border-t border-[var(--rating-border-primary)]" />
        {/* Bottom Row */}
        <div className="footer-bottom w-full flex flex-col md:flex-row flex-wrap justify-center md:justify-between items-center pb-5 text-xs gap-2 md:gap-0">
          <div className="flex items-center gap-2.5">
            <img
              src={NEWKOMMERCE_LOGO}
              alt={lang.newKommerce}
              className="h-6 md:h-8 w-auto object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="small-font font-500 text-[var(--secondary-text)]">{lang.poweredBy}</span>
              <span className="heading-6 md-heading-5 font-700">{lang.newKommerce}</span>
            </div>
          </div>
          <div className="text-right flex-1 md:flex-none mt-2 heading-6 md-heading-5 md:mt-0">{copyright}</div>
        </div>
      </div>
      <style>{`
      .heading-6{
        font-size: var(--heading-h6);
      }
      .font-700 {
        font-weight: var(--font-bold);
      }
      .font-500 {
        font-weight: var(--font-medium);
      }
        .md-heading-4{
            font-size: var(--heading-h4);
          }

      .contacts-link {
        color: inherit;
        text-decoration: underline;
      }
      .contact-address-link:hover {
        text-decoration: underline;
      }
      .small-font {
        font-size: var(--small-font);
      }
        @media (min-width: 768px) {          
          .md-heading-5{
            font-size: var(--heading-h5);
          }
        }    
      `}</style>
    </footer>
  );
};

export default Footer;
