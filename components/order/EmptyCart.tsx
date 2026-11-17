import CustomButton from '@components/buttons/Button';
import { EMPTY_CART_IMAGE } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import useMenuModal from '@hooks/useMenuModal';
import React from 'react';
import { LanguageCode, TranslationKeys } from 'types';
import { useQrFullMenuNavigation } from '@hooks/useQrFullMenuNavigation';

const EmptyCart = () => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { handleOpenMenuModal } = useMenuModal();
  const { navigateToQrFullMenu } = useQrFullMenuNavigation();

  const handleOpenMenu = () => {
    // Try QR flow navigation first; if it doesn't happen, fallback to normal modal behavior
    const navigated = navigateToQrFullMenu();
    if (!navigated) {
      handleOpenMenuModal();
    }
  };

  return (
    <div className="empty-cart-wrapper">
      <div className="empty-cart-box">
        <img fetchPriority="high" 
          src={EMPTY_CART_IMAGE}
          alt="Empty Cart"
          className="empty-cart-img"
        />
        <h2 className="empty-cart-title">{lang.emptyCart}</h2>
        <p className="empty-cart-desc">{lang.emptyCartMessage}</p>
        <CustomButton
          label={lang.emptyCartButton}
          className="empty-cart-btn"
          onClick={handleOpenMenu}
        />
      </div>

      <style>{`
        .empty-cart-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: calc(100vh - 70px) !important;
        }

        .empty-cart-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--cards-containers);
          border-radius: 16px;
          padding: 50px 10px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        .empty-cart-img {
          width: 150px;
          height: 150px;
          margin-bottom: 20px;
        }

        .empty-cart-title {
          font-size: var(--heading-h2);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin-bottom: 8px;
        }

        .empty-cart-desc {
          font-size: var(--heading-h4);
          color: var(--primary-text);
          margin-bottom: 24px;
        }

        .empty-cart-btn {
          font-weight: var(--font-semi-bold);
          padding: 10px 24px;
          width: 80%;
        }
        @media (max-width: 768px) {
          .empty-cart-box{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: calc(100vh - 70px);
            border-radius: 0px;
            padding: 0px 15px;
          }
          .empty-cart-btn{
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EmptyCart;
