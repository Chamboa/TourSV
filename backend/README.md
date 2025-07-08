# Backend TourSv

API REST para la app TourSv usando Node.js, Express y MongoDB.

## Requisitos
- Node.js
- MongoDB (corriendo en localhost)

## Instalación

```
cd backend
npm install
```

## Ejecución

```
# En desarrollo (con recarga automática)
npm run dev

# En producción
npm start
```

La API estará disponible en: [http://localhost:4000](http://localhost:4000)

## Endpoints principales

- `POST   /api/users/register`   → Registro de usuario
- `POST   /api/users/login`      → Login de usuario
- `GET    /api/users/:id`        → Obtener perfil
- `PUT    /api/users/:id`        → Editar perfil

- `GET    /api/places`           → Listar lugares
- `GET    /api/places/:id`       → Detalle de lugar
- `POST   /api/places`           → Crear lugar
- `PUT    /api/places/:id`       → Editar lugar
- `DELETE /api/places/:id`       → Eliminar lugar
- `POST   /api/places/:id/reviews` → Agregar reseña

- `GET    /api/favorites/:usuarioId` → Listar favoritos de usuario
- `POST   /api/favorites`        → Agregar favorito
- `DELETE /api/favorites`        → Quitar favorito 