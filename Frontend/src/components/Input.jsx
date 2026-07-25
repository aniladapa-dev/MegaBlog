import React, { useId, useState } from "react"

const Input = React.forwardRef(function Input({
    label,
    type = 'text',
    className = "",
    ...props
}, ref) {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className='w-full mb-4'>
            {label && (
                <label 
                    className='inline-block mb-1.5 pl-1 text-sm font-semibold text-slate-650 dark:text-gray-400 transition-colors duration-250' 
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <input
                    type={actualType}
                    className={`px-4 py-2.5 ${isPassword ? 'pr-11' : ''} rounded-xl bg-white dark:bg-gray-950/70 text-slate-800 dark:text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 border border-gray-250 dark:border-gray-800 transition-all duration-200 w-full text-sm ${className}`}
                    ref={ref}
                    {...props}
                    id={id}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 dark:text-gray-500 dark:hover:text-purple-400 p-1 transition-colors duration-200 focus:outline-none"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.065-7-9.542-7-4.477 0-8.268 2.943-9.542 7Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
})

export default Input;