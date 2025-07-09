import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlaces } from './api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


const { width } = Dimensions.get('window');

export default function EmpresaDashboardScreen({ navigation }) {
  const [lugares, setLugares] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    if (user && user.role === 'empresa') {
      setIsLoading(true);
      getPlaces(user.id).then(data => {
        setLugares(data);
        setIsLoading(false);
      });
    }
  }, [user]);

  // Simulación de métricas
  const totalFavoritos = lugares.reduce((acc, l) => acc + (l.favoritos || 0), 0);
  const totalVisitas = lugares.reduce((acc, l) => acc + (l.visitas || 0), 0);
  const totalPromos = 2; // Simulado
  const totalNotis = 3; // Simulado

  // Configuración de métricas
  const metricCards = [
    {
      key: 'lugares',
      icon: <Ionicons name="business" size={32} color="#0984A3" />,
      value: lugares.length,
      label: 'Lugares',
    },
    {
      key: 'favoritos',
      icon: <Ionicons name="heart" size={32} color="#E17055" />,
      value: totalFavoritos,
      label: 'Favoritos',
    },
    {
      key: 'visitas',
      icon: <Ionicons name="eye" size={32} color="#00B894" />,
      value: totalVisitas,
      label: 'Visitas',
    },
    {
      key: 'promos',
      icon: <Ionicons name="pricetags" size={32} color="#A3B65A" />,
      value: totalPromos,
      label: 'Promociones',
      onPress: () => navigation.navigate('Promociones'),
    },
  ];

  // Configuración de accesos rápidos
  const quickActions = [
    {
      key: 'lugares',
      icon: <MaterialIcons name="place" size={24} color="#0984A3" />,
      label: 'Lugares',
      onPress: () => navigation.navigate('Lugares'),
    },
    {
      key: 'crear',
      icon: <Ionicons name="add-circle" size={24} color="#0984A3" />,
      label: 'Crear Lugar',
      onPress: () => navigation.navigate('CrearLugar'),
    },
    {
      key: 'estadisticas',
      icon: <Ionicons name="stats-chart" size={24} color="#0984A3" />,
      label: 'Estadísticas',
      onPress: () => navigation.navigate('Estadisticas'),
    },
  ];

  if (isLoading) return <View style={styles.container}><ActivityIndicator size="large" color="#0984A3" /></View>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Empresa</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ alignItems: 'center', padding: 18 }}>
        <Text style={styles.title}>Panel de Empresa</Text>
        {/* Métricas */}
        <View style={styles.cardsRowWrap}>
          {metricCards.map(card => (
            <TouchableOpacity
              key={card.key}
              style={styles.card}
              onPress={card.onPress}
              activeOpacity={card.onPress ? 0.7 : 1}
            >
              {card.icon}
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Notificaciones */}
        <TouchableOpacity style={styles.notifCard} onPress={() => navigation.navigate('Notificaciones')}>
          <Ionicons name="notifications" size={28} color="#fff" />
          <Text style={styles.notifText}>Tienes {totalNotis} notificaciones nuevas</Text>
        </TouchableOpacity>
        {/* Accesos rápidos */}
        <View style={styles.quickRow}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickBtn}
              onPress={action.onPress}
            >
              {action.icon}
              <Text style={styles.quickText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAF7' },
  container: { flex: 1, backgroundColor: '#F8FAF7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0984A3', marginBottom: 18, textAlign: 'center', letterSpacing: 1 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', marginHorizontal: 6, elevation: 2 },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#0984A3', marginTop: 6 },
  cardLabel: { color: '#888', fontSize: 15, marginTop: 2 },
  notifCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0984A3', borderRadius: 12, padding: 14, marginTop: 10, marginBottom: 18, width: '100%' },
  notifText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 15 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  quickBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', marginHorizontal: 4, elevation: 1 },
  quickText: { color: '#0984A3', fontWeight: 'bold', fontSize: 14, marginTop: 4 },
  cardsRowWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginBottom: 12 },
}); 