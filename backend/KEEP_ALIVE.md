# Sistema de Keep-Alive para TourSv Backend

## ¿Por qué es necesario?

Render.com cierra automáticamente los servidores gratuitos después de **15 minutos de inactividad**. Esto significa que si no hay solicitudes al servidor durante 15 minutos, el servidor se "duerme" y la próxima solicitud tendrá que "despertarlo", causando un retraso de varios segundos.

## Solución Implementada

### 1. Ping Automático Interno
- **Ubicación**: `app.js` (líneas 25-45)
- **Frecuencia**: Cada 14 minutos
- **Funcionamiento**: El servidor hace ping a sí mismo automáticamente
- **Ventaja**: No requiere servicios externos

### 2. Script de Keep-Alive Independiente
- **Ubicación**: `keep-alive.js`
- **Uso**: `npm run keep-alive`
- **Funcionamiento**: Script separado que puede ejecutarse en otro servidor o localmente

### 3. Ruta de Health Check
- **Endpoint**: `/health`
- **Respuesta**: JSON con estado del servidor
- **Uso**: Para monitoreo externo

## Configuración

### Variables de Entorno
```env
RENDER_EXTERNAL_URL=https://tu-app.onrender.com
PORT=4000
```

### Scripts Disponibles
```bash
# Iniciar servidor normal (con keep-alive integrado)
npm start

# Iniciar solo el sistema de keep-alive
npm run keep-alive

# Desarrollo con nodemon
npm run dev
```

## Servicios Externos Recomendados

Para mayor confiabilidad, puedes usar servicios gratuitos de monitoreo:

### 1. UptimeRobot (Gratuito)
- URL: https://uptimerobot.com
- Configuración:
  - URL a monitorear: `https://tu-app.onrender.com/health`
  - Intervalo: 5 minutos
  - Tipo: HTTP(s)

### 2. Cron-job.org (Gratuito)
- URL: https://cron-job.org
- Configuración:
  - URL: `https://tu-app.onrender.com/health`
  - Frecuencia: Cada 10 minutos

### 3. Pingdom (Gratuito limitado)
- URL: https://pingdom.com
- Configuración similar a UptimeRobot

## Monitoreo

### Logs del Sistema
El sistema registra cada ping en la consola:
```
🔄 Haciendo ping a: https://tu-app.onrender.com
✅ Ping exitoso - Status: 200
🏥 Health check - Status: 200
```

### Endpoint de Health Check
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## Troubleshooting

### El servidor sigue durmiéndose
1. Verifica que `RENDER_EXTERNAL_URL` esté configurado correctamente
2. Revisa los logs para errores de ping
3. Considera usar un servicio externo como respaldo

### Errores de conexión
1. Verifica que la URL del servidor sea accesible
2. Confirma que el servidor esté ejecutándose
3. Revisa la configuración de CORS si es necesario

## Costos

- **Ping interno**: Gratuito (incluido en el servidor)
- **Script independiente**: Gratuito (puede ejecutarse localmente)
- **Servicios externos**: Gratuitos (con límites)

## Recomendaciones

1. **Usa múltiples métodos**: Combina el ping interno con un servicio externo
2. **Monitorea los logs**: Revisa regularmente que los pings sean exitosos
3. **Configura alertas**: Usa servicios externos para recibir notificaciones si el servidor falla
4. **Considera upgrade**: Si tu aplicación crece, considera el plan pago de Render que no tiene límites de inactividad 