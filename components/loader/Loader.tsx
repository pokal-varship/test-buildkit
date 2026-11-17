import React from "react";

interface LoaderProps {
    size?: number; // Size of the loader
    color?: string; // Loader color
    type?: "spinner" | "dots" | "bars"; // Type of animation
}

const Loader: React.FC<LoaderProps> = ({ size = 40, type = "spinner", color }) => {
    const loaderStyles = {
        spinner: `animate-spin rounded-full border-4 border-t-transparent`,
        dots: `flex space-x-2`,
        bars: `flex space-x-1`,
    };

    return (
        <div className="flex justify-center items-center">
            {type === "spinner" && (
                <div
                    className={`${loaderStyles.spinner}`}
                    style={{
                        width: size,
                        height: size,
                        borderColor: color ? color : "var(--primary-color)",
                        borderTopColor: "transparent",
                    }}
                />
            )}
            {type === "dots" && (
                <div className={`${loaderStyles.dots}`}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" />
                    ))}
                </div>
            )}
            {type === "bars" && (
                <div className={`${loaderStyles.bars}`}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-2 h-5 bg-gray-500 animate-pulse" />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Loader;
