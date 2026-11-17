import React from 'react';
import dynamic from 'next/dynamic';
import useLang from '@hooks/useLang';
import CustomButton from '@components/buttons/Button';

const AnimatedArrow = dynamic(() => import('@components/icons/AnimatedArrow'), { ssr: false });

interface OrderOnlineButtonProps {
  onClick: () => void;
  className?: string;
  arrowProps?: {
    width?: number;
    height?: number;
    color?: string;
  };
}

const OrderOnlineButton: React.FC<OrderOnlineButtonProps> = ({
  onClick,
  className = '',
  arrowProps = {},
}) => {
  const [lang] = useLang();

  return (
    <CustomButton onClick={onClick} className={className}>
      <div className="flex items-center justify-center">
        <span>{lang.orderOnline}</span>
        <AnimatedArrow direction="right" {...arrowProps} />
      </div>
    </CustomButton>
  );
};

export default OrderOnlineButton;
