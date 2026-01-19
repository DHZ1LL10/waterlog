import { useEffect, useState } from "react";
import api from "../services/api";

export function useRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      const res = await api.get("/routes");
      setRoutes(res.data.routes);
    } catch (err) {
      console.error("Error cargando rutas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return { routes, loading };
}
