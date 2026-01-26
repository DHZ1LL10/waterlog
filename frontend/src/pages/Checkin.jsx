import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, Truck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { routesApi } from '../services/apiService';
import CheckinForm from '../components/routes/CheckinForm'; // <--- AQUÍ ESTÁ LA MAGIA

export default function Checkin() {
  const [selectedRouteId, setSelectedRouteId] = useState('');
  
  // Reloj en vivo
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar Rutas Activas
  const { data: routesData } = useQuery({
    queryKey: ['routes'],
    queryFn: () => routesApi.listRoutes(),
  });

  const activeRoutes = useMemo(() => {
    return routesData?.routes?.filter(r => r.status === 'IN_PROGRESS') || [];
  }, [routesData]);

  // Buscar detalles de la ruta seleccionada para mostrar info rápida (Opcional)
  const selectedRouteInfo = useMemo(() => {
    return activeRoutes.find(r => r.id === parseInt(selectedRouteId));
  }, [activeRoutes, selectedRouteId]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
      >
        {/* --- ENCABEZADO (Reloj y Título) --- */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <ClipboardCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check-in de Ruta</h2>
            <p className="text-gray-500 dark:text-gray-400">Conciliación de Inventario y Ventas</p>
          </div>
          
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 uppercase font-semibold">Hora Actual</p>
            <p className="text-xl font-mono text-gray-700 dark:text-gray-200">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* --- PASO 1: SELECCIONAR RUTA --- */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Truck className="inline w-4 h-4 mr-2" /> Ruta Activa
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Selecciona la ruta que llega --</option>
            {activeRoutes.map(route => (
              <option key={route.id} value={route.id}>
                #{route.id} - {route.driver_name || 'Sin Chofer'} (Salida: {route.checkout_time})
              </option>
            ))}
          </select>
        </div>

        {/* --- PASO 2: MOSTRAR EL FORMULARIO NUEVO --- */}
        <AnimatePresence mode="wait">
          {selectedRouteId ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                {/* Aquí inyectamos el componente nuevo que creamos antes */}
                <CheckinForm 
                  routeId={selectedRouteId} 
                  onSuccess={() => setSelectedRouteId('')} // Limpiar selección al terminar
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
            >
              <p>Selecciona una ruta arriba para comenzar el conteo.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}