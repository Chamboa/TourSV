import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEmpresaEstadisticas } from './api';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function EstadisticasScreen() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    if (user && user.role === 'empresa') {
      setLoading(true);
      getEmpresaEstadisticas(user.id).then(data => {
        setStats(data);
        setLoading(false);
      }).catch(error => {
        console.error('Error cargando estadísticas:', error);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading || !stats) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#0984A3" /></View>;
  }

  // Validar que stats tenga todas las propiedades necesarias
  const safeStats = {
    totalPromociones: stats.totalPromociones || 0,
    totalCuponesUsados: stats.totalCuponesUsados || 0,
    activas: stats.activas || 0,
    inactivas: stats.inactivas || 0,
    destacadas: stats.destacadas || 0,
    porCategoria: stats.porCategoria || {},
    cuponesPorMes: stats.cuponesPorMes || [],
    lugares: stats.lugares || [],
    // Estadísticas de reservaciones
    reservaciones: stats.reservaciones || {
      total: 0,
      pendientes: 0,
      confirmadas: 0,
      canceladas: 0,
      completadas: 0,
      ingresos: 0,
      calificacionPromedio: 0
    },
    reservacionesPorMes: stats.reservacionesPorMes || []
  };

  // Datos para gráfica de categorías
  const categorias = Object.keys(safeStats.porCategoria).map(cat => ({
    name: cat,
    count: safeStats.porCategoria[cat] || 0,
    color: '#0984A3',
    legendFontColor: '#222',
    legendFontSize: 13
  }));

  // Encontrar el máximo para normalizar las barras
  const maxCupones = Math.max(...safeStats.cuponesPorMes.map(m => m?.cupones || 0), 1);
  const maxCategoria = Math.max(...categorias.map(c => c.count), 1);
  const maxReservaciones = Math.max(...safeStats.reservacionesPorMes.map(m => m?.reservaciones || 0), 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF7' }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60, paddingTop: 48 }}>
        <Text style={styles.title}>Estadísticas de Empresa</Text>
        
        {/* Métricas principales */}
        <View style={styles.metricsBox}>
          <Text style={styles.metric}>Promociones creadas: <Text style={styles.metricValue}>{safeStats.totalPromociones}</Text></Text>
          <Text style={styles.metric}>Cupones usados: <Text style={styles.metricValue}>{safeStats.totalCuponesUsados}</Text></Text>
          <Text style={styles.metric}>Promociones activas: <Text style={styles.metricValue}>{safeStats.activas}</Text></Text>
          <Text style={styles.metric}>Promociones inactivas: <Text style={styles.metricValue}>{safeStats.inactivas}</Text></Text>
          <Text style={styles.metric}>Promociones destacadas: <Text style={styles.metricValue}>{safeStats.destacadas}</Text></Text>
        </View>

        {/* Estadísticas de Reservaciones */}
        <View style={styles.metricsBox}>
          <Text style={styles.sectionTitle}>📅 Estadísticas de Reservaciones</Text>
          <Text style={styles.metric}>Total de reservaciones: <Text style={styles.metricValue}>{safeStats.reservaciones.total}</Text></Text>
          <Text style={styles.metric}>Pendientes: <Text style={styles.metricValue}>{safeStats.reservaciones.pendientes}</Text></Text>
          <Text style={styles.metric}>Confirmadas: <Text style={styles.metricValue}>{safeStats.reservaciones.confirmadas}</Text></Text>
          <Text style={styles.metric}>Completadas: <Text style={styles.metricValue}>{safeStats.reservaciones.completadas}</Text></Text>
          <Text style={styles.metric}>Canceladas: <Text style={styles.metricValue}>{safeStats.reservaciones.canceladas}</Text></Text>
          <Text style={styles.metric}>Ingresos totales: <Text style={styles.metricValue}>${safeStats.reservaciones.ingresos.toFixed(2)}</Text></Text>
          <Text style={styles.metric}>Calificación promedio: <Text style={styles.metricValue}>⭐ {safeStats.reservaciones.calificacionPromedio}</Text></Text>
        </View>

        {/* Gráfica de categorías */}
        {categorias.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Promociones por categoría</Text>
            <View style={styles.chartContainer}>
              {categorias.map((c, i) => (
                <View key={c.name} style={styles.barItem}>
                  <View style={styles.barLabel}>
                    <Text style={styles.barText}>{c.name}</Text>
                    <Text style={styles.barValue}>{c.count}</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          width: `${(c.count / maxCategoria) * 100}%`,
                          backgroundColor: ['#0984A3', '#A3B65A', '#E17055', '#FFD700', '#2E5006', '#888', '#ccc'][i % 7]
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Gráfica de cupones por mes */}
        {safeStats.cuponesPorMes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Evolución de cupones usados (últimos 12 meses)</Text>
            <View style={styles.chartContainer}>
              {safeStats.cuponesPorMes.map((m, i) => (
                <View key={m?.label || i} style={styles.barItem}>
                  <View style={styles.barLabel}>
                    <Text style={styles.barText}>{m?.label || `Mes ${i+1}`}</Text>
                    <Text style={styles.barValue}>{m?.cupones || 0}</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          width: `${((m?.cupones || 0) / maxCupones) * 100}%`,
                          backgroundColor: '#0984A3'
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Gráfica de reservaciones por mes */}
        {safeStats.reservacionesPorMes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📈 Evolución de reservaciones (últimos 12 meses)</Text>
            <View style={styles.chartContainer}>
              {safeStats.reservacionesPorMes.map((m, i) => (
                <View key={m?.label || i} style={styles.barItem}>
                  <View style={styles.barLabel}>
                    <Text style={styles.barText}>{m?.label || `Mes ${i+1}`}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.barValue}>{m?.reservaciones || 0}</Text>
                      <Text style={[styles.barValue, { marginLeft: 8, fontSize: 12, color: '#E17055' }]}>
                        ${(m?.ingresos || 0).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          width: `${((m?.reservaciones || 0) / maxReservaciones) * 100}%`,
                          backgroundColor: '#4CAF50'
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Lugares publicados */}
        {safeStats.lugares.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Lugares publicados</Text>
            <View style={{ width: '100%', marginTop: 10 }}>
              {safeStats.lugares.map((l, i) => (
                <View key={l?._id || i} style={styles.topLugar}>
                  <Text style={styles.topLugarName}>{i+1}. {l?.nombre || 'Lugar sin nombre'}</Text>
                  <Text style={styles.topLugarValue}>❤️ {l?.favoritos || 0}  👁️ {l?.visitas || 0}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Mensaje si no hay datos */}
        {categorias.length === 0 && safeStats.cuponesPorMes.length === 0 && safeStats.lugares.length === 0 && safeStats.reservaciones.total === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay datos de estadísticas disponibles</Text>
            <Text style={styles.emptySubtext}>Crea promociones, lugares y recibe reservaciones para ver estadísticas</Text>
          </View>
        )}
        
        <Text style={styles.note}>* Las estadísticas se actualizan en tiempo real.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAF7' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAF7' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0984A3', marginBottom: 16 },
  metricsBox: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 18, width: '100%' },
  metric: { color: '#444', fontSize: 18, textAlign: 'left', marginBottom: 6 },
  metricValue: { color: '#2E5006', fontWeight: 'bold' },
  sectionTitle: { color: '#0984A3', fontWeight: 'bold', fontSize: 16, marginBottom: 10, marginTop: 8, alignSelf: 'flex-start' },
  chartContainer: { width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 18 },
  barItem: { marginBottom: 12 },
  barLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barText: { fontWeight: 'bold', color: '#0984A3', fontSize: 14 },
  barValue: { color: '#2E5006', fontWeight: 'bold', fontSize: 14 },
  barContainer: { height: 20, backgroundColor: '#f0f0f0', borderRadius: 10, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 10 },
  topLugar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 6, elevation: 1 },
  topLugarName: { fontWeight: 'bold', color: '#0984A3', fontSize: 15 },
  topLugarValue: { color: '#2E5006', fontWeight: 'bold', fontSize: 15 },
  emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 14, width: '100%', marginBottom: 18 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
  note: { color: '#888', fontSize: 13, marginTop: 18, textAlign: 'center' },
}); 