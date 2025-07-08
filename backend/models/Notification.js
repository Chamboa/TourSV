const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  leida: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', NotificationSchema); 