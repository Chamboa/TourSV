const mongoose = require('mongoose');
const Promotion = require('./models/Promotion');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/toursv', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testPromotions() {
  try {
    console.log('Conectando a la base de datos...');
    await mongoose.connection.asPromise();
    console.log('Conectado a MongoDB');

    // Obtener todas las promociones
    const allPromotions = await Promotion.find({});
    console.log('\n=== TODAS LAS PROMOCIONES ===');
    console.log('Total de promociones:', allPromotions.length);
    
    allPromotions.forEach((promo, index) => {
      console.log(`\nPromoción ${index + 1}:`);
      console.log('- ID:', promo._id);
      console.log('- Título:', promo.titulo);
      console.log('- Empresa ID:', promo.empresaId);
      console.log('- Activa:', promo.activa);
      console.log('- Destacada:', promo.destacada);
      console.log('- Fecha Fin:', promo.fechaFin);
      console.log('- Categoría:', promo.categoria);
      console.log('- Descuento:', promo.descuento);
    });

    // Probar filtros
    console.log('\n=== PRUEBA DE FILTROS ===');
    
    // Promociones activas
    const activas = await Promotion.find({ activa: true });
    console.log('Promociones activas:', activas.length);
    
    // Promociones destacadas
    const destacadas = await Promotion.find({ destacada: true });
    console.log('Promociones destacadas:', destacadas.length);
    
    // Promociones no expiradas
    const noExpiradas = await Promotion.find({
      $or: [
        { fechaFin: { $exists: false } },
        { fechaFin: { $gt: new Date() } }
      ]
    });
    console.log('Promociones no expiradas:', noExpiradas.length);

    // Promociones activas y no expiradas (para clientes)
    const paraClientes = await Promotion.find({
      activa: true,
      $or: [
        { fechaFin: { $exists: false } },
        { fechaFin: { $gt: new Date() } }
      ]
    });
    console.log('Promociones para clientes:', paraClientes.length);

    // Probar filtro por empresa
    console.log('\n=== PRUEBA POR EMPRESA ===');
    const empresaId = '6865a1791e01297ce5db52c6';
    const porEmpresa = await Promotion.find({ empresaId });
    console.log('Promociones de la empresa:', porEmpresa.length);

    // Probar filtro combinado
    console.log('\n=== PRUEBA FILTRO COMBINADO ===');
    const combinado = await Promotion.find({
      empresaId,
      activa: true
    });
    console.log('Promociones activas de la empresa:', combinado.length);

    // Probar sin filtro de fecha
    console.log('\n=== PRUEBA SIN FILTRO DE FECHA ===');
    const sinFecha = await Promotion.find({
      activa: true
    });
    console.log('Promociones activas sin filtro de fecha:', sinFecha.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConexión cerrada');
  }
}

testPromotions(); 