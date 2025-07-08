const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  // Usuario que hace la reservación
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Lugar reservado
  placeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Place', 
    required: true 
  },
  
  // Promoción aplicada (opcional)
  promotionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Promotion' 
  },
  
  // Información de la reservación
  fechaReservacion: { 
    type: Date, 
    required: true 
  },
  horaReservacion: { 
    type: String, 
    required: true 
  },
  numeroPersonas: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  
  // Detalles del servicio
  tipoServicio: { 
    type: String, 
    enum: ['Comida', 'Hospedaje', 'Entretenimiento', 'Transporte', 'Otros'],
    required: true 
  },
  descripcion: { 
    type: String 
  },
  
  // Precios y descuentos
  precioOriginal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  descuentoAplicado: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  precioFinal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  
  // Estado de la reservación
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente' 
  },
  
  // Información de contacto
  nombreContacto: { 
    type: String, 
    required: true 
  },
  telefonoContacto: { 
    type: String, 
    required: true 
  },
  emailContacto: { 
    type: String, 
    required: true 
  },
  
  // Notas y comentarios
  notasEspeciales: { 
    type: String 
  },
  notasEmpresa: { 
    type: String 
  },
  
  // Fechas importantes
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  fechaConfirmacion: { 
    type: Date 
  },
  fechaCancelacion: { 
    type: Date 
  },
  
  // Método de pago
  metodoPago: { 
    type: String, 
    enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'],
    default: 'efectivo' 
  },
  pagado: { 
    type: Boolean, 
    default: false 
  },
  
  // Calificación después de completada
  calificacion: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  comentarioCliente: { 
    type: String 
  },
  
  // Código de confirmación único
  codigoConfirmacion: { 
    type: String, 
    unique: true 
  }
}, { 
  timestamps: true 
});

// Generar código de confirmación único antes de guardar
ReservationSchema.pre('save', function(next) {
  if (!this.codigoConfirmacion) {
    this.codigoConfirmacion = 'RSV-' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
  }
  next();
});

// Índices para mejorar búsquedas
ReservationSchema.index({ userId: 1, estado: 1 });
ReservationSchema.index({ placeId: 1, fechaReservacion: 1 });
ReservationSchema.index({ estado: 1, fechaReservacion: 1 });
ReservationSchema.index({ codigoConfirmacion: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema); 