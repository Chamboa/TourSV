require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

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

// Rutas
app.get('/', (req, res) => {
  res.send('API TourSv funcionando en Render');
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
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
}); 