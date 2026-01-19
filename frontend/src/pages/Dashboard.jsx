import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  AlertCircle, 
  Package, 
  DollarSign, 
  Activity,
  TruckIcon 
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import KPICard from '../components/common/KPICard';
import TrendChart from '../components/charts/TrendChart';
import StatusDistribution from '../components/charts/StatusDistribution';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { reportsApi, routesApi } from '../services/apiService';

export default function Dashboard() {
  const [dateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Query para KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis', dateRange],
    queryFn: () => reportsApi.getKPIs(dateRange.start, dateRange.end),
    refetchInterval: 60000
  });

  // Query para tendencias
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', 30],
    queryFn: () => reportsApi.getDailyTrends(30)
  });

  // Query para distribución de estados
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['status', dateRange],
    queryFn: () => reportsApi.getStatusDistribution(dateRange.start, dateRange.end)
  });

  // Query para rutas de hoy
  const { data: todayRoutes } = useQuery({
    queryKey: ['routes', 'today'],
    queryFn: () => routesApi.listRoutes(format(new Date(), 'yyyy-MM-dd')),
    refetchInterval: 30000
  });

  // Formatear datos
  const trendChartData = trendsData?.trends.map(item => ({
    date: format(new Date(item.date), 'dd/MM', { locale: es }),
    rutas: item.total_routes,
    problemas: item.routes_with_debt,
    deuda: item.debt_amount
  })) || [];

  const statusChartData = statusData?.distribution.map(item => ({
    name: item.status === 'CLEARED' ? 'Limpio' : 
          item.status === 'DEBT' ? 'Con Deuda' : 
          item.status === 'IN_PROGRESS' ? 'En Curso' : 'Pendiente',
    value: item.count,
    status: item.status
  })) || [];

  if (kpisLoading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard Operativo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <LoadingSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Operativo</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Monitoreo en tiempo real • {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-gray-600 dark:text-gray-300">Sistema activo</span>
              </div>
              {kpis?.active_routes > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium">
                  {kpis.active_routes} rutas activas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total de Rutas"
            value={kpis?.total_routes || 0}
            subtitle={`${kpis?.today_routes || 0} hoy`}
            icon={TruckIcon}
            color="blue"
          />
          <KPICard
            title="Tasa de Éxito"
            value={`${kpis?.success_rate || 0}%`}
            subtitle="Sin problemas"
            icon={TrendingUp}
            color="green"
            trend={kpis?.success_rate >= 90 ? 5 : -5}
          />
          <KPICard
            title="Rutas con Problemas"
            value={kpis?.problematic_routes || 0}
            subtitle="Requieren atención"
            icon={AlertCircle}
            color="red"
          />
          <KPICard
            title="Deuda Total"
            value={`$${(kpis?.total_debt || 0).toLocaleString()}`}
            subtitle="Garrafones perdidos"
            icon={DollarSign}
            color="yellow"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Garrafones Procesados</h3>
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {(kpis?.total_bottles || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Últimos 30 días</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Estado de Rutas Hoy</h3>
            {todayRoutes?.routes && todayRoutes.routes.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Completadas</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {todayRoutes.routes.filter(r => r.status === 'CLEARED').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">En Progreso</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {todayRoutes.routes.filter(r => r.status === 'IN_PROGRESS').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Con Problemas</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {todayRoutes.routes.filter(r => r.status === 'DEBT').length}
                  </span>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Sin rutas hoy"
                description="No hay rutas registradas para el día de hoy"
              />
            )}
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tendencias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tendencias (Últimos 30 días)</h3>
            {trendsLoading ? (
              <LoadingSkeleton />
            ) : trendChartData.length > 0 ? (
              <TrendChart
                data={trendChartData}
                lines={[
                  { dataKey: 'rutas', name: 'Total Rutas', color: '#3b82f6' },
                  { dataKey: 'problemas', name: 'Con Problemas', color: '#ef4444' }
                ]}
                height={300}
              />
            ) : (
              <EmptyState title="Sin datos" description="No hay datos de tendencias disponibles" />
            )}
          </motion.div>

          {/* Distribución de Estados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribución de Estados</h3>
            {statusLoading ? (
              <LoadingSkeleton />
            ) : statusChartData.length > 0 ? (
              <StatusDistribution data={statusChartData} height={300} />
            ) : (
              <EmptyState title="Sin datos" description="No hay datos de distribución disponibles" />
            )}
          </motion.div>
        </div>

        {/* Última Actividad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors"
        >
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
          </div>
          <div className="p-6">
            {todayRoutes?.routes && todayRoutes.routes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chofer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Camioneta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Garrafones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {todayRoutes.routes.slice(0, 5).map((route) => (
                      <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">#{route.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{route.driver_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{route.truck_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            route.status === 'CLEARED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                            route.status === 'DEBT' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                          }`}>
                            {route.status === 'CLEARED' ? 'Limpio' :
                             route.status === 'DEBT' ? 'Deuda' : 'En Curso'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{route.initial_full_bottles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={TruckIcon}
                title="Sin actividad"
                description="No hay rutas registradas hoy"
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}