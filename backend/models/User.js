const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String },
  avatar: { type: String },
  preferencias: [{ type: String }],
  role: { type: String, enum: ['user', 'empresa', 'admin'], default: 'user' },
  // Configuración de notificaciones
  pushToken: { type: String }, // Token para notificaciones push
  notificacionesActivas: { type: Boolean, default: true }, // Si quiere recibir notificaciones
  preferenciasNotificaciones: {
    promociones: { type: Boolean, default: true },
    reservaciones: { type: Boolean, default: true },
    generales: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 