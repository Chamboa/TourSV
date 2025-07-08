const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema); 