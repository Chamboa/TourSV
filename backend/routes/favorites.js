const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// Listar favoritos de un usuario
router.get('/:usuarioId', async (req, res) => {
  try {
    const favoritos = await Favorite.find({ usuarioId: req.params.usuarioId }).populate('lugarId');
    res.json(favoritos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// Agregar favorito
router.post('/', async (req, res) => {
  try {
    const { usuarioId, lugarId } = req.body;
    const exists = await Favorite.findOne({ usuarioId, lugarId });
    if (exists) return res.status(400).json({ error: 'Ya está en favoritos' });
    const fav = new Favorite({ usuarioId, lugarId });
    await fav.save();
    res.status(201).json(fav);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
});

// Quitar favorito
router.delete('/', async (req, res) => {
  try {
    const { usuarioId, lugarId } = req.body;
    const fav = await Favorite.findOneAndDelete({ usuarioId, lugarId });
    if (!fav) return res.status(404).json({ error: 'No está en favoritos' });
    res.json({ message: 'Eliminado de favoritos' });
  } catch (err) {
    res.status(500).json({ error: 'Error al quitar favorito' });
  }
});

module.exports = router; 