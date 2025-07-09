const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Usuario destinatario
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Tipo de notificación
  tipo: { 
    type: String, 
    enum: ['promocion', 'reservacion', 'general', 'sistema'],
    required: true 
  },
  
  // Contenido
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  
  // Datos adicionales
  datos: {
    promocionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
    reservacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    lugarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Estado
  leida: { type: Boolean, default: false },
  enviada: { type: Boolean, default: false }, // Si se envió como push notification
  
  // Fechas
  fecha: { type: Date, default: Date.now },
  fechaLeida: { type: Date }
}, { timestamps: true });

// Índices para mejorar búsquedas
NotificationSchema.index({ userId: 1, leida: 1 });
NotificationSchema.index({ userId: 1, tipo: 1 });
NotificationSchema.index({ fecha: -1 });

module.exports = mongoose.model('Notification', NotificationSchema); 