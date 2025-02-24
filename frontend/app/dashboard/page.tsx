"use client";

import { useState } from 'react';
import { Activity, AlertCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ServiceOverview from './overview';  // Vista para el resumen
import ServiceLogs from './logs';  // Vista para los logs
import AddService from './add';  // Vista para agregar un servicio

export default function ServiceMonitorDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'add'>('overview');

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monitor de Servicios</h1>
        </div>
        <nav className="mt-4">
          {/* Botones del sidebar con estilos hover */}
          <Button
            variant={activeTab === 'overview' ? "default" : "ghost"}
            className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"  // Estilo hover añadido
            onClick={() => setActiveTab('overview')}
          >
            <Activity className="mr-2 h-4 w-4" />
            Resumen
          </Button>
          <Button
            variant={activeTab === 'logs' ? "default" : "ghost"}
            className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"  // Estilo hover añadido
            onClick={() => setActiveTab('logs')}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Logs
          </Button>
          <Button
            variant={activeTab === 'add' ? "default" : "ghost"}
            className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"  // Estilo hover añadido
            onClick={() => setActiveTab('add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Servicio
          </Button>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-8 overflow-auto bg-gray-100 dark:bg-gray-900">
        {activeTab === 'overview' && <ServiceOverview />}
        {activeTab === 'logs' && <ServiceLogs />}
        {activeTab === 'add' && <AddService />}
      </div>
    </div>
  );
}

