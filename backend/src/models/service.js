// backend/src/models/service.js
const mongoose = require('mongoose');

// Definir el esquema del servicio
const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ip: { type: String, required: true },
  user: { type: String, required: true },
  password: { type: String, required: true },
  sshPort: { type: Number, required: true },
  server: { type: String },  // Si también se incluye un campo 'server', asegúrate de agregarlo aquí
  status: { type: String, default: 'inactive' },
  cpu: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  uptime: { type: String, default: '0d 0h 0m' }
});

// Crear el modelo del servicio
const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;

