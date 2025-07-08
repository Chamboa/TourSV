import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser } from './api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PerfilScreen() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', img: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        setForm({ nombre: parsed.nombre || '', descripcion: parsed.descripcion || '', img: parsed.img || '' });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateUser(user.id, form);
      setUser(updated);
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      Alert.alert('Éxito', 'Perfil actualizado');
      setEditModal(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo actualizar');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#0984A3" /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAF7' }} contentContainerStyle={{ alignItems: 'center', padding: 0 }}>
      <View style={styles.headerBg} />
      <View style={styles.card}>
        <View style={styles.avatarBox}>
          <Image source={user.img ? { uri: user.img } : require('../assets/icon.png')} style={styles.avatar} />
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModal(true)}>
            <Ionicons name="create" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.nombre}</Text>
        <Text style={styles.desc}>{user.descripcion || 'Sin descripción'}</Text>
        <View style={styles.infoRow}><Ionicons name="mail" size={18} color="#0984A3" /><Text style={styles.infoText}>{user.email}</Text></View>
        <View style={styles.infoRow}><MaterialIcons name="business" size={18} color="#0984A3" /><Text style={styles.infoText}>{user.role}</Text></View>
        <View style={styles.infoRow}><Ionicons name="calendar" size={18} color="#0984A3" /><Text style={styles.infoText}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text></View>
        <TouchableOpacity style={styles.passBtn} onPress={() => Alert.alert('Función próximamente', 'Aquí podrás cambiar tu contraseña')}>
          <Ionicons name="key" size={18} color="#fff" />
          <Text style={styles.passBtnText}>Cambiar contraseña</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TextInput style={styles.input} placeholder={(user && user.role === 'empresa') ? 'Nombre de empresa' : 'Nombre'} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} />
            <TextInput style={styles.input} placeholder="Descripción" value={form.descripcion} onChangeText={v => setForm(f => ({ ...f, descripcion: v }))} />
            <TextInput style={styles.input} placeholder="Logo/Avatar (URL)" value={form.img} onChangeText={v => setForm(f => ({ ...f, img: v }))} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#A3B65A' }]} onPress={() => setEditModal(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.modalBtnText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: '#0984A3', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  card: { marginTop: 80, backgroundColor: '#fff', borderRadius: 18, padding: 24, alignItems: 'center', width: '90%', elevation: 4 },
  avatarBox: { position: 'relative', marginTop: -70, marginBottom: 10 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#fff', backgroundColor: '#eee' },
  editBtn: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#0984A3', borderRadius: 16, padding: 6, elevation: 2 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0984A3', marginTop: 8 },
  desc: { color: '#444', fontSize: 16, marginBottom: 10, textAlign: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  infoText: { marginLeft: 8, color: '#2E5006', fontSize: 15 },
  passBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0984A3', borderRadius: 8, padding: 10, marginTop: 18 },
  passBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 22, width: '85%', elevation: 6 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0984A3', marginBottom: 14, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#F8FAF7', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#A3B65A', color: '#222' },
  modalBtn: { flex: 1, backgroundColor: '#0984A3', padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d63031',
    borderRadius: 8,
    padding: 12,
    marginTop: 30,
    marginBottom: 40,
    width: 180,
    justifyContent: 'center',
    alignSelf: 'center',
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});