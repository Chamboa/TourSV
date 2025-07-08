import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlaces, deletePlace, getEvents, deleteEvent } from './api';

const { width } = Dimensions.get('window');

const fetchUsers = async (userId) => {
  const res = await fetch('http://192.168.0.34:4000/api/users', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return res.json();
};
const updateUserRole = async (id, role, userId) => {
  const res = await fetch(`http://192.168.0.34:4000/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, userId })
  });
  return res.json();
};
const deleteUser = async (id, userId) => {
  const res = await fetch(`http://192.168.0.34:4000/api/users/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return res.json();
};

export default function AdminPanelScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsLoading(true);
      fetchUsers(user.id).then(setUsers);
      getPlaces().then(setLugares);
      getEvents(user.id).then(setEventos);
      setIsLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <View style={styles.container}><Text style={styles.title}>No autorizado</Text></View>;
  }

  const handleDeleteUser = async (id) => {
    setIsLoading(true);
    await deleteUser(id, user.id);
    setUsers(users.filter(u => u._id !== id));
    setIsLoading(false);
  };
  const handleChangeRole = async (id, role) => {
    setIsLoading(true);
    await updateUserRole(id, role, user.id);
    setUsers(users.map(u => u._id === id ? { ...u, role } : u));
    setIsLoading(false);
  };
  const handleDeletePlace = async (id) => {
    setIsLoading(true);
    await deletePlace(id, user.id);
    setLugares(lugares.filter(l => l._id !== id));
    setIsLoading(false);
  };
  const handleDeleteEvent = async (id) => {
    setIsLoading(true);
    await deleteEvent(id);
    setEventos(eventos.filter(e => e._id !== id));
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administrador</Text>
      <Text style={styles.sectionTitle}>Usuarios</Text>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name} ({item.email})</Text>
            <Text style={styles.cardDept}>Rol: {item.role}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              {['user', 'empresa', 'admin'].map(r => (
                <TouchableOpacity key={r} style={[styles.cardBtn, { backgroundColor: item.role === r ? '#2E5006' : '#A3B65A' }]} onPress={() => handleChangeRole(item._id, r)}><Text style={{ color: '#fff' }}>{r}</Text></TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.cardBtn, { backgroundColor: '#E74C3C' }]} onPress={() => handleDeleteUser(item._id)}><Text style={{ color: '#fff' }}>Eliminar</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>No hay usuarios.</Text>}
      />
      <Text style={styles.sectionTitle}>Lugares</Text>
      <FlatList
        data={lugares}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardDept}>{item.dept}</Text>
            <TouchableOpacity style={[styles.cardBtn, { backgroundColor: '#E74C3C', marginTop: 8 }]} onPress={() => handleDeletePlace(item._id)}><Text style={{ color: '#fff' }}>Eliminar</Text></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>No hay lugares.</Text>}
      />
      <Text style={styles.sectionTitle}>Eventos</Text>
      <FlatList
        data={eventos}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDept}>{new Date(item.date).toLocaleDateString()}</Text>
            <TouchableOpacity style={[styles.cardBtn, { backgroundColor: '#E74C3C', marginTop: 8 }]} onPress={() => handleDeleteEvent(item._id)}><Text style={{ color: '#fff' }}>Eliminar</Text></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>No hay eventos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#2E5006', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8, color: '#0984A3' },
  card: { backgroundColor: '#F3F3F3', borderRadius: 10, padding: 12, marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardDept: { color: '#0984A3', marginBottom: 4 },
  cardBtn: { backgroundColor: '#A3B65A', padding: 8, borderRadius: 6, marginRight: 8 },
}); 