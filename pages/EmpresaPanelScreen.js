import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions, ActivityIndicator, SafeAreaView, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlaces, updatePlace, deletePlace } from './api';

const { width } = Dimensions.get('window');

export default function EmpresaPanelScreen({ navigation }) {
  const [lugares, setLugares] = useState([]);
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', dept: '', img: '', descripcion: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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

  if (!user || user.role !== 'empresa') {
    return <View style={styles.container}><Text style={styles.title}>No autorizado</Text></View>;
  }

  const handleEdit = (lugar) => {
    setEditForm({ nombre: lugar.nombre, dept: lugar.dept, img: lugar.img, descripcion: lugar.descripcion });
    setEditId(lugar._id);
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!editForm.nombre || !editForm.dept) return Alert.alert('Completa los campos obligatorios');
    setIsLoading(true);
    try {
      const updated = await updatePlace(editId, editForm, user.id);
      setLugares(lugares.map(l => l._id === editId ? updated : l));
      setEditId(null);
      setShowEdit(false);
      setEditForm({ nombre: '', dept: '', img: '', descripcion: '' });
      Alert.alert('Éxito', 'Lugar actualizado');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo actualizar');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    await deletePlace(id, user.id);
    setLugares(lugares.filter(l => l._id !== id));
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF7' }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60, paddingTop: 48 }}>
        <Text style={styles.title}>Mis Lugares Turísticos</Text>
        {showEdit && (
          <View style={styles.editBox}>
            <Text style={styles.sectionTitle}>Editar lugar</Text>
            <TextInput style={styles.input} placeholder="Nombre*" value={editForm.nombre} onChangeText={v => setEditForm(f => ({ ...f, nombre: v }))} />
            <TextInput style={styles.input} placeholder="Departamento*" value={editForm.dept} onChangeText={v => setEditForm(f => ({ ...f, dept: v }))} />
            <TextInput style={styles.input} placeholder="Imagen (URL)" value={editForm.img} onChangeText={v => setEditForm(f => ({ ...f, img: v }))} />
            <TextInput style={styles.input} placeholder="Descripción" value={editForm.descripcion} onChangeText={v => setEditForm(f => ({ ...f, descripcion: v }))} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={isLoading}>
                <Text style={styles.buttonText}>Actualizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#888' }]} onPress={() => { setShowEdit(false); setEditId(null); }}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0984A3" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={lugares}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardDept}>{item.dept}</Text>
                <Text style={styles.cardDesc}>{item.descripcion}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity style={styles.cardBtn} onPress={() => handleEdit(item)}><Text>Editar</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.cardBtn, { backgroundColor: '#E74C3C' }]} onPress={() => handleDelete(item._id)}><Text style={{ color: '#fff' }}>Eliminar</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.cardBtn, { backgroundColor: '#2E5006' }]} onPress={() => navigation.navigate('EstadisticasLugar', { placeId: item._id })}>
                    <Text style={{ color: '#fff' }}>Estadísticas</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>No hay lugares aún.</Text>}
            refreshing={isLoading}
            onRefresh={() => user && (getPlaces(user.id).then(data => setLugares(data)))}
            style={{ marginBottom: 40 }}
          />
        )}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CrearLugar')}>
          <Text style={styles.fabText}>+ Crear Lugar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAF7', padding: 18 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 18, color: '#0984A3', textAlign: 'center', letterSpacing: 1 },
  sectionTitle: { color: '#0984A3', fontWeight: 'bold', fontSize: 16, marginBottom: 10, marginTop: 8 },
  editBox: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 18, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#A3B65A', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#F8FAF7' },
  button: { backgroundColor: '#0984A3', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 6, width: '48%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14, elevation: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 17, color: '#2E5006' },
  cardDept: { color: '#0984A3', marginBottom: 4, fontWeight: 'bold' },
  cardDesc: { color: '#444', marginBottom: 6 },
  cardBtn: { backgroundColor: '#A3B65A', padding: 8, borderRadius: 6, marginRight: 8 },
  fab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#0984A3', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 22, elevation: 4 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
}); 