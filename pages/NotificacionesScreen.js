import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications, deleteNotification, markNotificationAsRead } from './api';

export default function NotificacionesScreen() {
  const [notis, setNotis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      setLoading(true);
      getNotifications(user.id).then(data => {
        setNotis(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteNotification(id);
      const data = await getNotifications(user.id);
      setNotis(data);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo eliminar');
    }
    setLoading(false);
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.leida) {
      try {
        await markNotificationAsRead(notification._id);
        // Actualizar la notificación localmente
        setNotis(prevNotis => 
          prevNotis.map(n => 
            n._id === notification._id 
              ? { ...n, leida: true, fechaLeida: new Date() }
              : n
          )
        );
      } catch (e) {
        console.error('Error marcando notificación como leída:', e);
      }
    }
    
    // Aquí puedes agregar navegación específica según el tipo de notificación
    if (notification.tipo === 'promocion' && notification.datos?.promocionId) {
      // Navegar a la promoción
      // navigation.navigate('PromocionDetalle', { id: notification.datos.promocionId });
    } else if (notification.tipo === 'reservacion' && notification.datos?.reservacionId) {
      // Navegar a la reservación
      // navigation.navigate('ReservacionDetalle', { id: notification.datos.reservacionId });
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#0984A3" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF7' }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60, paddingTop: 48 }}>
        <Text style={styles.title}>Notificaciones</Text>
        <FlatList
          data={notis}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.notiCard, !item.leida && styles.unreadCard]} 
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={item.tipo === 'promocion' ? 'pricetag' : item.tipo === 'reservacion' ? 'calendar' : 'notifications'} 
                size={22} 
                color={!item.leida ? '#2E5006' : '#0984A3'} 
                style={{ marginRight: 8 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.notiTitulo, !item.leida && styles.unreadText]}>{item.titulo}</Text>
                <Text style={styles.notiMsg}>{item.mensaje}</Text>
                <Text style={styles.notiFecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                <Ionicons name="trash" size={18} color="#E17055" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#888', marginTop: 30 }}>No tienes notificaciones.</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF7', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0984A3', marginBottom: 10, textAlign: 'center' },
  notiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
  unreadCard: { 
    backgroundColor: '#E8F5E9', 
    borderLeftWidth: 4, 
    borderLeftColor: '#2E5006' 
  },
  notiTitulo: { color: '#2E5006', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  notiMsg: { color: '#0984A3', fontSize: 14 },
  notiFecha: { color: '#888', fontSize: 12, marginTop: 4 },
  unreadText: { color: '#2E5006' },
  deleteBtn: { backgroundColor: '#F8FAF7', borderRadius: 8, padding: 6, marginLeft: 8 },
}); 