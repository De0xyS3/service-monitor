"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AddServiceForm() {
  const [isClient, setIsClient] = useState(false);  // Para controlar el renderizado en el cliente
  const [newService, setNewService] = useState({
    name: '',
    server: '',
    ip: '',
    user: '',
    password: '',
    sshPort: '', // Campo para el puerto SSH
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setIsClient(true);  // Asegura que el componente solo se renderice después de que el cliente haya montado
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validación básica
    if (!newService.name || !newService.server || !newService.ip || !newService.sshPort) {
      setFormError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Lógica para registrar el servicio
    console.log('Nuevo servicio a registrar:', newService);

    try {
      const res = await fetch('http://10.172.0.93:3001/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newService), // Enviar los datos del servicio
      });

      if (!res.ok) {
        throw new Error('Error al registrar el servicio');
      }

      const data = await res.json();
      console.log('Servicio registrado:', data);

      // Resetear el formulario después de enviar
      setNewService({
        name: '',
        server: '',
        ip: '',
        user: '',
        password: '',
        sshPort: '', // Restablecer el puerto SSH
      });
    } catch (error) {
      console.error('Error al registrar el servicio:', error);
      setFormError('Ocurrió un error al registrar el servicio.');
    }
  };

  // Evitar que el contenido se renderice en el servidor
  if (!isClient) return null;

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg rounded-lg p-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-6">Registrar Nuevo Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="name" className="font-semibold">Nombre del Servicio *</Label>
              <Input
                id="name"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                placeholder="Ej: Nginx-Producción"
                required
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="server" className="font-semibold">Nombre del Servidor *</Label>
              <Input
                id="server"
                name="server"
                value={newService.server}
                onChange={handleInputChange}
                placeholder="Ej: web-server-01"
                required
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ip" className="font-semibold">Dirección IP *</Label>
              <Input
                id="ip"
                name="ip"
                value={newService.ip}
                onChange={handleInputChange}
                placeholder="Ej: 192.168.1.100"
                required
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sshPort" className="font-semibold">Puerto *</Label>
              <Input
                id="sshPort"
                name="sshPort"
                type="number"
                value={newService.sshPort}
                onChange={handleInputChange}
                placeholder="Ej: 22"
                required
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="user" className="font-semibold">Usuario</Label>
              <Input
                id="user"
                name="user"
                value={newService.user}
                onChange={handleInputChange}
                placeholder="Usuario"
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="font-semibold">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={newService.password}
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Mostrar mensaje de error si es necesario */}
          {formError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200">
            Registrar Servicio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

