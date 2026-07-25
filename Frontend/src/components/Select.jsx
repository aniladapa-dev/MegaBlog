import React, { useId, useState, useEffect, useRef } from "react";

function Select({ label, options = [], className = "", value, onChange, defaultValue, ...props }, ref) {
  const id = useId();
  const containerRef = useRef(null);
  
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || options[0] || "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (val) => {
    setSelectedValue(val);
    setIsOpen(false);
    
    if (onChange) {
      onChange({ target: { value: val } });
    }
  };

  return (
    <div className="w-full mb-4 relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="inline-block mb-1.5 pl-1 text-sm font-semibold text-slate-650 dark:text-gray-400">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white dark:bg-gray-950/70 text-slate-800 dark:text-gray-200 border border-gray-250 dark:border-gray-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 hover:cursor-pointer transition-all duration-200 text-sm capitalize ${className}`}
        >
          <span>{selectedValue}</span>
          <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <ul className="absolute z-[100] mt-1.5 w-full bg-white dark:bg-[#0c1222] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left px-4 py-2.5 text-sm capitalize transition hover:cursor-pointer ${
                    selectedValue === option 
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold' 
                      : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/60'
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <select
        id={id}
        ref={ref}
        value={selectedValue}
        onChange={(e) => handleOptionClick(e.target.value)}
        className="hidden"
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default React.forwardRef(Select);
