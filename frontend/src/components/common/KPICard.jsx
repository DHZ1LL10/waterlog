import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  
  // 🎨 Diccionario de estilos: Define cómo se ve cada color en Luz y Oscuridad
  const styles = {
    blue: {
      container: 'bg-blue-50 dark:bg-blue-900/20', // Fondo claro vs Fondo oscuro transparente
      text: 'text-blue-900 dark:text-blue-100',     // Texto oscuro vs Texto claro
      icon: 'text-blue-600 dark:text-blue-400',     // Icono normal vs Icono brillante
      iconBg: 'bg-white/60 dark:bg-blue-900/30'     // Fondo del icono
    },
    green: {
      container: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-900 dark:text-green-100',
      icon: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-white/60 dark:bg-green-900/30'
    },
    red: {
      container: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-900 dark:text-red-100',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-white/60 dark:bg-red-900/30'
    },
    yellow: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-white/60 dark:bg-yellow-900/30'
    }
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div className={`rounded-xl p-6 shadow-sm transition-colors duration-200 ${currentStyle.container} ${currentStyle.text}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg shadow-sm ${currentStyle.iconBg} ${currentStyle.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {(subtitle || trend !== undefined) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend !== undefined && (
            <span className={`flex items-center font-medium ${
              trend > 0 ? 'text-green-600 dark:text-green-400' : 
              trend < 0 ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : 
               trend < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : 
               <Minus className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="opacity-70">{subtitle}</span>
        </div>
      )}
    </div>
  );
}