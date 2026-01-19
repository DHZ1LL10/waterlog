import React from 'react';
import { ThemeToggle } from '../components/ThemeToggle';

const Settings = () => {
  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Configuración del Sistema</h1>
        
        <div className="space-y-6">
          {/* Sección Apariencia */}
          <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Apariencia</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Cambiar tema (Claro / Oscuro)</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Sección Info */}
          <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Información de la App</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Versión:</span> 1.0.0 (WaterLog)
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Planta ID:</span> 1
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Ambiente:</span> Producción
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;