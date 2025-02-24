const mongoose = require('mongoose');
const Service = require('./models/service');
const Log = require('./models/log');

// Verificar que MONGO_URI esté definido
if (!process.env.MONGO_URI) {
  throw new Error('La variable MONGO_URI no está definida. Verifica el archivo .env');
}

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch((err) => console.log('Error al conectar a MongoDB:', err));

// Obtener los servicios desde MongoDB
async function getServicesFromDB() {
  return await Service.find();
}

// Actualizar el estado de un servicio, incluyendo CPU, memoria y uptime
async function updateServiceStatus(id, status, cpu = 0, memory = 0, uptime = '0d 0h 0m') {
  await Service.findByIdAndUpdate(id, { status, cpu, memory, uptime });
}

// Obtener logs recientes
async function getLogs() {
  return await Log.find().sort({ timestamp: -1 }).limit(100);
}

// Agregar un nuevo log
async function addLog(service, message) {
  const newLog = new Log({ service, message });
  await newLog.save();
}

// Agregar un nuevo servicio a la base de datos
async function addService(serviceData) {
  const newService = new Service(serviceData);  // Crear un nuevo servicio basado en el modelo
  await newService.save();  // Guardar el servicio en la base de datos
}

module.exports = {
  getServicesFromDB,
  updateServiceStatus,
  getLogs,
  addLog,
  addService,  // Exportar la nueva función
};

