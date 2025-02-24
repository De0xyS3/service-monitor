"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  // Importación correcta de SelectItem
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LogsView() {
  const [logs, setLogs] = useState([]);
  const [services, setServices] = useState([]);  // Nueva variable para almacenar los servicios
  const [filters, setFilters] = useState({
    service: 'all',
    level: 'all_levels',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const logsPerPage = 5;

  useEffect(() => {
    // Función para obtener los logs
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://10.172.0.93:3001/api/logs');
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    // Función para obtener los servicios
    const fetchServices = async () => {
      try {
        const res = await fetch('http://10.172.0.93:3001/api/services');
        const data = await res.json();
        setServices(data);  // Almacenar los servicios en el estado
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchLogs();
    fetchServices();  // Llamar la función para obtener los servicios
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);  // Reiniciar la página actual cuando cambian los filtros
  };

  // Filtrado de logs según los filtros seleccionados
  const filteredLogs = logs.filter(log =>
    (filters.service === 'all' || log.service === filters.service) &&
    (filters.level === 'all_levels' || log.level === filters.level) &&
    (filters.search === '' || log.message.toLowerCase().includes(filters.search.toLowerCase()))
  );

  // Paginación
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Obtener el color según el nivel de log (ERROR, WARN, INFO)
  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-500 hover:bg-red-600';
      case 'WARN':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'INFO':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className="w-full dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold dark:text-white">Logs de Servicios Registrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filtradores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtrar por Servicio */}
            <div className="flex flex-col">
              <Label htmlFor="service-filter" className="dark:text-white">Filtrar por Servicio</Label>
              <Select
                value={filters.service}
                onValueChange={(value) => handleFilterChange('service', value)}
              >
                <SelectTrigger id="service-filter" className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Todos los servicios" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-md">
                  <SelectItem value="all" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Todos los servicios
                  </SelectItem>
                  {services.map(service => (
                    <SelectItem key={service._id} value={service.name} className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtrar por Nivel */}
            <div className="flex flex-col">
              <Label htmlFor="level-filter" className="dark:text-white">Filtrar por Nivel</Label>
              <Select
                value={filters.level}
                onValueChange={(value) => handleFilterChange('level', value)}
              >
                <SelectTrigger id="level-filter" className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-md">
                  <SelectItem value="all_levels" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Todos los niveles
                  </SelectItem>
                  <SelectItem value="INFO" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    INFO
                  </SelectItem>
                  <SelectItem value="WARN" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    WARN
                  </SelectItem>
                  <SelectItem value="ERROR" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    ERROR
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buscar por mensaje */}
            <div className="flex flex-col">
              <Label htmlFor="search-filter" className="dark:text-white">Buscar en Mensaje</Label>
              <Input
                id="search-filter"
                type="text"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Tabla de logs */}
          <div className="overflow-x-auto">
            <Table className="min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  {/* Aquí agregamos padding-right: 30px a las cabeceras */}
                  <TableHead className="px-4 py-2 pr-8 dark:text-gray-300" style={{ paddingRight: '30px' }}>Timestamp</TableHead>
                  <TableHead className="px-4 py-2 pr-8 dark:text-gray-300" style={{ paddingRight: '30px' }}>Servicio</TableHead>
                  <TableHead className="px-4 py-2 pr-8 dark:text-gray-300" style={{ paddingRight: '30px' }}>Nivel</TableHead>
                  <TableHead className="px-4 py-2 pr-8 dark:text-gray-300" style={{ paddingRight: '30px' }}>Mensaje</TableHead>
                  <TableHead className="px-4 py-2 pr-8 dark:text-gray-300" style={{ paddingRight: '30px' }}>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="px-4 py-2 dark:text-white whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="px-4 py-2 dark:text-white">{log.service}</TableCell>
                    <TableCell className="px-4 py-2">
                      <Badge className={`${getLevelColor(log.level)} text-white`}>
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2 dark:text-white max-w-xs truncate">{log.message}</TableCell>
                    <TableCell className="px-4 py-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                            Ver Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
                          <DialogHeader>
                            <DialogTitle className="dark:text-white">Detalles del Log</DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                              Información completa del registro de log
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <ScrollArea className="mt-4 h-[200px] rounded-md border p-4 dark:border-gray-700">
                              <div className="space-y-2">
                                <p className="dark:text-white"><strong>ID:</strong> {selectedLog._id}</p>
                                <p className="dark:text-white"><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                                <p className="dark:text-white"><strong>Servicio:</strong> {selectedLog.service}</p>
                                <p className="dark:text-white"><strong>Nivel:</strong> {selectedLog.level}</p>
                                <p className="dark:text-white"><strong>Mensaje:</strong> {selectedLog.message}</p>
                              </div>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setCurrentPage(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}

