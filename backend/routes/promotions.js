const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');

// Listar promociones con filtros avanzados
router.get('/', async (req, res) => {
  try {
    const { 
      empresaId, 
      placeId, 
      categoria, 
      activa, 
      destacada,
      limit = 20,
      page = 1,
      soloActivas = false
    } = req.query;
    
    let query = {};
    if (empresaId) query.empresaId = empresaId;
    if (placeId) query.placeId = placeId;
    if (categoria) query.categoria = categoria;
    if (activa !== undefined) query.activa = activa === 'true';
    if (destacada !== undefined) query.destacada = destacada === 'true';
    
    // Solo filtrar promociones expiradas si se solicita específicamente
    if (soloActivas === 'true') {
      query.$or = [
        { fechaFin: { $exists: false } },
        { fechaFin: null },
        { fechaFin: { $gt: new Date() } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const promos = await Promotion.find(query)
      .sort({ destacada: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('placeId', 'nombre direccion');
      
    const total = await Promotion.countDocuments(query);
    
    res.json({
      promociones: promos,
      total,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener promociones destacadas para clientes
router.get('/destacadas', async (req, res) => {
  try {
    const promos = await Promotion.find({ 
      activa: true,
      destacada: true,
      $or: [
        { fechaFin: { $exists: false } },
        { fechaFin: null },
        { fechaFin: { $gt: new Date() } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('placeId', 'nombre direccion');
    
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener promoción por ID
router.get('/:id', async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id)
      .populate('placeId', 'nombre direccion telefono');
    if (!promo) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }
    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear promoción
router.post('/', async (req, res) => {
  try {
    const {
      empresaId,
      placeId,
      titulo,
      descripcion,
      lugar,
      descuento,
      precioOriginal,
      precioDescuento,
      fechaInicio,
      fechaFin,
      categoria,
      imagen,
      cuponesDisponibles,
      condiciones,
      destacada
    } = req.body;

    const promo = new Promotion({
      empresaId,
      placeId,
      titulo,
      descripcion,
      lugar,
      descuento: descuento || 0,
      precioOriginal,
      precioDescuento,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      categoria: categoria || 'Otros',
      imagen,
      cuponesDisponibles: cuponesDisponibles || -1,
      condiciones,
      destacada: destacada || false
    });

    await promo.save();
    res.status(201).json(promo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar promoción
router.put('/:id', async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      descuento,
      precioOriginal,
      precioDescuento,
      fechaInicio,
      fechaFin,
      categoria,
      imagen,
      cuponesDisponibles,
      condiciones,
      destacada,
      activa
    } = req.body;

    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (descuento !== undefined) updateData.descuento = descuento;
    if (precioOriginal !== undefined) updateData.precioOriginal = precioOriginal;
    if (precioDescuento !== undefined) updateData.precioDescuento = precioDescuento;
    if (fechaInicio !== undefined) updateData.fechaInicio = new Date(fechaInicio);
    if (fechaFin !== undefined) updateData.fechaFin = fechaFin ? new Date(fechaFin) : null;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (imagen !== undefined) updateData.imagen = imagen;
    if (cuponesDisponibles !== undefined) updateData.cuponesDisponibles = cuponesDisponibles;
    if (condiciones !== undefined) updateData.condiciones = condiciones;
    if (destacada !== undefined) updateData.destacada = destacada;
    if (activa !== undefined) updateData.activa = activa;

    const promo = await Promotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!promo) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    res.json(promo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Usar cupón de promoción
router.post('/:id/usar-cupon', async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    if (!promo.activa) {
      return res.status(400).json({ error: 'Promoción no está activa' });
    }

    if (promo.fechaFin && new Date() > promo.fechaFin) {
      return res.status(400).json({ error: 'Promoción ha expirado' });
    }

    if (promo.cuponesDisponibles !== -1 && promo.cuponesUsados >= promo.cuponesDisponibles) {
      return res.status(400).json({ error: 'No hay cupones disponibles' });
    }

    promo.cuponesUsados += 1;
    await promo.save();

    res.json({ 
      success: true, 
      cuponesRestantes: promo.cuponesDisponibles === -1 ? 'Ilimitados' : promo.cuponesDisponibles - promo.cuponesUsados 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar promoción
router.delete('/:id', async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 