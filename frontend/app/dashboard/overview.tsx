import { Button } from "@/components/ui/button"; // Componente personalizado de tu proyecto
import { Progress } from "@/components/ui/progress"; // Componente Radix UI para la barra de progreso
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Componente personalizado de tu proyecto
import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

// Función para obtener el color basado en el porcentaje de uso
const getProgressBarColor = (value) => {
  if (value < 50) {
    return 'bg-green-500';  // Verdes para valores menores al 50%
  } else if (value < 80) {
    return 'bg-yellow-500'; // Amarillo para valores entre 50% y 80%
  } else {
    return 'bg-red-500';    // Rojo para valores mayores al 80%
  }
};

// Función para convertir uptime a un formato legible
const formatUptime = (uptimeInSeconds) => {
  const days = Math.floor(uptimeInSeconds / (24 * 60 * 60));
  const hours = Math.floor((uptimeInSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);

  let uptimeString = '';
  if (days > 0) uptimeString += `${days}d `;
  if (hours > 0) uptimeString += `${hours}h `;
  uptimeString += `${minutes}m`;

  return uptimeString;
};

// Componente principal
export default function ServiceOverview() {
  const [services, setServices] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);  // Usar la variable de entorno
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    setHydrated(true);
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRestartService = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}/restart`, { method: 'POST' });  // Usar la variable de entorno
      console.log("Servicio reiniciado");
      fetchData();
    } catch (error) {
      console.error("Error al reiniciar el servicio", error);
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setServices(services.filter(service => service._id !== id));
        console.log("Servicio eliminado");
      } else {
        console.error("Error al eliminar el servicio");
      }
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {services.map((service) => (
        <div key={service._id} className="relative shadow-lg bg-white dark:bg-gray-800 rounded-lg p-4">
          <button
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
            onClick={() => handleDeleteService(service._id)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</h3>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-sm ${service.status === 'active' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {service.status}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Uptime: {formatUptime(service.uptime)}</span>
          </div>
          <div className="space-y-2 mb-2">
            <div className="text-sm text-gray-900 dark:text-white">CPU: {service.cpu}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className={`${getProgressBarColor(service.cpu)} h-2.5 rounded-full`} style={{ width: `${service.cpu}%` }}></div>
            </div>
            <div className="text-sm text-gray-900 dark:text-white">Memoria: {service.memory}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className={`${getProgressBarColor(service.memory)} h-2.5 rounded-full`} style={{ width: `${service.memory}%` }}></div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Servidor: {service.server}</div>

            <Button
              variant="outline"
              size="sm"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => handleRestartService(service._id)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
        </div>
      ))}
    </div>
  );
}

