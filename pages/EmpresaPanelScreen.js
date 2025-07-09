import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions, ActivityIndicator, SafeAreaView, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlaces, updatePlace, deletePlace } from './api';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Image, Linking } from 'react-native';

const { width } = Dimensions.get('window');

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dbai58ub1/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';
async function uploadToCloudinary(uri) {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  data.append('api_key', '641663797225355');
  data.append('timestamp', Math.floor(Date.now() / 1000));
  const res = await axios.post(CLOUDINARY_URL, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.secure_url;
}

export default function EmpresaPanelScreen({ navigation }) {
  const [lugares, setLugares] = useState([]);
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', dept: '', img: '', descripcion: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [servicioInput, setServicioInput] = useState('');

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
    setEditForm({
      nombre: lugar.nombre,
      dept: lugar.dept,
      img: lugar.img,
      galeria: lugar.galeria || [],
      ubicacion: lugar.ubicacion || '',
      horario: lugar.horario || '',
      precio: lugar.precio || '',
      servicios: lugar.servicios || [],
      descripcion: lugar.descripcion || ''
    });
    setEditId(lugar._id);
    setShowEdit(true);
  };
  // Imagen principal
  const pickMainImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      try {
        const url = await uploadToCloudinary(result.assets[0].uri);
        setEditForm(f => ({ ...f, img: url }));
      } catch (e) {
        Alert.alert('Error', 'No se pudo subir la imagen');
      }
      setUploading(false);
    }
  };
  // Galería
  const pickGalleryImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      try {
        const url = await uploadToCloudinary(result.assets[0].uri);
        setEditForm(f => ({ ...f, galeria: [...(f.galeria || []), url] }));
      } catch (e) {
        Alert.alert('Error', 'No se pudo subir la imagen');
      }
      setUploading(false);
    }
  };
  const handleRemoveGaleria = (idx) => {
    setEditForm(f => ({ ...f, galeria: (f.galeria || []).filter((_, i) => i !== idx) }));
  };

  const handleAddServicio = () => {
    if (servicioInput.trim()) {
      setEditForm(f => ({ ...f, servicios: [...(f.servicios || []), servicioInput.trim()] }));
      setServicioInput('');
    }
  };
  const handleRemoveServicio = (idx) => {
    setEditForm(f => ({ ...f, servicios: (f.servicios || []).filter((_, i) => i !== idx) }));
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
      <FlatList
        data={lugares}
        keyExtractor={item => item._id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Mis Lugares Turísticos</Text>
            {showEdit && (
              <View style={styles.editBox}>
                <Text style={styles.sectionTitle}>Editar lugar</Text>
                <TextInput style={styles.input} placeholder="Nombre*" value={editForm.nombre} onChangeText={v => setEditForm(f => ({ ...f, nombre: v }))} />
                <TextInput style={styles.input} placeholder="Departamento*" value={editForm.dept} onChangeText={v => setEditForm(f => ({ ...f, dept: v }))} />
                <TextInput style={styles.input} placeholder="Ubicación (Google Maps, dirección o link)*" value={editForm.ubicacion} onChangeText={v => setEditForm(f => ({ ...f, ubicacion: v }))} />
                {/* Botón para abrir ubicación en Google Maps */}
                {editForm.ubicacion ? (
                  <TouchableOpacity
                    style={{ marginBottom: 10, alignSelf: 'flex-start' }}
                    onPress={() => {
                      const url = editForm.ubicacion.startsWith('http')
                        ? editForm.ubicacion
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(editForm.ubicacion)}`;
                      Linking.openURL(url);
                    }}
                  >
                    <Text style={{ color: '#0984A3', textDecorationLine: 'underline' }}>Ver en Google Maps</Text>
                  </TouchableOpacity>
                ) : null}
                <TextInput style={styles.input} placeholder="Horario (ej: Lunes a Domingo, 10:00am - 10:00pm)" value={editForm.horario} onChangeText={v => setEditForm(f => ({ ...f, horario: v }))} />
                <TextInput style={styles.input} placeholder="Precio (ej: Entrada gratuita, atracciones desde $1)" value={editForm.precio} onChangeText={v => setEditForm(f => ({ ...f, precio: v }))} />
                {/* Servicios */}
                <View style={{ width: '100%', marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', color: '#0984A3', marginBottom: 4 }}>Servicios</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Agregar servicio" value={servicioInput} onChangeText={setServicioInput} />
                    <TouchableOpacity style={[styles.button, { marginLeft: 6, paddingHorizontal: 12, paddingVertical: 10 }]} onPress={handleAddServicio}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
                  </View>
                  {Array.isArray(editForm.servicios) && editForm.servicios.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                      {editForm.servicios.map((serv, idx) => (
                        <View key={idx} style={{ backgroundColor: '#eee', borderRadius: 8, padding: 6, marginRight: 6, marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ color: '#444' }}>{serv}</Text>
                          <TouchableOpacity onPress={() => handleRemoveServicio(idx)}><Text style={{ color: '#E74C3C', marginLeft: 4 }}>x</Text></TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                {/* Imagen principal */}
                <View style={{ width: '100%', marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', color: '#0984A3', marginBottom: 4 }}>Imagen principal</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="URL de imagen principal" value={editForm.img} onChangeText={v => setEditForm(f => ({ ...f, img: v }))} />
                    <TouchableOpacity style={[styles.button, { marginLeft: 6, paddingHorizontal: 12, paddingVertical: 10 }]} onPress={pickMainImage}>
                      <Text style={styles.buttonText}>Galería</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Vista previa imagen principal */}
                  {editForm.img ? (
                    <Image source={{ uri: editForm.img }} style={{ width: 120, height: 80, borderRadius: 8, marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#eee' }} />
                  ) : null}
                </View>
                {/* Galería de fotos */}
                <View style={{ width: '100%', marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', color: '#0984A3', marginBottom: 4 }}>Galería de fotos</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={[styles.button, { marginRight: 6, paddingHorizontal: 12, paddingVertical: 10 }]} onPress={pickGalleryImage}>
                      <Text style={styles.buttonText}>+ Galería</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Vista previa galería */}
                  {Array.isArray(editForm.galeria) && editForm.galeria.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6, maxHeight: 90 }}>
                      {editForm.galeria.map((url, idx) => (
                        <View key={idx} style={{ backgroundColor: '#eee', borderRadius: 8, padding: 2, marginRight: 8, alignItems: 'center', flexDirection: 'row' }}>
                          <Image source={{ uri: url }} style={{ width: 80, height: 60, borderRadius: 6 }} />
                          <TouchableOpacity onPress={() => handleRemoveGaleria(idx)} style={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#fff', borderRadius: 10, padding: 2 }}>
                            <Text style={{ color: '#E74C3C', fontWeight: 'bold' }}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
                {uploading && <ActivityIndicator size="large" color="#0984A3" style={{ marginBottom: 10 }} />}
                <TextInput style={styles.input} placeholder="Descripción" value={editForm.descripcion} onChangeText={v => setEditForm(f => ({ ...f, descripcion: v }))} multiline numberOfLines={3} />
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
            {isLoading && <ActivityIndicator size="large" color="#0984A3" style={{ marginTop: 30 }} />}
          </>
        }
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
        contentContainerStyle={{ padding: 18, paddingBottom: 60, paddingTop: 48, paddingRight: 0, paddingLeft: 0 }}
        style={{ flex: 1 }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CrearLugar')}>
        <Text style={styles.fabText}>+ Crear Lugar</Text>
      </TouchableOpacity>
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