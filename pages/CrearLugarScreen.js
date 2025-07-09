import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, FlatList, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Linking } from 'react-native';
import { createPlace } from './api';
import { UserContext } from './UserContext';

const DEPARTAMENTOS = [
  'Cortés', 'Atlántida', 'Colón', 'Yoro', 'Santa Bárbara', 'Copán', 'Ocotepeque', 'Lempira', 'Intibucá',
  'La Paz', 'Valle', 'Choluteca', 'El Paraíso', 'Francisco Morazán', 'Gracias a Dios', 'Islas de la Bahía', 'Olancho'
];

export default function CrearLugarScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [imagenes, setImagenes] = useState([]); // [{uri, urlCloudinary}]
  const [horarios, setHorarios] = useState([{ dia: '', horaApertura: '', horaCierre: '' }]);
  const [precio, setPrecio] = useState('');
  const [servicios, setServicios] = useState(['']);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  // Cloudinary config (ajusta con tus datos)
  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/<tu_cloud_name>/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = '<tu_upload_preset>';

  const pickImages = async () => {
    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permiso galería:', permissionResult);
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: Platform.OS === 'ios',
        quality: 0.7,
      });
      console.log('Resultado picker:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (Platform.OS === 'ios') {
          setImagenes([...imagenes, ...result.assets.map(a => ({ uri: a.uri }))]);
        } else {
          setImagenes([...imagenes, { uri: result.assets[0].uri }]);
        }
      } else if (result.canceled) {
        console.log('Picker cancelado por el usuario');
      } else {
        Alert.alert('Error', 'No se seleccionaron imágenes.');
      }
    } catch (e) {
      console.log('Error en pickImages:', e);
      Alert.alert('Error', 'Ocurrió un problema al abrir la galería: ' + (e?.message || e));
    }
  };

  const removeImage = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const handleHorarioChange = (index, field, value) => {
    const nuevos = [...horarios];
    nuevos[index][field] = value;
    setHorarios(nuevos);
  };
  const addHorario = () => setHorarios([...horarios, { dia: '', horaApertura: '', horaCierre: '' }]);
  const removeHorario = (index) => setHorarios(horarios.filter((_, i) => i !== index));

  const handleServicioChange = (index, value) => {
    const nuevos = [...servicios];
    nuevos[index] = value;
    setServicios(nuevos);
  };
  const addServicio = () => setServicios([...servicios, '']);
  const removeServicio = (index) => setServicios(servicios.filter((_, i) => i !== index));

  const handleUbicacion = () => {
    if (ubicacion) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Ubicación', 'Por favor ingresa una dirección o coordenada.');
    }
  };

  const subirImagenACloudinary = async (imagen) => {
    const data = new FormData();
    data.append('file', { uri: imagen.uri, type: 'image/jpeg', name: 'foto.jpg' });
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await axios.post(CLOUDINARY_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.secure_url;
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la imagen.');
      return null;
    }
  };

  const handleGuardar = async () => {
    if (!nombre || !descripcion || !departamento || !ubicacion || !precio) {
      Alert.alert('Campos requeridos', 'Completa todos los campos obligatorios.');
      return;
    }
    if (!user || !user.id) {
      Alert.alert('Error', 'No se encontró el usuario autenticado.');
      return;
    }
    setLoading(true);
    try {
      // Subir imágenes a Cloudinary (ya implementado)
      const urls = await Promise.all(
        imagenes.map(async (img) => {
          if (img.uri && !img.uri.startsWith('http')) {
            const data = new FormData();
            data.append('file', { uri: img.uri, name: 'image.jpg', type: 'image/jpeg' });
            data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const res = await axios.post(CLOUDINARY_URL, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            return res.data.secure_url;
          } else {
            return img.uri;
          }
        })
      );
      // --- CORRECCIÓN DE CAMPOS ---
      const data = {
        nombre,
        dept: departamento,
        descripcion,
        galeria: urls,
        img: urls[0] || '',
        ubicacion,
        horario: horarios.join(', '),
        precio,
        servicios,
      };
      console.log('Datos enviados a createPlace:', data, user.id);
      const res = await createPlace(data, user.id);
      console.log('Respuesta createPlace:', res);
      setLoading(false);
      if (res && res._id) {
        Alert.alert('¡Éxito!', 'Lugar creado correctamente.');
        navigation.goBack();
      } else {
        Alert.alert('Error', res?.error || 'No se pudo crear el lugar.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Ocurrió un error al crear el lugar.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>Crear Lugar</Text>
      {/* Nombre */}
      <View style={styles.card}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre del lugar" />
      </View>
      {/* Descripción */}
      <View style={styles.card}>
        <Text style={styles.label}>Descripción *</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={descripcion} onChangeText={setDescripcion} placeholder="Describe el lugar" multiline />
      </View>
      {/* Departamento */}
      <View style={styles.card}>
        <Text style={styles.label}>Departamento *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
          {DEPARTAMENTOS.map(dep => (
            <TouchableOpacity key={dep} style={[styles.chip, departamento === dep && styles.chipSelected]} onPress={() => setDepartamento(dep)}>
              <Text style={{ color: departamento === dep ? '#fff' : '#333' }}>{dep}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Ubicación */}
      <View style={styles.card}>
        <Text style={styles.label}>Ubicación (Google Maps) *</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={[styles.input, { flex: 1 }]} value={ubicacion} onChangeText={setUbicacion} placeholder="Dirección o coordenada" />
          <TouchableOpacity style={styles.mapBtn} onPress={handleUbicacion}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Galería de imágenes */}
      <View style={styles.card}>
        <Text style={styles.label}>Galería de imágenes</Text>
        <FlatList
          data={imagenes}
          horizontal
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.imgPreviewBox}>
              <Image source={{ uri: item.uri || item.urlCloudinary }} style={styles.imgPreview} />
              <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(index)}>
                <Text style={{ color: '#fff' }}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity style={styles.addImgBtn} onPress={pickImages}>
              <Text style={{ color: '#333', fontSize: 32 }}>+</Text>
            </TouchableOpacity>
          }
        />
      </View>
      {/* Horarios */}
      <View style={styles.card}>
        <Text style={styles.label}>Horarios</Text>
        {horarios.map((h, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <TextInput style={[styles.input, { flex: 1 }]} value={h.dia} onChangeText={v => handleHorarioChange(i, 'dia', v)} placeholder="Día" />
            <TextInput style={[styles.input, { flex: 1 }]} value={h.horaApertura} onChangeText={v => handleHorarioChange(i, 'horaApertura', v)} placeholder="Apertura" />
            <TextInput style={[styles.input, { flex: 1 }]} value={h.horaCierre} onChangeText={v => handleHorarioChange(i, 'horaCierre', v)} placeholder="Cierre" />
            <TouchableOpacity onPress={() => removeHorario(i)} style={styles.removeBtn}><Text style={{ color: '#fff' }}>-</Text></TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addHorario} style={styles.addBtn}><Text style={{ color: '#fff' }}>Agregar horario</Text></TouchableOpacity>
      </View>
      {/* Precio */}
      <View style={styles.card}>
        <Text style={styles.label}>Precio *</Text>
        <TextInput style={styles.input} value={precio} onChangeText={setPrecio} placeholder="Precio en Lempiras" keyboardType="numeric" />
      </View>
      {/* Servicios */}
      <View style={styles.card}>
        <Text style={styles.label}>Servicios</Text>
        {servicios.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <TextInput style={[styles.input, { flex: 1 }]} value={s} onChangeText={v => handleServicioChange(i, v)} placeholder="Servicio" />
            <TouchableOpacity onPress={() => removeServicio(i)} style={styles.removeBtn}><Text style={{ color: '#fff' }}>-</Text></TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addServicio} style={styles.addBtn}><Text style={{ color: '#fff' }}>Agregar servicio</Text></TouchableOpacity>
      </View>
      {/* Guardar */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar} disabled={loading}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{loading ? 'Guardando...' : 'Guardar Lugar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f7f7f7', flex: 1, padding: 0 },
  titulo: { fontSize: 32, fontWeight: 'bold', margin: 20, marginBottom: 10, color: '#2a2a2a' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 16, elevation: 2 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 6, color: '#333' },
  input: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10, marginBottom: 0, fontSize: 15, marginRight: 8 },
  chip: { backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 4 },
  chipSelected: { backgroundColor: '#007bff' },
  mapBtn: { backgroundColor: '#007bff', padding: 10, borderRadius: 8, marginLeft: 8 },
  imgPreviewBox: { position: 'relative', marginRight: 10 },
  imgPreview: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  imgRemove: { position: 'absolute', top: 2, right: 2, backgroundColor: '#e74c3c', borderRadius: 10, padding: 2, zIndex: 2 },
  addImgBtn: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#bbb', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' },
  addBtn: { backgroundColor: '#007bff', borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 4 },
  removeBtn: { backgroundColor: '#e74c3c', borderRadius: 8, padding: 8, marginLeft: 6 },
  saveBtn: { backgroundColor: '#28a745', borderRadius: 12, padding: 16, alignItems: 'center', margin: 24, marginTop: 8, elevation: 3 },
}); 