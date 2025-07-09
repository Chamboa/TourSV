/**
 * Script de Keep-Alive para TourSv Backend
 * 
 * Este script mantiene el servidor activo haciendo pings automáticos
 * para evitar que Render cierre el servidor por inactividad.
 * 
 * Uso:
 * - node keep-alive.js (ejecutar independientemente)
 * - O se ejecuta automáticamente desde app.js
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

// Configuración
const SERVER_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:4000';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutos
const INITIAL_DELAY = 60 * 1000; // 1 minuto

console.log('🔄 Iniciando sistema de Keep-Alive para TourSv');
console.log(`📍 URL del servidor: ${SERVER_URL}`);
console.log(`⏰ Intervalo de ping: ${PING_INTERVAL / 60000} minutos`);

// Función para hacer ping al servidor
function pingServer() {
  const protocol = SERVER_URL.startsWith('https') ? https : http;
  const timestamp = new Date().toISOString();
  
  console.log(`\n🔄 [${timestamp}] Haciendo ping a: ${SERVER_URL}`);
  
  protocol.get(SERVER_URL, (res) => {
    console.log(`✅ [${timestamp}] Ping exitoso - Status: ${res.statusCode}`);
    
    // También hacer ping a la ruta de health check
    const healthUrl = `${SERVER_URL}/health`;
    protocol.get(healthUrl, (healthRes) => {
      console.log(`🏥 [${timestamp}] Health check - Status: ${healthRes.statusCode}`);
    }).on('error', (err) => {
      console.log(`⚠️ [${timestamp}] Error en health check: ${err.message}`);
    });
    
  }).on('error', (err) => {
    console.log(`❌ [${timestamp}] Error en ping: ${err.message}`);
  });
}

// Función para manejar la salida del proceso
function gracefulShutdown() {
  console.log('\n🛑 Deteniendo sistema de Keep-Alive...');
  process.exit(0);
}

// Configurar manejadores de señales
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Iniciar el sistema de keep-alive
console.log(`⏳ Primer ping en ${INITIAL_DELAY / 1000} segundos...`);

// Hacer el primer ping después del delay inicial
setTimeout(() => {
  pingServer();
  
  // Configurar ping automático
  setInterval(pingServer, PING_INTERVAL);
  
  console.log(`✅ Sistema de Keep-Alive activo - Pings cada ${PING_INTERVAL / 60000} minutos`);
}, INITIAL_DELAY);

// Mantener el proceso vivo
console.log('💡 Sistema de Keep-Alive ejecutándose... (Ctrl+C para detener)'); 