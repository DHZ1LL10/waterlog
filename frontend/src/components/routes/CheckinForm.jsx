import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';

const CheckinForm = ({ routeId, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  
  // Estado para la lista de clientes disponibles
  const [clients, setClients] = useState([]);
  
  // Estado para las ventas agregadas dinámicamente
  // Empieza con una fila vacía para "Público General" (asumiendo que sea el ID 1 o el primero)
  const [salesRows, setSalesRows] = useState([
    { client_id: "", quantity: "" }
  ]);

  // Cargar clientes al abrir el formulario
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        setClients(res.data);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };
    fetchClients();
  }, []);

  // Manejar cambios en las filas de ventas
  const handleSaleChange = (index, field, value) => {
    const newRows = [...salesRows];
    newRows[index][field] = value;
    setSalesRows(newRows);
  };

  // Agregar nueva fila
  const addRow = () => {
    setSalesRows([...salesRows, { client_id: "", quantity: "" }]);
  };

  // Quitar fila
  const removeRow = (index) => {
    const newRows = salesRows.filter((_, i) => i !== index);
    setSalesRows(newRows);
  };

  const onSubmit = async (data) => {
    try {
      // 1. Limpiar y formatear las ventas
      const formattedSales = salesRows
        .filter(row => row.client_id && row.quantity) // Solo enviar filas completas
        .map(row => ({
          client_id: parseInt(row.client_id),
          quantity: parseInt(row.quantity)
        }));

      // 2. Armar el payload final
      const payload = {
        returned_full_bottles: parseInt(data.returned_full_bottles),
        returned_empty_bottles: parseInt(data.returned_empty_bottles),
        reported_damaged: parseInt(data.reported_damaged || 0),
        evidence_verified: !!data.evidence_verified,
        notes: data.notes,
        sales: formattedSales // <--- AQUÍ VA LA LISTA NUEVA
      };

      await api.post(`/routes/${routeId}/checkin`, payload);
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error en check-in:', error);
      alert('Error al registrar la entrada. Revisa los datos.');
    }
  };

  // Calcular total vendido reportado (solo visual)
  const totalReportedSales = salesRows.reduce((acc, row) => acc + (parseInt(row.quantity) || 0), 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* SECCIÓN 1: INVENTARIO FÍSICO (Lo que trae la camioneta) */}
      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
          📦 Inventario de Retorno
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Llenos Retornados"
            type="number"
            {...register('returned_full_bottles', { required: 'Requerido', min: 0 })}
            error={errors.returned_full_bottles}
          />
          <Input
            label="Vacíos Retornados"
            type="number"
            {...register('returned_empty_bottles', { required: 'Requerido', min: 0 })}
            error={errors.returned_empty_bottles}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Garrafones Dañados (Mermas)"
            type="number"
            {...register('reported_damaged', { min: 0 })}
          />
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              {...register('evidence_verified')}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-slate-300">Evidencia de daño verificada</label>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DESGLOSE DE VENTAS (NUEVO) */}
      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            💰 Desglose de Ventas
          </h3>
          <span className="text-xs font-mono bg-blue-900 text-blue-200 px-2 py-1 rounded">
            Total Reportado: {totalReportedSales} u.
          </span>
        </div>

        <div className="space-y-3">
          {salesRows.map((row, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-grow">
                <select
                  className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  value={row.client_id}
                  onChange={(e) => handleSaleChange(index, 'client_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar Cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.special_price ? `($${client.special_price})` : '(Precio Std)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  placeholder="Cant."
                  className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={row.quantity}
                  onChange={(e) => handleSaleChange(index, 'quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
              {salesRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          + Agregar otro cliente
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Notas Generales</label>
        <textarea
          {...register('notes')}
          className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="Observaciones adicionales..."
        ></textarea>
      </div>

      <Button type="submit" isLoading={isSubmitting} fullWidth>
        Registrar Entrada y Conciliar
      </Button>
    </form>
  );
};

export default CheckinForm;