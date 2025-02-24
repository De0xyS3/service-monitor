const express = require('express');
const cors = require('cors');
const { Client } = require('ssh2'); // Importar SSH2

const Service = require('./models/service')
require('dotenv').config();  // Cargar variables de entorno

const { getServicesFromDB, getLogs, addService } = require('./database');  // Importar funciones de la base de datos
const { startMonitoring } = require('./serviceMonitor');  // Importar función de monitoreo de servicios

const app = express();
app.use(cors());
app.use(express.json());  // Para procesar datos en formato JSON


// Obtener todos los servicios registrados desde la base de datos
app.get('/api/services', async (req, res) => {
  try {
    const services = await getServicesFromDB();  // Obtener los servicios de la base de datos
    
    // Ocultar campos sensibles como 'ip', 'user', y 'password'
    const sanitizedServices = services.map(service => {
      // Extraer los campos sensibles y devolver solo los no sensibles
      const { password, user, ip, ...sanitizedService } = service._doc;  // Usar ._doc si es Mongoose
      return sanitizedService;
    });

    res.json(sanitizedServices);  // Enviar los servicios sin los campos sensibles
  } catch (error) {
    console.error('Error al obtener los servicios:', error);  // Log en caso de error
    res.status(500).json({ message: 'Error al obtener los servicios', error: error.message });
  }
});

















// Registrar un nuevo servicio con configuración SSH
app.post('/api/services', async (req, res) => {
  try {
    const { name, ip, user, password, sshPort, server } = req.body;  // Capturar los datos enviados desde el frontend

    // Validación básica de los datos recibidos
    if (!name || !ip || !user || !password || !sshPort || !server) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const newService = {
      name,
      ip,
      user,
      password,
      sshPort,
      server,  // Incluir 'server' en el objeto del nuevo servicio
      status: 'inactive',  // Inicia como inactivo
      cpu: 0,
      memory: 0,
      uptime: '0d 0h 0m'
    };

    // Agregar el servicio a la base de datos
    await addService(newService);
    console.log('Servicio registrado correctamente:', newService);  // Log de éxito
    res.status(201).json({ message: 'Servicio registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar el servicio:', error);  // Log en caso de error
    res.status(500).json({ message: 'Error al registrar el servicio', error: error.message });
  }
});

// Ruta para reiniciar un servicio
app.post('/api/services/:id/restart', async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Buscar el servicio en la base de datos
    const service = await getServicesFromDB().then(services => services.find(s => s._id == serviceId));
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Conectar al servidor del servicio y reiniciarlo
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`Conexión SSH establecida con ${service.ip} para reiniciar el servicio ${service.name}`);
      
      // Comando para reiniciar el servicio
      conn.exec(`systemctl restart ${service.name}`, (err, stream) => {
        if (err) {
          console.error(`Error al ejecutar el comando en ${service.ip}:`, err);
          return res.status(500).json({ message: 'Error al reiniciar el servicio' });
        }

        stream.on('close', (code, signal) => {
          console.log(`Servicio ${service.name} reiniciado en ${service.ip}`);
          conn.end(); // Cerrar la conexión SSH
          res.json({ message: `Servicio ${service.name} reiniciado correctamente` });
        });
      });
    }).on('error', (err) => {
      console.error(`Error de conexión SSH a ${service.ip}:`, err);

      // Enviar alerta o registrar un log del error
      // Aquí puedes agregar código para enviar una alerta o notificación, como un correo electrónico o un mensaje
      res.status(500).json({ message: `Error de conexión SSH a ${service.ip}` });
      
      conn.end(); // Asegúrate de cerrar la conexión en caso de error
    }).connect({
      host: service.ip,
      port: service.sshPort,
      username: service.user,
      password: service.password
    });

  } catch (error) {
    console.error('Error al reiniciar el servicio:', error);
    res.status(500).json({ message: 'Error al reiniciar el servicio', error: error.message });
  }
});



// Ruta para eliminar un servicio por su ID
app.delete('/api/services/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findByIdAndDelete(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.status(200).json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el servicio:', error);
    res.status(500).json({ message: 'Error al eliminar el servicio', error: error.message });
  }
});







// Obtener los logs de la base de datos
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await getLogs();  // Obtener logs
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener los logs:', error);  // Log en caso de error
    res.status(500).json({ message: 'Error al obtener los logs', error: error.message });
  }
});

// Iniciar el servidor y el monitoreo de servicios
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);

  // Iniciar el monitoreo de servicios
  startMonitoring();
});

