import Icon from '@components/image/Icons';
import { CIRCLE_ARROW_LEFT_IMAGE, CIRCLE_ARROW_LEFT_IMAGE_DARK } from '@config/Header/image.config';
import Link from 'next/link';
import { useTheme } from 'context/ThemeProvider';

interface CheckOutHeaderProps {
    lang: {
        checkout: string;
    };
    handleBack: () => void;
}

const CheckOutHeader: React.FC<CheckOutHeaderProps> = ({ lang, handleBack }) => {
    const { theme } = useTheme();
    return (
        <header className="p-4 order-header">
            <div className="flex items-center text-lg font-semibold">
                <Link href="#" className="mr-2 cursor-pointer" onClick={handleBack}>
                    <Icon
                        icon={`${theme === 'light' ? `${CIRCLE_ARROW_LEFT_IMAGE}#arrow-left` : `${CIRCLE_ARROW_LEFT_IMAGE_DARK}#circle-arrow-left`}`}
                        width={30}
                        height={30}
                        unit="px"
                        color={"var(--primary-text)"}
                        viewBox="0 0 22 23" />
                </Link>
                <h2 className="order-title-checkout">{lang.checkout}</h2>
            </div>
            <style>{`
                .order-title-checkout {
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
            `}</style>
        </header>
    );
};

export default CheckOutHeader;