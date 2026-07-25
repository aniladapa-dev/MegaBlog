import React , {useId} from "react"

const Input = React.forwardRef( function Input({
    label,
    type = 'text',
    className = "",
    ...props
    },ref){
    
    const id = useId()
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
            <input
                type={type}
                className={`px-4 py-2.5 rounded-xl bg-white dark:bg-gray-950/70 text-slate-800 dark:text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 border border-gray-250 dark:border-gray-800 transition-all duration-200 w-full text-sm ${className}`}
                ref={ref}
                {...props}
                id={id}
            />
        </div>
    )
})

export default Input;