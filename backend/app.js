require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vallejosue078:josue.900@cluster1a.l23ac.mongodb.net/TourSv';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Conectado a MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.log('Error de conexión a MongoDB:', err);
});

// Función para hacer ping al servidor (keep-alive)
function keepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  
  console.log(`🔄 Haciendo ping a: ${url}`);
  
  const protocol = url.startsWith('https') ? https : http;
  
  protocol.get(url, (res) => {
    console.log(`✅ Ping exitoso - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`❌ Error en ping: ${err.message}`);
  });
}

// Configurar ping automático cada 14 minutos (840,000 ms)
// Render cierra servidores después de 15 minutos de inactividad
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutos

// Iniciar el sistema de keep-alive
setInterval(keepAlive, PING_INTERVAL);

// Hacer el primer ping después de 1 minuto
setTimeout(keepAlive, 60 * 1000);

// Rutas
app.get('/', (req, res) => {
  res.send('API TourSv funcionando en Render - Keep-alive activo');
});

// Ruta específica para health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Importar rutas (se agregarán luego)
const usersRouter = require('./routes/users2');
app.use('/api/users', usersRouter);
app.use('/api/places', require('./routes/places'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/events', require('./routes/events'));
const promotionsRouter = require('./routes/promotions');
const notificationsRouter = require('./routes/notifications');
const reservationsRouter = require('./routes/reservations');
app.use('/api/promotions', promotionsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reservations', reservationsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
  console.log(`⏰ Sistema de keep-alive configurado cada ${PING_INTERVAL / 60000} minutos`);
}); 