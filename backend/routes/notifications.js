const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Listar notificaciones de una empresa
router.get('/', async (req, res) => {
  try {
    const { empresaId } = req.query;
    const query = empresaId ? { empresaId } : {};
    const notis = await Notification.find(query).sort({ fecha: -1 });
    res.json(notis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear notificación
router.post('/', async (req, res) => {
  try {
    const { empresaId, mensaje } = req.body;
    const noti = new Notification({ empresaId, mensaje });
    await noti.save();
    res.status(201).json(noti);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar notificación
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 