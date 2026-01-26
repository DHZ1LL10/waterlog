import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 outline-none transition-colors
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
          }
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error.message}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;