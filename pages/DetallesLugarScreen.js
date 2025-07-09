import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, Alert, Linking, TextInput, Modal, Animated } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFavoritos } from './FavoritosContext';
import { getPlace, addReview, addPlaceView } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Datos de ejemplo, en la app real vendrían por props o navigation params
const ejemplo = {
  nombre: 'Sunset Park',
  dept: 'La Libertad',
  img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/3e/2e/7b/sunset-park.jpg?w=700&h=-1&s=1',
  galeria: [
    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/3e/2e/7b/sunset-park.jpg?w=700&h=-1&s=1',
    'https://www.elsalvador.travel/wp-content/uploads/2020/01/Malecon-La-Libertad-1.jpg',
    'https://www.elsalvador.travel/wp-content/uploads/2020/01/El-Tunco-1.jpg',
  ],
  rating: 5.0,
  descripcion: 'Un parque de diversiones frente al mar con atracciones para toda la familia, ubicado en el malecón de La Libertad.',
  ubicacion: 'Malecón, La Libertad',
  horario: 'Lunes a Domingo, 10:00am - 10:00pm',
  precio: 'Entrada gratuita, atracciones desde $1',
  servicios: ['Estacionamiento', 'Baños', 'Restaurantes', 'Acceso silla de ruedas', 'Seguridad'],
  contacto: '+503 2222-3333',
  web: 'https://www.sunsetpark.com.sv',
  clima: 'Soleado, 29°C',
  reseñas: [
    { usuario: 'Andrea', texto: '¡Hermoso lugar para ir en familia!', rating: 5 },
    { usuario: 'Carlos', texto: 'Muy limpio y seguro.', rating: 4.5 },
    { usuario: 'María', texto: 'Las atracciones son geniales.', rating: 5 },
  ],
  recomendaciones: [
    { nombre: 'Playa El Tunco', img: 'https://www.elsalvador.travel/wp-content/uploads/2020/01/El-Tunco-1.jpg' },
    { nombre: 'Malecon La Libertad', img: 'https://www.elsalvador.travel/wp-content/uploads/2020/01/Malecon-La-Libertad-1.jpg' },
  ],
};

const DetallesLugarScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const lugarId = route.params && route.params.lugar && route.params.lugar._id;
  const [lugar, setLugar] = useState(route.params && route.params.lugar ? route.params.lugar : ejemplo);
  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritos();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Estado local para reseñas
  const [reseñas, setReseñas] = useState(lugar.reseñas || []);
  const [nombre, setNombre] = useState('');
  const [comentario, setComentario] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalAnim] = useState(new Animated.Value(0));
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (lugarId) {
      getPlace(lugarId).then(setLugar);
      addPlaceView(lugarId); // Registrar la vista
    }
  }, [lugarId]);

  useEffect(() => {
    // Obtener usuario logueado solo una vez al montar
    (async () => {
      const u = await AsyncStorage.getItem('user');
      console.log('Valor crudo de AsyncStorage user:', u);
      if (u) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        console.log('Usuario parseado:', parsed);
      } else {
        setUser(null);
        console.log('No se encontró usuario en AsyncStorage');
      }
      setUserLoading(false);
    })();
  }, []);

  const handleAgregarReseña = async () => {
    if (!user || !(user.name || user.nombre)) {
      setError('No se pudo obtener tu usuario.');
      return;
    }
    if (!comentario.trim()) {
      setError('Completa el comentario.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }
    try {
      const updated = await addReview(lugar._id, { usuario: user.name || user.nombre, texto: comentario.trim(), rating });
      setLugar(updated);
      setReseñas(updated.reseñas);
      setComentario('');
      setRating(0);
      setError('');
    } catch {
      setError('No se pudo agregar la reseña');
    }
  };

  const handleComoLlegar = () => {
    if (lugar.ubicacion && lugar.ubicacion.trim() !== '') {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar.ubicacion)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir Google Maps.');
      });
    } else {
      Alert.alert('Ubicación no disponible', 'Este lugar no tiene una ubicación registrada.');
    }
  };

  // Calcular rating promedio de reseñas
  const ratingPromedio = (Array.isArray(lugar.reseñas) && lugar.reseñas.length > 0)
    ? (lugar.reseñas.reduce((acc, r) => acc + (r.rating || 0), 0) / lugar.reseñas.length).toFixed(1)
    : '0';

  const openReviewModal = () => {
    setShowReviewModal(true);
    setError('');
    setSuccessMsg('');
    setComentario('');
    setRating(0);
    Animated.timing(modalAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const closeReviewModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowReviewModal(false));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Imagen principal */}
        <View style={styles.imgBox}>
          <Image source={lugar.img ? { uri: lugar.img } : require('../assets/icon.png')} style={styles.img} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={width * 0.08} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartBtn} onPress={() => esFavorito(lugar) ? quitarFavorito(lugar) : agregarFavorito(lugar)}>
            <Ionicons name={esFavorito(lugar) ? 'heart' : 'heart-outline'} size={width * 0.08} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Galería */}
        {Array.isArray(lugar.galeria) && lugar.galeria.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll} contentContainerStyle={{ paddingHorizontal: width * 0.04 }}>
            {lugar.galeria.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.galleryImg} />
            ))}
          </ScrollView>
        ) : null}
        {/* Info principal */}
        <View style={styles.infoBox}>
          <View style={styles.rowWrap}>
            <Text style={styles.dept}>{lugar.dept || 'Departamento no disponible'}</Text>
          </View>
          <Text style={styles.title}>{lugar.nombre || 'Sin nombre'}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={width * 0.05} color="#FFC700" />
            <Text style={styles.rating}>{ratingPromedio}</Text>
          </View>
          <Text style={styles.descripcion}>{lugar.descripcion || 'Sin descripción'}</Text>
          {/* Fechas de publicación y actualización */}
          {lugar.createdAt && (
            <Text style={{ color: '#888', fontSize: 13, marginBottom: 2 }}>
              Publicado el {new Date(lugar.createdAt).toLocaleDateString()}
            </Text>
          )}
          {lugar.updatedAt && lugar.updatedAt !== lugar.createdAt && (
            <Text style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
              Actualizado el {new Date(lugar.updatedAt).toLocaleDateString()}
            </Text>
          )}
          <View style={styles.section}>
            <Feather name="clock" size={width * 0.055} color="#0984A3" style={{ marginRight: 8 }} />
            <Text style={styles.sectionText}>{lugar.horario || 'Horario no disponible'}</Text>
          </View>
          <View style={styles.section}>
            <Feather name="dollar-sign" size={width * 0.055} color="#0984A3" style={{ marginRight: 8 }} />
            <Text style={styles.sectionText}>{lugar.precio || 'Precio no disponible'}</Text>
          </View>
          {/* Servicios/Amenidades */}
          <View style={styles.serviciosBox}>
            <Text style={styles.serviciosTitle}>Servicios</Text>
            <View style={styles.serviciosList}>
              {Array.isArray(lugar.servicios) && lugar.servicios.length > 0 ? (
                lugar.servicios.map((serv, idx) => (
                  <View key={idx} style={styles.servicioChip}>
                    <Feather name="check" size={width*0.045} color="#0984A3" style={{ marginRight: 4 }} />
                    <Text style={styles.servicioText}>{serv}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#888', fontSize: 13 }}>Sin servicios registrados</Text>
              )}
            </View>
          </View>
          {/* Botones de acción */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1, marginRight: 8 }]} onPress={handleComoLlegar}>
              <Feather name="navigation" size={width*0.06} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Cómo llegar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { flex: 1, backgroundColor: '#4CAF50' }]} 
              onPress={() => navigation.navigate('CrearReservacion', { lugar })}
            >
              <Feather name="calendar" size={width*0.06} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Reservar</Text>
            </TouchableOpacity>
          </View>
          {/* Reseñas */}
          <View style={styles.reviewsBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={styles.reviewsTitle}>Reseñas</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={openReviewModal}>
                <Feather name="plus" size={width*0.05} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>Agregar reseña</Text>
              </TouchableOpacity>
            </View>
            {/* Lista de reseñas */}
            {Array.isArray(reseñas) && reseñas.length > 0 ? (
              reseñas.map((r, idx) => (
                <View key={idx} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Ionicons name="person-circle" size={width*0.07} color="#0984A3" style={{ marginRight: 6 }} />
                    <Text style={styles.reviewUser}>{r.usuario}</Text>
                    <MaterialIcons name="star" size={width*0.04} color="#FFC700" style={{ marginLeft: 8, marginRight: 2 }} />
                    <Text style={styles.reviewRating}>{r.rating}</Text>
                  </View>
                  <Text style={styles.reviewText}>{r.texto}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }}>Sin reseñas aún.</Text>
            )}
          </View>
          {/* Modal para agregar reseña */}
          <Modal
            visible={showReviewModal}
            animationType="none"
            transparent
            onRequestClose={closeReviewModal}
          >
            <Animated.View style={[styles.modalBg, { opacity: modalAnim }] }>
              <Animated.View style={[styles.modalCard, { transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }] }>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={closeReviewModal}>
                  <Ionicons name="close" size={28} color="#0984A3" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Agregar reseña</Text>
                {userLoading ? (
                  <Text style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginBottom: 10 }}>Cargando usuario...</Text>
                ) : !user ? (
                  <Text style={{ color: '#E74C3C', fontStyle: 'italic', textAlign: 'center', marginBottom: 10 }}>No se pudo obtener tu usuario. Inicia sesión nuevamente.</Text>
                ) : (
                  <>
                    <View style={{ alignItems: 'center', marginBottom: 10 }}>
                      <Image source={require('../assets/icon.png')} style={{ width: 54, height: 54, borderRadius: 27, marginBottom: 4, backgroundColor: '#eee' }} />
                      <Text style={{ color: '#0984A3', fontWeight: 'bold', fontSize: 16 }}>{user.name || user.nombre}</Text>
                    </View>
                    <TextInput
                      style={[styles.input, { marginBottom: 10, minHeight: 60, textAlignVertical: 'top', fontSize: 16 }]}
                      placeholder="¿Qué te pareció este lugar?"
                      value={comentario}
                      onChangeText={setComentario}
                      maxLength={200}
                      multiline
                    />
                    {/* Selector de estrellas */}
                    <View style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'center', alignSelf: 'center' }}>
                      {[1,2,3,4,5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                          <MaterialIcons
                            name={star <= rating ? 'star' : 'star-border'}
                            size={width*0.08}
                            color={star <= rating ? '#FFC700' : '#CCC'}
                            style={{ marginRight: 3 }}
                          />
                        </TouchableOpacity>
                      ))}
                      <Text style={{ marginLeft: 10, color: '#888', fontSize: width*0.045 }}>{rating > 0 ? rating + ' / 5' : ''}</Text>
                    </View>
                    {error ? <Text style={{ color: '#E74C3C', fontSize: 14, marginBottom: 6, textAlign: 'center' }}>{error}</Text> : null}
                    {successMsg ? <Text style={{ color: '#27ae60', fontSize: 15, marginBottom: 6, textAlign: 'center' }}>{successMsg}</Text> : null}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#888', flex: 1, marginRight: 8 }]} onPress={closeReviewModal}>
                        <Text style={styles.actionBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { flex: 1, opacity: userLoading || !user ? 0.5 : 1 }]}
                        onPress={async () => {
                          await handleAgregarReseña();
                          if (!error) {
                            setSuccessMsg('¡Reseña publicada!');
                            setTimeout(() => { setSuccessMsg(''); closeReviewModal(); }, 900);
                          }
                        }}
                        disabled={userLoading || !user}
                      >
                        <Text style={styles.actionBtnText}>Publicar</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Animated.View>
            </Animated.View>
          </Modal>
          {/* Recomendaciones cercanas */}
          <View style={styles.recomBox}>
            <Text style={styles.recomTitle}>Cerca de aquí</Text>
            {Array.isArray(lugar.recomendaciones) && lugar.recomendaciones.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recomScroll}>
                {lugar.recomendaciones.map((rec, idx) => (
                  <View key={idx} style={styles.recomCard}>
                    <Image source={rec.img ? { uri: rec.img } : require('../assets/icon.png')} style={styles.recomImg} />
                    <Text style={styles.recomName}>{rec.nombre}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Sin recomendaciones cercanas</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  imgBox: {
    width: '100%',
    height: height * 0.22,
    borderBottomLeftRadius: width * 0.09,
    borderBottomRightRadius: width * 0.09,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: width * 0.04,
  },
  img: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: '58%',
    left: 18,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 6,
    elevation: 2,
  },
  heartBtn: {
    position: 'absolute',
    top: '58%',
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 100,
    padding: 6,
  },
  galleryScroll: {
    marginBottom: width * 0.03,
    minHeight: width * 0.22,
    maxHeight: width * 0.22,
  },
  galleryImg: {
    width: width * 0.32,
    height: width * 0.22,
    borderRadius: width * 0.045,
    marginRight: width * 0.03,
    backgroundColor: '#ccc',
  },
  infoBox: {
    paddingHorizontal: width * 0.07,
    paddingTop: width * 0.01,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginTop: -width * 0.06,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dept: {
    color: '#0984A3',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
  },
  title: {
    color: '#222',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.07,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    color: '#222',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    marginLeft: 4,
  },
  descripcion: {
    color: '#444',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.042,
    marginBottom: 18,
    lineHeight: 22,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionText: {
    color: '#222',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.042,
    flexShrink: 1,
  },
  serviciosBox: {
    marginBottom: 12,
  },
  serviciosTitle: {
    color: '#0984A3',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    marginBottom: 4,
  },
  serviciosList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  servicioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  servicioText: {
    color: '#0984A3',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.038,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0984A3',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 18,
    elevation: 2,
  },
  actionBtnText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
  },
  reviewsBox: {
    marginTop: 10,
    marginBottom: 18,
  },
  reviewsTitle: {
    color: '#0984A3',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    marginBottom: 6,
  },
  reviewItem: {
    backgroundColor: '#F3F3F3',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewUser: {
    color: '#0984A3',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.04,
  },
  reviewRating: {
    color: '#FFC700',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
  },
  reviewText: {
    color: '#222',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.038,
    marginLeft: width * 0.01,
  },
  recomBox: {
    marginTop: 10,
    marginBottom: 18,
  },
  recomTitle: {
    color: '#0984A3',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    marginBottom: 6,
  },
  recomScroll: {
    flexDirection: 'row',
  },
  recomCard: {
    width: width * 0.28,
    marginRight: 12,
    alignItems: 'center',
  },
  recomImg: {
    width: width * 0.26,
    height: width * 0.16,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#ccc',
  },
  recomName: {
    color: '#0984A3',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.038,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    fontSize: width * 0.04,
    color: '#222',
    fontFamily: 'Roboto_400Regular',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    width: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0984A3',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
});

export default DetallesLugarScreen; 