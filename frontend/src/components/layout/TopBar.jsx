import { Bell, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ThemeToggle } from '../ThemeToggle'; // <--- IMPORTAR EL BOTÓN (Asegúrate de la ruta)

export default function TopBar() {
  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 fixed top-0 right-0 left-64 z-10 transition-colors">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar rutas, choferes, camionetas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          {/* AQUÍ ESTÁ EL BOTÓN DE MODO OSCURO */}
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Date */}
          <div className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l dark:border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}