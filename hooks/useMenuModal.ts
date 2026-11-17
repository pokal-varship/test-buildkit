import { useCallback } from 'react';
import { open_dialog, close_dialog } from '@lib/modalHandler';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * MenuModal Props that can be passed when opening the menu modal
 */
export interface MenuModalProps {
  availableStores?: string[];
  productCategorySlug?: string;
  linkedMenus?: Array<{
    menuId: string;
    menuSlug: string;
  }>;
  urlManagement?: {
    canonicalUrl: string;
    currentUrl: string;
    customSlug: string;
    urlPattern?: string;
  };
  /** When true, show only store header + meal periods (no Select Location title, no search). Used from scan-order flow. */
  scanOrderMode?: boolean;
  /** Optional display name for the location in scan-order mode (e.g. "Aberdeen - Union Square"). */
  locationDisplayName?: string;
  /** When true, Order/View Menu in the modal navigates to /{storeSlug}/{menuSlug}/full-menu (scan-order flow). */
  redirectToFullMenu?: boolean;
  [key: string]: unknown;
}

/**
 * Custom styling options for the MenuModal
 */
export interface MenuModalStyleOptions {
  customSxStyle?: SxProps<Theme>;
  onlyDialog?: boolean;
  drawerBorderRadius?: string;
  className?: string;
}

/**
 * Default modal styles - Responsive for web and mobile
 */
const DEFAULT_STYLES: SxProps<Theme> = {
  '& .MuiPaper-root': {
    backgroundColor: 'var(--primary-background)',
    borderRadius: '10px',
    width: '100%',
    '@media (max-width: 768px)': {
      maxHeight: '85vh',
      borderRadius: '10px 10px 0 0',
    },
  },
  '& .MuiDialogContent-root': {
    padding: '24px 20px 4px',
    overflowX: 'hidden',
  },
};

/**
 * Custom hook to manage MenuModal
 * 
 * @example
 * ```tsx
 * const { handleOpenMenuModal } = useMenuModal();
 * handleOpenMenuModal();
 * ```
 */
export const useMenuModal = () => {
  const handleOpenMenuModal = useCallback((
    props: MenuModalProps = {},
    options: MenuModalStyleOptions = {}
  ) => {
    const { customSxStyle, onlyDialog, drawerBorderRadius, className } = options;
    
    // Merge custom styles with defaults if provided
    const styles = customSxStyle 
      ? { ...DEFAULT_STYLES, ...customSxStyle }
      : DEFAULT_STYLES;

    open_dialog('menuModal', {
      open: true,
      type: 'menuModal',
      handlerDialog: () => {},
      handleClose: () => {},
      anchor: 'bottom',
      propsData: props,
      sxStyle: styles,
      onlyDialog,
      drawerBorderRadius,
      className,
    });
  }, []);

  const handleCloseMenuModal = useCallback(() => {
    close_dialog(['menuModal']);
  }, []);

  return {
    handleOpenMenuModal,
    handleCloseMenuModal,
  };
};

export default useMenuModal;
