const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Place = require('../models/Place');
const Promotion = require('../models/Promotion');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Obtener reservaciones del cliente
router.get('/cliente/:userId', async (req, res) => {
  try {
    const { estado, limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { userId: req.params.userId };
    if (estado) query.estado = estado;
    
    const reservaciones = await Reservation.find(query)
      .populate('placeId', 'nombre direccion img')
      .populate('promotionId', 'titulo descuento')
      .sort({ fechaCreacion: -1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    const total = await Reservation.countDocuments(query);
    
    res.json({
      reservaciones,
      total,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener reservaciones de una empresa (para sus lugares)
router.get('/empresa/:empresaId', async (req, res) => {
  try {
    console.log('Buscando reservaciones para empresa:', req.params.empresaId);
    const { estado, lugarId, limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Obtener lugares de la empresa
    const lugares = await Place.find({ userId: req.params.empresaId });
    const lugarIds = lugares.map(l => l._id);
    console.log('Lugares encontrados:', lugarIds);
    
    let query = { placeId: { $in: lugarIds } };
    if (estado) query.estado = estado;
    if (lugarId) query.placeId = lugarId;
    
    const reservaciones = await Reservation.find(query)
      .populate('placeId', 'nombre direccion')
      .populate('userId', 'name email')
      .populate('promotionId', 'titulo descuento')
      .sort({ fechaCreacion: -1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    const total = await Reservation.countDocuments(query);
    
    console.log('Reservaciones encontradas:', reservaciones.length);
    console.log('Query ejecutada:', query);
    
    res.json({
      reservaciones,
      total,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener reservación por ID
router.get('/:id', async (req, res) => {
  try {
    const reservacion = await Reservation.findById(req.params.id)
      .populate('placeId', 'nombre direccion telefono')
      .populate('userId', 'name email')
      .populate('promotionId', 'titulo descuento condiciones');
      
    if (!reservacion) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }
    
    res.json(reservacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva reservación
router.post('/', async (req, res) => {
  try {
    console.log('Creando reservación con datos:', req.body);
    
    const {
      userId,
      placeId,
      promotionId,
      fechaReservacion,
      horaReservacion,
      numeroPersonas,
      tipoServicio,
      descripcion,
      precioOriginal,
      nombreContacto,
      telefonoContacto,
      emailContacto,
      notasEspeciales,
      metodoPago
    } = req.body;

    // Validar que el lugar existe
    const lugar = await Place.findById(placeId);
    if (!lugar) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    // Validar que la promoción existe y está activa (si se proporciona)
    let descuentoAplicado = 0;
    if (promotionId) {
      const promocion = await Promotion.findById(promotionId);
      if (!promocion) {
        return res.status(404).json({ error: 'Promoción no encontrada' });
      }
      if (!promocion.activa) {
        return res.status(400).json({ error: 'Promoción no está activa' });
      }
      if (promocion.fechaFin && new Date() > promocion.fechaFin) {
        return res.status(400).json({ error: 'Promoción ha expirado' });
      }
      descuentoAplicado = promocion.descuento || 0;
    }

    // Calcular precio final
    const precioFinal = precioOriginal - (precioOriginal * descuentoAplicado / 100);

    // Crear la reservación
    const reservacion = new Reservation({
      userId,
      placeId,
      promotionId,
      fechaReservacion: new Date(fechaReservacion),
      horaReservacion,
      numeroPersonas,
      tipoServicio,
      descripcion,
      precioOriginal,
      descuentoAplicado,
      precioFinal,
      nombreContacto,
      telefonoContacto,
      emailContacto,
      notasEspeciales,
      metodoPago: metodoPago || 'efectivo'
    });

    await reservacion.save();
    console.log('Reservación guardada con ID:', reservacion._id);

    // Si hay promoción, incrementar cupones usados
    if (promotionId) {
      await Promotion.findByIdAndUpdate(promotionId, {
        $inc: { cuponesUsados: 1 }
      });
    }

    // Poblar datos para la respuesta
    await reservacion.populate('placeId', 'nombre direccion');
    await reservacion.populate('promotionId', 'titulo descuento');

    // Notificar a la empresa sobre la nueva reservación
    try {
      await notificationService.notifyNewReservation(reservacion);
    } catch (notificationError) {
      console.error('Error enviando notificación de reservación:', notificationError);
      // No fallar la creación de la reservación por error en notificación
    }

    console.log('Reservación creada exitosamente:', reservacion);
    res.status(201).json(reservacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar estado de reservación (para empresas)
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado, notasEmpresa } = req.body;
    
    if (!['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const updateData = { estado };
    if (estado === 'confirmada') {
      updateData.fechaConfirmacion = new Date();
    } else if (estado === 'cancelada') {
      updateData.fechaCancelacion = new Date();
    }
    if (notasEmpresa) updateData.notasEmpresa = notasEmpresa;

    const reservacion = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('placeId', 'nombre direccion')
     .populate('userId', 'name email');

    if (!reservacion) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }

    // Notificar al cliente sobre el cambio de estado
    try {
      await notificationService.notifyReservationStatusChange(reservacion, estado);
    } catch (notificationError) {
      console.error('Error enviando notificación de cambio de estado:', notificationError);
      // No fallar la actualización por error en notificación
    }

    res.json(reservacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancelar reservación (para clientes)
router.put('/:id/cancelar', async (req, res) => {
  try {
    const reservacion = await Reservation.findById(req.params.id);
    
    if (!reservacion) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }

    if (reservacion.estado === 'cancelada') {
      return res.status(400).json({ error: 'Reservación ya está cancelada' });
    }

    if (reservacion.estado === 'completada') {
      return res.status(400).json({ error: 'No se puede cancelar una reservación completada' });
    }

    // Solo permitir cancelar si es el propietario o si está pendiente
    if (reservacion.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden cancelar reservaciones pendientes' });
    }

    reservacion.estado = 'cancelada';
    reservacion.fechaCancelacion = new Date();
    await reservacion.save();

    res.json(reservacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Calificar reservación completada
router.put('/:id/calificar', async (req, res) => {
  try {
    const { calificacion, comentarioCliente } = req.body;
    
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'Calificación debe estar entre 1 y 5' });
    }

    const reservacion = await Reservation.findById(req.params.id);
    
    if (!reservacion) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }

    if (reservacion.estado !== 'completada') {
      return res.status(400).json({ error: 'Solo se pueden calificar reservaciones completadas' });
    }

    reservacion.calificacion = calificacion;
    reservacion.comentarioCliente = comentarioCliente;
    await reservacion.save();

    res.json(reservacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener estadísticas de reservaciones para empresa
router.get('/empresa/:empresaId/estadisticas', async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query;
    
    // Obtener lugares de la empresa
    const lugares = await Place.find({ userId: req.params.empresaId });
    const lugarIds = lugares.map(l => l._id);
    
    const ahora = new Date();
    let fechaInicio;
    
    switch (periodo) {
      case 'semana':
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case 'año':
        fechaInicio = new Date(ahora.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    }

    const reservaciones = await Reservation.find({
      placeId: { $in: lugarIds },
      fechaCreacion: { $gte: fechaInicio }
    });

    const estadisticas = {
      total: reservaciones.length,
      pendientes: reservaciones.filter(r => r.estado === 'pendiente').length,
      confirmadas: reservaciones.filter(r => r.estado === 'confirmada').length,
      canceladas: reservaciones.filter(r => r.estado === 'cancelada').length,
      completadas: reservaciones.filter(r => r.estado === 'completada').length,
      ingresos: reservaciones
        .filter(r => r.estado === 'completada')
        .reduce((acc, r) => acc + r.precioFinal, 0),
      calificacionPromedio: 0
    };

    const completadas = reservaciones.filter(r => r.estado === 'completada' && r.calificacion);
    if (completadas.length > 0) {
      estadisticas.calificacionPromedio = (
        completadas.reduce((acc, r) => acc + r.calificacion, 0) / completadas.length
      ).toFixed(1);
    }

    res.json(estadisticas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar reservación por código de confirmación
router.get('/codigo/:codigo', async (req, res) => {
  try {
    const reservacion = await Reservation.findOne({ 
      codigoConfirmacion: req.params.codigo 
    })
    .populate('placeId', 'nombre direccion')
    .populate('userId', 'name email')
    .populate('promotionId', 'titulo descuento');
    
    if (!reservacion) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }
    
    res.json(reservacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 