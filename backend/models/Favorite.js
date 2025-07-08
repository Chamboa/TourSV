const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lugarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', FavoriteSchema); 