const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  usuario: String,
  texto: String,
  rating: Number,
}, { _id: false });

const RecommendationSchema = new mongoose.Schema({
  nombre: String,
  img: String,
}, { _id: false });

const PlaceSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dept: { type: String, required: true },
  img: { type: String },
  galeria: [{ type: String }],
  rating: { type: Number, default: 0 },
  descripcion: { type: String },
  ubicacion: { type: String },
  horario: { type: String },
  precio: { type: String },
  servicios: [{ type: String }],
  contacto: { type: String },
  web: { type: String },
  clima: { type: String },
  reseñas: [ReviewSchema],
  recomendaciones: [RecommendationSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Place', PlaceSchema); 