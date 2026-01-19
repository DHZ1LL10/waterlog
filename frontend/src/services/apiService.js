import api from './api';

// Definimos el prefijo correcto de la API
const PREFIX = '/api/v1';

export const reportsApi = {
  // KPIs
  getKPIs: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`${PREFIX}/reports/kpis?${params}`);
    return response.data;
  },

  // Tendencias diarias
  getDailyTrends: async (days = 30) => {
    const response = await api.get(`${PREFIX}/reports/trends/daily?days=${days}`);
    return response.data;
  },

  // Performance por camioneta
  getTruckPerformance: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`${PREFIX}/reports/trucks/performance?${params}`);
    return response.data;
  },

  // Performance por chofer
  getDriverPerformance: async (startDate, endDate, limit = 10) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit);
    const response = await api.get(`${PREFIX}/reports/drivers/performance?${params}`);
    return response.data;
  },

  // Distribución de estados
  getStatusDistribution: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`${PREFIX}/reports/status/distribution?${params}`);
    return response.data;
  },

  // Resumen mensual
  getMonthlySummary: async (months = 12) => {
    const response = await api.get(`${PREFIX}/reports/monthly/summary?months=${months}`);
    return response.data;
  }
};

export const routesApi = {
  // Listar rutas
  listRoutes: async (dateFilter) => {
    const params = new URLSearchParams();
    if (dateFilter) params.append('date_filter', dateFilter);
    const response = await api.get(`${PREFIX}/routes?${params}`);
    return response.data;
  },

  // Checkout
  checkout: async (data) => {
    const response = await api.post(`${PREFIX}/routes/checkout`, data);
    return response.data;
  },

  // Checkin
  checkin: async (routeId, data) => {
    const response = await api.post(`${PREFIX}/routes/${routeId}/checkin`, data);
    return response.data;
  }
};

export const resourcesApi = {
  getDrivers: async () => {
    const response = await api.get(`${PREFIX}/resources/drivers`);
    return response.data;
  },
  getTrucks: async () => {
    const response = await api.get(`${PREFIX}/resources/trucks`);
    return response.data;
  }
};

export const authApi = {
  login: async (username, password) => {
    // CORRECCIÓN CRÍTICA: Convertir a formato de formulario para OAuth2
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post(`${PREFIX}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};