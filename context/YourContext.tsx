import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context value type
interface YourContextType {
    value: any; // Replace 'any' with the actual type you expect
    setValue: React.Dispatch<React.SetStateAction<any>>; // Replace 'any' with the actual type you expect
}

const YourContext = createContext<YourContextType | undefined>(undefined); // Use undefined as the default value

interface YourContextProviderProps {
    children: ReactNode; // Define the type for children
}

export const YourContextProvider: React.FC<YourContextProviderProps> = ({ children }) => {
    const [value, setValue] = useState<any>(null); // Replace 'any' with the actual type you expect

    return (
        <YourContext.Provider value={{ value, setValue }}>
            {children}
        </YourContext.Provider>
    );
};

export const useYourContext = () => {
    const context = useContext(YourContext);
    if (!context) {
        throw new Error('useYourContext must be used within a YourContextProvider');
    }
    return context;
}; 