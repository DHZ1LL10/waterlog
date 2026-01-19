import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TruckIcon, 
  LogOut, 
  LogIn, 
  BarChart3,
  Settings,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SidebarNav() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/checkin', icon: LogIn, label: 'Check-in' },
    { path: '/checkout', icon: LogOut, label: 'Check-out' },
    { path: '/resources', icon: Users, label: 'Recursos' }, 
    { path: '/analytics', icon: BarChart3, label: 'Reportes y Analytics' }, // <--- FUSIONADO AQUÍ
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 h-screen fixed left-0 top-0 flex flex-col transition-colors duration-200">
      {/* Logo */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <TruckIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">WaterLog</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Rutas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t dark:border-gray-700 space-y-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configuración</span>
        </Link>
        
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}