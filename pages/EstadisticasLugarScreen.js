import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { getPlace, getEmpresaReservaciones, getPromotions } from './api';
import { Ionicons } from '@expo/vector-icons';

export default function EstadisticasLugarScreen({ route }) {
  const { placeId } = route.params;
  const [lugar, setLugar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getPlace(placeId);
      setLugar(data);
      // Obtener reservaciones asociadas a este lugar
      const empresaId = data.userId || data.empresaId || data.ownerId; // Ajusta según tu modelo
      let todasReservas = [];
      if (empresaId) {
        const res = await getEmpresaReservaciones(empresaId, {});
        todasReservas = (res.reservaciones || res || []).filter(r => r.placeId && (r.placeId._id === placeId || r.placeId === placeId));
      }
      setReservas(todasReservas);
      // Obtener promociones asociadas a este lugar
      if (empresaId) {
        const promosRes = await getPromotions(empresaId, {});
        const promosLugar = (promosRes.promociones || promosRes || []).filter(p => p.placeId === placeId || (p.placeId && p.placeId._id === placeId));
        setPromos(promosLugar);
      }
      setLoading(false);
    })();
  }, [placeId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0984A3" /></View>;
  if (!lugar) return <View style={styles.center}><Text>No se encontró el lugar.</Text></View>;

  // Métricas
  const totalReservas = reservas.length;
  const ingresos = reservas.reduce((acc, r) => acc + (r.precioFinal || 0), 0);
  const completadas = reservas.filter(r => r.estado === 'completada').length;
  const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
  const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
  const canceladas = reservas.filter(r => r.estado === 'cancelada').length;
  const calificaciones = reservas.map(r => r.calificacion).filter(Boolean);
  const calificacionPromedio = calificaciones.length > 0 ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(2) : 'N/A';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF7' }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, paddingTop: 80, alignItems: 'center' }}>
        <Text style={styles.title}>{lugar.nombre}</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Ionicons name="calendar" size={28} color="#0984A3" />
            <Text style={styles.metricValue}>{totalReservas}</Text>
            <Text style={styles.metricLabel}>Reservas</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="cash" size={28} color="#A3B65A" />
            <Text style={styles.metricValue}>${ingresos.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Ingresos</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="heart" size={28} color="#E17055" />
            <Text style={styles.metricValue}>{lugar.favoritos || 0}</Text>
            <Text style={styles.metricLabel}>Favoritos</Text>
            {(!lugar.favoritos || lugar.favoritos === 0) && <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Aún sin favoritos</Text>}
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="eye" size={28} color="#00B894" />
            <Text style={styles.metricValue}>{lugar.visitas || 0}</Text>
            <Text style={styles.metricLabel}>Visitas</Text>
            {(!lugar.visitas || lugar.visitas === 0) && <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Aún sin visitas</Text>}
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricCardSmall}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            <Text style={styles.metricValueSmall}>{confirmadas}</Text>
            <Text style={styles.metricLabelSmall}>Confirmadas</Text>
          </View>
          <View style={styles.metricCardSmall}>
            <Ionicons name="time" size={22} color="#FFA500" />
            <Text style={styles.metricValueSmall}>{pendientes}</Text>
            <Text style={styles.metricLabelSmall}>Pendientes</Text>
          </View>
          <View style={styles.metricCardSmall}>
            <Ionicons name="close-circle" size={22} color="#F44336" />
            <Text style={styles.metricValueSmall}>{canceladas}</Text>
            <Text style={styles.metricLabelSmall}>Canceladas</Text>
          </View>
          <View style={styles.metricCardSmall}>
            <Ionicons name="trophy" size={22} color="#2196F3" />
            <Text style={styles.metricValueSmall}>{completadas}</Text>
            <Text style={styles.metricLabelSmall}>Completadas</Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricCardSmall}>
            <Ionicons name="star" size={22} color="#FFD700" />
            <Text style={styles.metricValueSmall}>{calificacionPromedio}</Text>
            <Text style={styles.metricLabelSmall}>Calificación</Text>
          </View>
          <View style={styles.metricCardSmall}>
            <Ionicons name="pricetag" size={22} color="#9C27B0" />
            <Text style={styles.metricValueSmall}>{promos.length}</Text>
            <Text style={styles.metricLabelSmall}>Promociones</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.sectionText}>{lugar.descripcion || 'Sin descripción'}</Text>
        </View>
        {/* Espacio para gráficas futuras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráficas (próximamente)</Text>
          <View style={{ height: 80, width: '100%', backgroundColor: '#eaeaea', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888' }}>Aquí podrás ver la evolución de reservas, ingresos, etc.</Text>
          </View>
        </View>
        {/* Reviews y promociones */}
        {promos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promociones activas</Text>
            {promos.map(p => (
              <View key={p._id} style={styles.promoCard}>
                <Text style={styles.promoTitle}>{p.titulo}</Text>
                <Text style={styles.promoDesc}>{p.descripcion}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Aquí podrías agregar reviews si los tienes en el modelo */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAF7' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0984A3', marginBottom: 18, textAlign: 'center', letterSpacing: 1 },
  metricsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' },
  metricCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, margin: 8, alignItems: 'center', width: 110, elevation: 2 },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: '#0984A3', marginTop: 6 },
  metricLabel: { color: '#888', fontSize: 15, marginTop: 2 },
  metricCardSmall: { backgroundColor: '#fff', borderRadius: 12, padding: 10, margin: 6, alignItems: 'center', width: 90, elevation: 1 },
  metricValueSmall: { fontSize: 16, fontWeight: 'bold', color: '#0984A3', marginTop: 2 },
  metricLabelSmall: { color: '#888', fontSize: 13, marginTop: 1 },
  section: { width: '100%', marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E5006', marginBottom: 8 },
  sectionText: { color: '#444', fontSize: 15, marginBottom: 8 },
  promoCard: { backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12, marginBottom: 8 },
  promoTitle: { fontWeight: 'bold', color: '#0984A3', fontSize: 15 },
  promoDesc: { color: '#444', fontSize: 13 },
}); 