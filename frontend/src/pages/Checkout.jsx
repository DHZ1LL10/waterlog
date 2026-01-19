import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, TruckIcon, User, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { routesApi, resourcesApi } from '../services/apiService';

export default function Checkout() {
  const [formData, setFormData] = useState({
    driver_id: '',
    truck_id: '',
    initial_full_bottles: '',
    // Ya no pedimos empty_bottles
  });

  const queryClient = useQueryClient();

  const { data: drivers, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: resourcesApi.getDrivers
  });

  const { data: trucks, isLoading: loadingTrucks } = useQuery({
    queryKey: ['trucks'],
    queryFn: resourcesApi.getTrucks
  });

  const checkoutMutation = useMutation({
    mutationFn: routesApi.checkout,
    onSuccess: (data) => {
      // Mostramos la hora de salida en el mensaje
      toast.success(`Salida registrada a las ${data.checkout_time}`);
      setFormData({
        driver_id: '',
        truck_id: '',
        initial_full_bottles: '',
      });
      queryClient.invalidateQueries(['routes']);
    },
    onError: (error) => {
      console.error("Error en checkout:", error);
      let errorMessage = "Error al crear la ruta";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) errorMessage = `${detail[0].loc[1]}: ${detail[0].msg}`;
        else if (typeof detail === 'string') errorMessage = detail;
      }
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.driver_id || !formData.truck_id) return toast.error("Selecciona chofer y camioneta");

    checkoutMutation.mutate({
      driver_id: parseInt(formData.driver_id),
      truck_id: parseInt(formData.truck_id),
      initial_full_bottles: parseInt(formData.initial_full_bottles || 0),
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
            <LogOut className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check-out de Ruta</h2>
            <p className="text-gray-500 dark:text-gray-400">Registrar salida de unidad</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-2" /> Seleccionar Chofer
            </label>
            <select
              value={formData.driver_id}
              onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={loadingDrivers}
            >
              <option value="">{loadingDrivers ? "Cargando..." : "-- Elige un chofer --"}</option>
              {drivers?.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <TruckIcon className="inline w-4 h-4 mr-2" /> Seleccionar Camioneta
            </label>
            <select
              value={formData.truck_id}
              onChange={(e) => setFormData({...formData, truck_id: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={loadingTrucks}
            >
              <option value="">{loadingTrucks ? "Cargando..." : "-- Elige una unidad --"}</option>
              {trucks?.map(t => <option key={t.id} value={t.id}>{t.nickname} ({t.plate})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Package className="inline w-4 h-4 mr-2" /> Carga Inicial (Llenos)
            </label>
            <input
              type="number"
              value={formData.initial_full_bottles}
              onChange={(e) => setFormData({...formData, initial_full_bottles: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Cantidad de garrafones"
              required
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">* Se asume que no lleva garrafones vacíos al salir.</p>
          </div>

          <button
            type="submit"
            disabled={checkoutMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {checkoutMutation.isPending ? 'Procesando...' : 'Registrar Salida'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}