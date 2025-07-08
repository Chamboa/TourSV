const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  titulo: { type: String, required: true },
  descripcion: { type: String },
  lugar: { type: String, required: true },
  descuento: { type: Number, min: 0, max: 100, default: 0 }, // Porcentaje de descuento
  precioOriginal: { type: Number, min: 0 },
  precioDescuento: { type: Number, min: 0 },
  fechaInicio: { type: Date, default: Date.now },
  fechaFin: { type: Date },
  activa: { type: Boolean, default: true },
  categoria: { 
    type: String, 
    enum: ['Comida', 'Entretenimiento', 'Hospedaje', 'Transporte', 'Cultura', 'Deportes', 'Otros'],
    default: 'Otros'
  },
  imagen: { type: String }, // URL de la imagen
  cuponesDisponibles: { type: Number, default: -1 }, // -1 = ilimitado
  cuponesUsados: { type: Number, default: 0 },
  condiciones: { type: String }, // Términos y condiciones
  destacada: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Índices para mejorar búsquedas
PromotionSchema.index({ empresaId: 1, activa: 1 });
PromotionSchema.index({ placeId: 1, activa: 1 });
PromotionSchema.index({ categoria: 1, activa: 1 });
PromotionSchema.index({ fechaFin: 1, activa: 1 });

module.exports = mongoose.model('Promotion', PromotionSchema); 