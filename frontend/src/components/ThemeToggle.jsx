import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  // Leemos del localStorage o usamos 'light' por defecto
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title="Cambiar tema"
    >
      {theme === 'dark' ? 
        <Sun className="w-5 h-5 text-yellow-400" /> : 
        <Moon className="w-5 h-5 text-gray-600" />
      }
    </button>
  );
};