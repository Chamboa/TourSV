# Despliegue en Render

## Configuración para Render

### Variables de Entorno en Render:
- `MONGODB_URI`: mongodb+srv://vallejosue078:josue.900@cluster1a.l23ac.mongodb.net/TourSv
- `PORT`: Render lo asigna automáticamente

### Configuración del Servicio:
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes (para cambios en el repositorio)

### URLs de la API:
- Base URL: `https://tu-app-name.onrender.com`
- Health Check: `https://tu-app-name.onrender.com/`
- API Endpoints: `https://tu-app-name.onrender.com/api/...`

## Endpoints disponibles:
- `GET /` - Health check
- `POST /api/users/register` - Registro de usuario
- `POST /api/users/login` - Login de usuario
- `GET /api/places` - Listar lugares
- `POST /api/places` - Crear lugar
- `GET /api/favorites/:usuarioId` - Listar favoritos
- `POST /api/favorites` - Agregar favorito
- `GET /api/promotions` - Listar promociones
- `GET /api/reservations` - Listar reservaciones
- `GET /api/events` - Listar eventos
- `GET /api/notifications` - Listar notificaciones

## Notas importantes:
1. El servidor se reinicia automáticamente después de 15 minutos de inactividad
2. MongoDB Atlas está configurado para aceptar conexiones desde cualquier IP
3. CORS está configurado para aceptar peticiones desde cualquier origen 