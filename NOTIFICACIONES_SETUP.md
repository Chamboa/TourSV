# Sistema de Notificaciones Push - TourSV

## 🚀 Características Implementadas

### ✅ **Notificaciones Automáticas**
- **Nuevas Promociones**: Los clientes reciben notificaciones cuando se crea una nueva promoción
- **Nuevas Reservaciones**: Las empresas reciben notificaciones cuando se hace una nueva reservación
- **Cambios de Estado**: Los clientes reciben notificaciones cuando cambia el estado de su reservación

### ✅ **Sistema Inteligente**
- **Filtros por Preferencias**: Los usuarios pueden configurar qué notificaciones recibir
- **Tokens Push**: Sistema de tokens para notificaciones push en tiempo real
- **Base de Datos**: Todas las notificaciones se guardan en la base de datos
- **Estado de Lectura**: Sistema de notificaciones leídas/no leídas

## 📱 Configuración del Frontend

### 1. **Instalar Dependencias**
```bash
expo install expo-notifications
expo install @react-native-async-storage/async-storage
```

### 2. **Configurar Expo Project ID**
En `components/NotificationHandler.js`, reemplaza:
```javascript
projectId: 'your-expo-project-id', // Reemplazar con tu project ID
```

Para obtener tu Project ID:
1. Ve a https://expo.dev
2. Crea un nuevo proyecto o selecciona uno existente
3. Copia el Project ID

### 3. **Integrar en la App**
En tu componente principal (App.js o similar):
```javascript
import NotificationHandler from './components/NotificationHandler';

export default function App() {
  return (
    <NavigationContainer>
      <NotificationHandler navigation={navigation} />
      {/* Resto de tu app */}
    </NavigationContainer>
  );
}
```

### 4. **Configurar app.json**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2E5006",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

## 🔧 Configuración del Backend

### 1. **Instalar Dependencias**
```bash
npm install axios
```

### 2. **Variables de Entorno**
Agregar en tu `.env`:
```env
EXPO_PROJECT_ID=your-expo-project-id
```

### 3. **Configurar Keep-Alive**
El sistema de keep-alive ya está configurado para mantener el servidor activo.

## 📋 Flujo de Notificaciones

### **Para Clientes (Nuevas Promociones)**
1. Empresa crea una nueva promoción
2. Sistema detecta la creación automáticamente
3. Se obtienen todos los usuarios clientes con notificaciones activas
4. Se envían notificaciones push a todos los clientes
5. Se crea registro en la base de datos

### **Para Empresas (Nuevas Reservaciones)**
1. Cliente hace una reservación
2. Sistema detecta la creación automáticamente
3. Se identifica la empresa propietaria del lugar
4. Se envía notificación push a la empresa
5. Se crea registro en la base de datos

### **Cambios de Estado de Reservaciones**
1. Empresa cambia el estado de una reservación
2. Sistema detecta el cambio automáticamente
3. Se envía notificación al cliente sobre el cambio
4. Se crea registro en la base de datos

## 🎯 Tipos de Notificaciones

### **Promociones**
- **Título**: "¡Nueva Promoción Disponible!"
- **Mensaje**: "{Título de la promoción} - {Lugar}"
- **Datos**: promocionId, lugarId, empresaId

### **Reservaciones**
- **Título**: "¡Nueva Reservación!"
- **Mensaje**: "Reservación para {Nombre} - {Lugar}"
- **Datos**: reservacionId, lugarId, userId

### **Cambios de Estado**
- **Título**: "Reservación {Estado}"
- **Mensaje**: "Tu reservación en {Lugar} ha sido {Estado}"
- **Datos**: reservacionId, lugarId, empresaId

## 🔄 API Endpoints

### **Notificaciones**
- `GET /api/notifications?userId={id}` - Obtener notificaciones de un usuario
- `GET /api/notifications/unread/{userId}` - Obtener notificaciones no leídas
- `POST /api/notifications` - Crear notificación
- `PUT /api/notifications/{id}/read` - Marcar como leída
- `PUT /api/notifications/read-all/{userId}` - Marcar todas como leídas
- `PUT /api/notifications/push-token/{userId}` - Actualizar token push
- `DELETE /api/notifications/{id}` - Eliminar notificación

### **Usuarios (Actualizado)**
- `PUT /api/users/{id}` - Actualizar perfil (incluye preferencias de notificaciones)

## 🎨 Interfaz de Usuario

### **Pantalla de Notificaciones**
- Lista de notificaciones con iconos según tipo
- Indicador visual para notificaciones no leídas
- Botón para marcar como leída al tocar
- Botón para eliminar notificación
- Navegación automática al contenido relacionado

### **Preferencias de Usuario**
- Activar/desactivar notificaciones
- Configurar tipos específicos (promociones, reservaciones, generales)
- Token push automático

## 🧪 Testing

### **Notificación Local**
```javascript
import { sendLocalNotification } from './components/NotificationHandler';

// Enviar notificación de prueba
await sendLocalNotification(
  'Prueba',
  'Esta es una notificación de prueba',
  { tipo: 'test' }
);
```

### **Verificar Token**
```javascript
import { getCurrentPushToken } from './components/NotificationHandler';

const token = await getCurrentPushToken();
console.log('Token actual:', token);
```

## 🚨 Troubleshooting

### **Las notificaciones no llegan**
1. Verificar que el Project ID esté configurado correctamente
2. Confirmar que los permisos estén otorgados
3. Verificar que el token se esté guardando en el backend
4. Revisar los logs del servidor

### **Error de permisos**
1. Verificar configuración en app.json
2. Reinstalar la app si es necesario
3. Verificar configuración del dispositivo

### **Notificaciones duplicadas**
1. Verificar que no haya múltiples listeners
2. Limpiar AsyncStorage si es necesario
3. Revisar la lógica de creación de notificaciones

## 📊 Monitoreo

### **Logs del Servidor**
El sistema registra:
- Tokens actualizados
- Notificaciones enviadas
- Errores de envío
- Estadísticas de entrega

### **Métricas Recomendadas**
- Tasa de entrega de notificaciones
- Tasa de apertura
- Usuarios con notificaciones activas
- Tipos de notificaciones más populares

## 🔒 Seguridad

### **Buenas Prácticas**
- Los tokens se almacenan de forma segura
- Las notificaciones respetan las preferencias del usuario
- No se envían datos sensibles en las notificaciones
- Sistema de rate limiting para evitar spam

### **Privacidad**
- Los usuarios pueden desactivar notificaciones
- Preferencias granulares por tipo
- Fácil eliminación de tokens

## 🚀 Próximos Pasos

### **Mejoras Futuras**
- Notificaciones programadas
- Plantillas personalizables
- Analytics avanzados
- Notificaciones en lote
- Soporte para múltiples idiomas

### **Integración con Servicios Externos**
- Firebase Cloud Messaging
- OneSignal
- Pushwoosh
- Amazon SNS

---

## 📞 Soporte

Para problemas o preguntas sobre el sistema de notificaciones:
1. Revisar los logs del servidor
2. Verificar la configuración de Expo
3. Probar con notificaciones locales
4. Contactar al equipo de desarrollo 