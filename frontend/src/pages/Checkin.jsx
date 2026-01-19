import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Truck, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { routesApi } from '../services/apiService';

export default function Checkin() {
  const [formData, setFormData] = useState({
    route_id: '',
    returned_full_bottles: '',
    returned_empty_bottles: '',
    reported_damaged: '0',
    notes: '',
    evidence_verified: false
  });
  
  // Estado para la hora actual (Reloj en vivo)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const queryClient = useQueryClient();

  const { data: routesData } = useQuery({
    queryKey: ['routes'],
    queryFn: () => routesApi.listRoutes(),
  });

  const activeRoutes = useMemo(() => {
    return routesData?.routes?.filter(r => r.status === 'IN_PROGRESS') || [];
  }, [routesData]);

  const selectedRouteDetails = useMemo(() => {
    return activeRoutes.find(r => r.id === parseInt(formData.route_id));
  }, [activeRoutes, formData.route_id]);

  const checkinMutation = useMutation({
    mutationFn: (data) => routesApi.checkin(data.route_id, data),
    onSuccess: (response) => {
      toast.success(`Entrada registrada a las ${response.checkin_time}`);
      setFormData({
        route_id: '',
        returned_full_bottles: '',
        returned_empty_bottles: '',
        reported_damaged: '0',
        notes: '',
        evidence_verified: false
      });
      queryClient.invalidateQueries(['routes']);
      queryClient.invalidateQueries(['kpis']);
    },
    onError: (error) => {
      console.error(error);
      const msg = error.response?.data?.detail || "Error al registrar entrada";
      toast.error(typeof msg === 'string' ? msg : "Error de validación");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.route_id) return toast.error("Selecciona una ruta");

    checkinMutation.mutate({
      ...formData,
      route_id: parseInt(formData.route_id),
      returned_full_bottles: parseInt(formData.returned_full_bottles || 0),
      returned_empty_bottles: parseInt(formData.returned_empty_bottles || 0),
      reported_damaged: parseInt(formData.reported_damaged || 0)
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
            <ClipboardCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check-in de Ruta</h2>
            <p className="text-gray-500 dark:text-gray-400">Registrar regreso y calcular tiempos</p>
          </div>
          {/* Reloj en vivo */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 uppercase font-semibold">Hora Actual</p>
            <p className="text-xl font-mono text-gray-700 dark:text-gray-200">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Truck className="inline w-4 h-4 mr-2" /> Ruta Activa
            </label>
            <select
              value={formData.route_id}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecciona una ruta...</option>
              {activeRoutes.map(route => (
                <option key={route.id} value={route.id}>
                  #{route.id} - {route.driver_name} (Salida: {route.checkout_time})
                </option>
              ))}
            </select>
          </div>

          {/* DETALLES DE SALIDA Y TIEMPOS */}
          <AnimatePresence>
            {selectedRouteDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Info de Carga */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Información de Salida:</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-blue-800">
                          <span className="block text-xs text-gray-500">Carga Inicial</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedRouteDetails.initial_full_bottles} Llenos</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-blue-800">
                          <span className="block text-xs text-gray-500">Hora Salida</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {selectedRouteDetails.checkout_time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INPUTS DE RETORNO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Llenos Retornados
              </label>
              <input
                type="number"
                value={formData.returned_full_bottles}
                onChange={(e) => setFormData({ ...formData, returned_full_bottles: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vacíos Retornados
              </label>
              <input
                type="number"
                value={formData.returned_empty_bottles}
                onChange={(e) => setFormData({ ...formData, returned_empty_bottles: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          {/* DAÑADOS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <AlertTriangle className="inline w-4 h-4 mr-2 text-amber-500" />
              Garrafones Dañados
            </label>
            <input
              type="number"
              value={formData.reported_damaged}
              onChange={(e) => setFormData({ ...formData, reported_damaged: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.evidence_verified}
              onChange={(e) => setFormData({ ...formData, evidence_verified: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="verified" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Evidencia de daño verificada
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Observaciones adicionales..."
            />
          </div>

          <button
            type="submit"
            disabled={checkinMutation.isPending}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {checkinMutation.isPending ? 'Calculando Cierre...' : 'Registrar Entrada'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}