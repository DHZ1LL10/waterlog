import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Truck, Plus, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resourcesApi } from '../services/apiService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Resources() {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' or 'trucks'
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administración de Recursos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona tu flota y personal</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'drivers' ? 'Nuevo Chofer' : 'Nueva Camioneta'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 border-b bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors">
        <div className="flex gap-6">
          <button
            onClick={() => { setActiveTab('drivers'); setShowForm(false); }}
            className={`py-4 px-2 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'drivers'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Choferes
          </button>
          <button
            onClick={() => { setActiveTab('trucks'); setShowForm(false); }}
            className={`py-4 px-2 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'trucks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Truck className="w-4 h-4" />
            Camionetas
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        {showForm ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeTab === 'drivers' ? (
              <DriverForm onCancel={() => setShowForm(false)} />
            ) : (
              <TruckForm onCancel={() => setShowForm(false)} />
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {activeTab === 'drivers' ? <DriversList /> : <TrucksList />}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENTE: Lista de Choferes ---
function DriversList() {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: resourcesApi.getDrivers
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!drivers?.length) return <EmptyState title="No hay choferes" description="Registra uno nuevo para comenzar" icon={Users} />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors border dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuario (Interno)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {drivers.map((driver) => (
            <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{driver.full_name}</td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{driver.username}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Activo
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- COMPONENTE: Lista de Camionetas ---
function TrucksList() {
  const { data: trucks, isLoading } = useQuery({
    queryKey: ['trucks'],
    queryFn: resourcesApi.getTrucks
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!trucks?.length) return <EmptyState title="No hay camionetas" description="Agrega unidades a tu flota" icon={Truck} />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors border dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Placa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Modelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {trucks.map((truck) => (
            <tr key={truck.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{truck.nickname}</td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{truck.plate}</td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{truck.brand} {truck.model} ({truck.year})</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Activo
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- FORMULARIO: Crear Chofer (SIMPLIFICADO) ---
function DriverForm({ onCancel }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: '' });

  const mutation = useMutation({
    mutationFn: resourcesApi.createDriver,
    onSuccess: () => {
      toast.success('Chofer registrado');
      queryClient.invalidateQueries(['drivers']);
      onCancel();
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Error al crear')
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700 max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Registrar Nuevo Chofer</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Ingresa solo el nombre. El sistema generará el usuario y contraseña automáticamente.
      </p>
      
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
          <input 
            className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.full_name} 
            onChange={e => setForm({...form, full_name: e.target.value})} 
            required 
            placeholder="Ej: Juan Pérez"
            autoFocus
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={mutation.isLoading} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> 
            {mutation.isLoading ? 'Guardando...' : 'Guardar Chofer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- FORMULARIO: Crear Camioneta ---
function TruckForm({ onCancel }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nickname: '', plate: '', brand: '', model: '', year: new Date().getFullYear() });

  const mutation = useMutation({
    mutationFn: resourcesApi.createTruck,
    onSuccess: () => {
      toast.success('Camioneta registrada');
      queryClient.invalidateQueries(['trucks']);
      onCancel();
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Error al crear')
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Registrar Nueva Camioneta</h3>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre/Apodo (ej: Unidad 1)</label>
            <input 
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Placas</label>
            <input 
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} required 
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
            <input 
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required placeholder="Nissan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo</label>
            <input 
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={form.model} onChange={e => setForm({...form, model: e.target.value})} required placeholder="NP300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Año</label>
            <input 
              type="number"
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} required 
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
          <button type="submit" disabled={mutation.isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>
      </form>
    </div>
  );
}