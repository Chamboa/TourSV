const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Place = require('../models/Place');
const Promotion = require('../models/Promotion');

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Faltan campos' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'El email ya está registrado' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: role || 'user' });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el registro' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });
    res.json({ message: 'Login exitoso', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el login' });
  }
});

// Perfil (obtener)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Editar perfil
router.put('/:id', async (req, res) => {
  try {
    const { name, telefono, avatar, preferencias } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, telefono, avatar, preferencias },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar perfil' });
  }
});

// Middleware para verificar admin
async function requireAdmin(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(401).json({ error: 'Falta userId' });
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Error de autenticación' });
  }
}

// Listar todos los usuarios (solo admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Estadísticas de empresa
router.get('/empresas/:id/estadisticas', async (req, res) => {
  try {
    const empresaId = req.params.id;

    // Promociones de la empresa
    const promociones = await Promotion.find({ empresaId });
    const totalPromociones = promociones.length;
    const totalCuponesUsados = promociones.reduce((acc, p) => acc + (p.cuponesUsados || 0), 0);
    const activas = promociones.filter(p => p.activa).length;
    const inactivas = promociones.filter(p => !p.activa).length;
    const destacadas = promociones.filter(p => p.destacada).length;
    const porCategoria = {};
    promociones.forEach(p => {
      porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1;
    });

    // Evolución de cupones usados por mes (últimos 12 meses)
    const now = new Date();
    const meses = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      meses.push({
        label: `${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        cupones: 0
      });
    }
    promociones.forEach(promo => {
      // Simulación: cuponesUsados distribuidos aleatoriamente (mejor si tienes historial real)
      if (promo.cuponesUsados && promo.createdAt) {
        const idx = meses.findIndex(m => {
          const created = new Date(promo.createdAt);
          return created.getFullYear() === m.year && created.getMonth() === m.month;
        });
        if (idx !== -1) meses[idx].cupones += promo.cuponesUsados;
      }
    });

    // Lugares publicados
    const lugares = await Place.find({ userId: empresaId });
    const lugarIds = lugares.map(l => l._id);

    // Contar favoritos reales para cada lugar
    const Favorite = require('../models/Favorite');
    const favoritosPorLugar = {};
    for (const lugarId of lugarIds) {
      favoritosPorLugar[lugarId] = await Favorite.countDocuments({ lugarId });
    }

    // Estadísticas de reservaciones
    const Reservation = require('../models/Reservation');
    const reservaciones = await Reservation.find({ placeId: { $in: lugarIds } });
    
    const estadisticasReservaciones = {
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
      estadisticasReservaciones.calificacionPromedio = (
        completadas.reduce((acc, r) => acc + r.calificacion, 0) / completadas.length
      ).toFixed(1);
    }

    // Evolución de reservaciones por mes (últimos 12 meses)
    const reservacionesPorMes = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesInicio = new Date(d.getFullYear(), d.getMonth(), 1);
      const mesFin = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const reservacionesMes = reservaciones.filter(r => {
        const fechaReserva = new Date(r.fechaCreacion);
        return fechaReserva >= mesInicio && fechaReserva <= mesFin;
      });

      reservacionesPorMes.push({
        label: `${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        reservaciones: reservacionesMes.length,
        ingresos: reservacionesMes
          .filter(r => r.estado === 'completada')
          .reduce((acc, r) => acc + r.precioFinal, 0)
      });
    }

    res.json({
      totalPromociones,
      totalCuponesUsados,
      activas,
      inactivas,
      destacadas,
      porCategoria,
      cuponesPorMes: meses,
      lugares: lugares.map(l => ({
        _id: l._id,
        nombre: l.nombre,
        favoritos: favoritosPorLugar[l._id] || 0,
        visitas: l.visitas || 0
      })),
      // Estadísticas de reservaciones
      reservaciones: estadisticasReservaciones,
      reservacionesPorMes: reservacionesPorMes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;