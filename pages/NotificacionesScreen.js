import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications, deleteNotification } from './api';

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

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#0984A3" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>
      <FlatList
        data={notis}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.notiCard}>
            <Ionicons name="notifications" size={22} color="#0984A3" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.notiMsg}>{item.mensaje}</Text>
              <Text style={styles.notiFecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
              <Ionicons name="trash" size={18} color="#E17055" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', marginTop: 30 }}>No tienes notificaciones.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF7', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0984A3', marginBottom: 10, textAlign: 'center' },
  notiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
  notiMsg: { color: '#0984A3', fontWeight: 'bold', fontSize: 15 },
  notiFecha: { color: '#888', fontSize: 13 },
  deleteBtn: { backgroundColor: '#F8FAF7', borderRadius: 8, padding: 6, marginLeft: 8 },
}); 