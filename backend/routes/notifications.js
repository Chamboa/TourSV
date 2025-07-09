const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

// Listar notificaciones de un usuario
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }
    
    const notis = await Notification.find({ userId }).sort({ fecha: -1 });
    res.json(notis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener notificaciones no leídas
router.get('/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notis = await notificationService.getUnreadNotifications(userId);
    res.json(notis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear notificación
router.post('/', async (req, res) => {
  try {
    const { userId, tipo, titulo, mensaje, datos } = req.body;
    const noti = await notificationService.sendNotificationToUser(
      userId, tipo, titulo, mensaje, datos
    );
    res.status(201).json(noti);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Marcar notificación como leída
router.put('/:id/read', async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marcar todas las notificaciones como leídas
router.put('/read-all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany(
      { userId, leida: false },
      { leida: true, fechaLeida: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar token de push
router.put('/push-token/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { pushToken } = req.body;
    await notificationService.updatePushToken(userId, pushToken);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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