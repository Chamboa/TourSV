const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const User = require('../models/User');

// Listar todos los lugares o solo los de una empresa
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const places = await Place.find(filter);
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lugares' });
  }
});

// Obtener un lugar por ID
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: 'Lugar no encontrado' });
    // Contar favoritos reales
    const Favorite = require('../models/Favorite');
    const favoritos = await Favorite.countDocuments({ lugarId: place._id });
    // Puedes agregar visitas reales aquí si tienes ese modelo
    res.json({
      ...place.toObject(),
      favoritos
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lugar' });
  }
});

// Middleware para verificar rol
async function requireEmpresaOrAdmin(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(401).json({ error: 'Falta userId' });
    const user = await User.findById(userId);
    if (!user || (user.role !== 'empresa' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Error de autenticación' });
  }
}

// Crear lugar
router.post('/', requireEmpresaOrAdmin, async (req, res) => {
  try {
    const place = new Place({ ...req.body, userId: req.body.userId });
    await place.save();
    res.status(201).json(place);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear lugar' });
  }
});

// Editar lugar
router.put('/:id', requireEmpresaOrAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!place) return res.status(404).json({ error: 'Lugar no encontrado' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar lugar' });
  }
});

// Eliminar lugar
router.delete('/:id', requireEmpresaOrAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ error: 'Lugar no encontrado' });
    res.json({ message: 'Lugar eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar lugar' });
  }
});

// Agregar reseña
router.post('/:id/reviews', async (req, res) => {
  try {
    const { usuario, texto, rating } = req.body;
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: 'Lugar no encontrado' });
    place.reseñas.unshift({ usuario, texto, rating });
    await place.save();
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar reseña' });
  }
});

module.exports = router; 