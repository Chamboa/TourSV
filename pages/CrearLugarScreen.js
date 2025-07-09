import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPlace } from './api';

export default function CrearLugarScreen({ navigation }) {
  const [form, setForm] = useState({ nombre: '', dept: '', img: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.nombre || !form.dept) return Alert.alert('Completa los campos obligatorios');
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) throw new Error('No autenticado');
      const nuevo = await createPlace(form, user.id);
      setForm({ nombre: '', dept: '', img: '', descripcion: '' });
      Alert.alert('Éxito', 'Lugar creado correctamente');
      navigation.navigate('Lugares');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el lugar');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAF7' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 70, paddingTop: 56, alignItems: 'center' }}>
        <Text style={styles.title}>Crear Nuevo Lugar</Text>
        <TextInput style={styles.input} placeholder="Nombre*" value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} />
        <TextInput style={styles.input} placeholder="Departamento*" value={form.dept} onChangeText={v => setForm(f => ({ ...f, dept: v }))} />
        <TextInput style={styles.input} placeholder="Imagen (URL)" value={form.img} onChangeText={v => setForm(f => ({ ...f, img: v }))} />
        <TextInput style={styles.input} placeholder="Descripción" value={form.descripcion} onChangeText={v => setForm(f => ({ ...f, descripcion: v }))} />
        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAF7', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0984A3', marginBottom: 16 },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#A3B65A', color: '#222' },
  button: { backgroundColor: '#0984A3', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 6, width: '100%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
}); 