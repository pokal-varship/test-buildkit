import React from 'react';
import tenantConfig from '@config/tenant.config';

interface MenuCardProps {
    menuItems: {
        imageSrc: string;
        title: string;
        oldPrice: string;
        newPrice: string;
        calories: string;
    }[];
}

const MenuCard: React.FC<MenuCardProps> = ({ menuItems }) => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {menuItems.map((item, index) => {
                const cardStyle = styles.card;
                return (
                    <div key={index} style={cardStyle}>
                        <img fetchPriority="high"  title={item.title} src={item.imageSrc} alt={item.title} style={styles.image} />
                        <p style={styles.title}>{item.title}</p>
                        <div style={styles.infoContainer}>
                            <p style={styles.price}>
                                {tenantConfig.showStrikethroughPrice && (
                                    <span style={styles.oldPrice}>{item.oldPrice}</span>
                                )}
                                <span style={styles.newPrice}>{item.newPrice}</span>
                            </p>
                            {tenantConfig.showCaloriesInfo && (
                              <p style={styles.calories}>{item.calories} kcal</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    card: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        width: '220px',
        margin: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'var(--primary-background)', // Use CSS variable
        color: 'var(--primary-text)', // Use CSS variable for text color
    },
    image: {
        width: '100%',
        height: 'auto',
        borderRadius: '6px',
    },
    title: {
        fontSize: 'var(--font-sm)',
        margin: '10px 0 5px',
        fontFamily: 'var(--font-family)',
    },
    price: {
        fontSize: 'var(--font-sm)',
        color: 'var(--primary-text)',
        fontWeight: 'bold',
        fontFamily: 'var(--font-family)',
        width: '100%',
    },
    calories: {
        fontSize: 'var(--font-xs)',
        color: 'var(--primary-text)',
        fontFamily: 'var(--font-family)',
        width: '100%',
        textAlign: 'end',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'end',
    },
    infoContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
    },
    oldPrice: {
        textDecoration: 'line-through',
        color: 'var(--color-gray)',
        marginRight: '8px',
    },
    newPrice: {
        fontSize: 'var(--font-xs)',
        fontWeight: 'bold',
        color: 'var(--primary-text)',
    },
};

export default MenuCard;
