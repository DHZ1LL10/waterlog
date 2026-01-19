import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Truck,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

import PerformanceChart from '../components/charts/PerformanceChart';
import TrendChart from '../components/charts/TrendChart';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { reportsApi } from '../services/apiService';

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedView, setSelectedView] = useState('overview');

  // Calcular fechas
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(
    selectedPeriod === '30' ? subDays(new Date(), 30) :
    selectedPeriod === '90' ? subDays(new Date(), 90) :
    subMonths(new Date(), 12),
    'yyyy-MM-dd'
  );

  // Queries
  const { data: kpis } = useQuery({
    queryKey: ['reports-kpis', startDate, endDate],
    queryFn: () => reportsApi.getKPIs(startDate, endDate)
  });

  const { data: trendsData } = useQuery({
    queryKey: ['reports-trends', selectedPeriod],
    queryFn: () => reportsApi.getDailyTrends(parseInt(selectedPeriod))
  });

  const { data: truckData } = useQuery({
    queryKey: ['truck-performance', startDate, endDate],
    queryFn: () => reportsApi.getTruckPerformance(startDate, endDate)
  });

  const { data: driverData } = useQuery({
    queryKey: ['driver-performance', startDate, endDate],
    queryFn: () => reportsApi.getDriverPerformance(startDate, endDate, 10)
  });

  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-summary'],
    queryFn: () => reportsApi.getMonthlySummary(12)
  });

  // Formatear datos para gráficas
  const truckChartData = truckData?.trucks.map(truck => ({
    name: truck.nickname,
    rutas: truck.total_routes,
    problemas: truck.problematic_routes,
    exito: truck.success_rate
  })) || [];

  const driverChartData = driverData?.drivers.map(driver => ({
    name: driver.full_name.split(' ')[0],
    rutas: driver.total_routes,
    problemas: driver.problematic_routes,
    exito: driver.success_rate
  })) || [];

  const monthlyChartData = monthlyData?.monthly.map(item => ({
    date: `${item.month}/${item.year}`,
    rutas: item.total_routes,
    garrafones: item.total_bottles,
    deuda: item.total_debt
  })) || [];

  const handleExportData = () => {
    const csvData = generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${startDate}_${endDate}.csv`;
    a.click();
  };

  const generateCSVData = () => {
    let csv = 'Tipo,Nombre,Total Rutas,Rutas con Problema,Tasa de Éxito\n';
    
    truckData?.trucks.forEach(truck => {
      csv += `Camioneta,${truck.nickname},${truck.total_routes},${truck.problematic_routes},${truck.success_rate}%\n`;
    });
    
    driverData?.drivers.forEach(driver => {
      csv += `Chofer,${driver.full_name},${driver.total_routes},${driver.problematic_routes},${driver.success_rate}%\n`;
    });
    
    return csv;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes y Analytics</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Análisis detallado de operaciones</p>
            </div>
            <Button
              onClick={handleExportData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4" />
              Exportar Datos
            </Button>
          </div>

          {/* Filtros */}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors">
              {[
                { value: '30', label: '30 días' },
                { value: '90', label: '90 días' },
                { value: '365', label: '1 año' }
              ].map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors">
              {[
                { value: 'overview', label: 'General', icon: BarChart3 },
                { value: 'trucks', label: 'Camionetas', icon: Truck },
                { value: 'drivers', label: 'Choferes', icon: Users }
              ].map(view => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.value}
                    onClick={() => setSelectedView(view.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedView === view.value
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {view.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Vista General */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Resumen Mensual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tendencia Mensual (Último Año)</h3>
              {monthlyChartData.length > 0 ? (
                <TrendChart
                  data={monthlyChartData}
                  lines={[
                    { dataKey: 'rutas', name: 'Rutas', color: '#3b82f6' },
                    { dataKey: 'garrafones', name: 'Garrafones', color: '#10b981' }
                  ]}
                  height={400}
                />
              ) : (
                <LoadingSkeleton />
              )}
            </motion.div>

            {/* Comparativas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 5 Camionetas</h3>
                {truckChartData.length > 0 ? (
                  <PerformanceChart
                    data={truckChartData.slice(0, 5)}
                    bars={[
                      { dataKey: 'rutas', name: 'Total Rutas', color: '#3b82f6' },
                      { dataKey: 'problemas', name: 'Con Problemas', color: '#ef4444' }
                    ]}
                    height={300}
                  />
                ) : (
                  <EmptyState title="Sin datos" />
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 5 Choferes</h3>
                {driverChartData.length > 0 ? (
                  <PerformanceChart
                    data={driverChartData.slice(0, 5)}
                    bars={[
                      { dataKey: 'rutas', name: 'Total Rutas', color: '#10b981' },
                      { dataKey: 'problemas', name: 'Con Problemas', color: '#ef4444' }
                    ]}
                    height={300}
                  />
                ) : (
                  <EmptyState title="Sin datos" />
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* Vista de Camionetas */}
        {selectedView === 'trucks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors"
          >
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rendimiento Detallado por Camioneta</h3>
            </div>
            <div className="p-6">
              {truckData?.trucks && truckData.trucks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Camioneta</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Placa</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Rutas</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Problemas</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Garrafones</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deuda</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">% Éxito</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {truckData.trucks.map(truck => (
                        <tr key={truck.truck_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {truck.nickname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {truck.plate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {truck.total_routes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`${truck.problematic_routes > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                              {truck.problematic_routes}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {truck.total_bottles_delivered.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`${truck.total_debt > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                              ${truck.total_debt.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              truck.success_rate >= 95 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              truck.success_rate >= 85 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                              {truck.success_rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={Truck}
                  title="Sin datos de camionetas"
                  description="No hay información disponible para el período seleccionado"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Vista de Choferes */}
        {selectedView === 'drivers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors"
          >
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rendimiento Detallado por Chofer</h3>
            </div>
            <div className="p-6">
              {driverData?.drivers && driverData.drivers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chofer</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Rutas</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Problemas</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Garrafones</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deuda</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">% Éxito</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {driverData.drivers.map(driver => (
                        <tr key={driver.driver_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {driver.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {driver.total_routes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`${driver.problematic_routes > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                              {driver.problematic_routes}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            {driver.total_bottles_delivered.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`${driver.total_debt > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                              ${driver.total_debt.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              driver.success_rate >= 95 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              driver.success_rate >= 85 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                              {driver.success_rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Sin datos de choferes"
                  description="No hay información disponible para el período seleccionado"
                />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}