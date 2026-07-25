import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors duration-200 hover:cursor-pointer shadow-md shadow-purple-900/10",
    textColor = "text-white font-semibold",
    className = "",
    ...props
}) {
    return (
        <button className={`px-5 py-2.5 rounded-xl ${bgColor} ${textColor} ${className}`} {...props}>
            {children}
        </button>
    );
}