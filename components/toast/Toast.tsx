'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { CROSS_ICON, TICK_CIRCLE_ICON } from '@config/Header/image.config';
import Icon from '@components/image/Icons';

type Severity = 'success' | 'info' | 'warning' | 'error';

interface ToastData {
    id?: number;
    type: Severity;
    message: string;
    productName?: string;
    productPrice?: number;
    quantity?: number;
    position?: 'bottom-center' | 'top-right';
    variant?: 'default' | 'product';
}

interface ToastContextType {
    showToast: (type: Severity, message: string, options?: { productName?: string; productPrice?: number; quantity?: number; position?: 'bottom-center' | 'top-right'; variant?: 'default' | 'product' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((type: Severity, msg: string, options?: { 
        productName?: string; 
        productPrice?: number; 
        quantity?: number; 
        position?: 'bottom-center' | 'top-right'; 
        variant?: 'default' | 'product' 
    }) => {
        const toastId = Date.now();
        const newToast: ToastData = {
            type,
            message: msg,
            productName: options?.productName,
            productPrice: options?.productPrice,
            quantity: options?.quantity || 1,
            position: options?.position || 'bottom-center',
            variant: options?.variant || 'default'
        };
        
        setToasts(prev => [...prev, { ...newToast, id: toastId }]);
        
        // Auto remove toast after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== toastId));
        }, 3000);
    }, []);

    const removeToast = useCallback((toastId: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* Default Toasts (bottom-center) */}
            {toasts.filter(toast => toast.position === 'bottom-center').map((toast) => (
                <Snackbar
                    key={toast.id}
                    open={true}
                    autoHideDuration={4000}
                    onClose={() => removeToast(toast.id!)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => removeToast(toast.id!)} severity={toast.type} sx={{ width: '100%' }}>
                        {toast.message}
                    </Alert>
                </Snackbar>
            ))}
            
            {/* Product Toasts (top-right) */}
            <div className="fixed z-50 space-y-2" style={{ top: '70px', right: '16px' }}>
                {toasts.filter(toast => toast.position === 'top-right').map((toast) => (
                    <div
                        key={toast.id}
                        className="bg-[var(--cards-containers)] rounded-lg shadow-lg py-3 px-4 w-full flex items-center space-x-3 animate-in slide-in-from-right-2 duration-300 border-l-[5px] border-[var(--success)]"
                    >
                        {/* Green Checkmark Icon */}
                        <div className="flex-shrink-0">
                            <img 
                                src={TICK_CIRCLE_ICON} 
                                alt="Success" 
                                className="h-6 w-6" 
                            />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex gap-7 min-w-0">
                            <p className="heading-5 text-[var(--primary-text)]">
                                {toast.quantity && toast.quantity > 1 ? `${toast.quantity}x ` : '1x '}
                                {toast.productName}
                            </p>
                            {toast.productPrice && (
                                <p className="heading-5 text-[var(--primary-text)]">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(toast.productPrice)}
                                </p>
                            )}
                        </div>
                        
                        {/* Dismiss Button */}
                        <button
                            onClick={() => removeToast(toast.id!)}
                            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Icon
                                icon={`${CROSS_ICON}#cross`}
                                width={16}
                                height={16}
                                color={"var(--primary-text)"}
                                className="h-4 w-4"
                                viewBox="0 0 16 16"
                            />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context.showToast;
};


export default ToastProvider;
