import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', // primary, secondary, outline, danger
  className = '', 
  disabled = false,
  ...props 
}) {
  // Estilos base compartidos
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  // Variantes de color
  const variants = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border-transparent text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500",
    outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    ghost: "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}