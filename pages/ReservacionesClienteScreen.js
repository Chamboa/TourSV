import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClienteReservaciones, cancelReservation, rateReservation } from './api';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: '#FFA500', icon: 'time' },
  confirmada: { label: 'Confirmada', color: '#4CAF50', icon: 'checkmark-circle' },
  cancelada: { label: 'Cancelada', color: '#F44336', icon: 'close-circle' },
  completada: { label: 'Completada', color: '#2196F3', icon: 'trophy' }
};

export default function ReservacionesClienteScreen() {
  const [reservaciones, setReservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [reservacionSeleccionada, setReservacionSeleccionada] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      loadReservaciones();
    }
  }, [user, filtroEstado]);

  const loadReservaciones = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filtroEstado) filters.estado = filtroEstado;
      
      const data = await getClienteReservaciones(user.id, filters);
      setReservaciones(data.reservaciones || data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservaciones');
    }
    setLoading(false);
  };

  const handleCancelarReservacion = async (id) => {
    Alert.alert(
      'Confirmar cancelación',
      '¿Estás seguro de que quieres cancelar esta reservación?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelReservation(id);
              Alert.alert('Éxito', 'Reservación cancelada correctamente');
              loadReservaciones();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reservación');
            }
          }
        }
      ]
    );
  };

  const handleCalificar = async () => {
    if (rating < 1) {
      Alert.alert('Error', 'Selecciona una calificación');
      return;
    }

    try {
      await rateReservation(reservacionSeleccionada._id, rating, comentario);
      Alert.alert('Éxito', 'Calificación enviada correctamente');
      setRatingModalVisible(false);
      setRating(0);
      setComentario('');
      loadReservaciones();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la calificación');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const getEstadoInfo = (estado) => {
    return ESTADOS[estado] || ESTADOS.pendiente;
  };

  const renderReservacionCard = ({ item }) => {
    const estadoInfo = getEstadoInfo(item.estado);
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setReservacionSeleccionada(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text style={styles.lugarName}>{item.placeId?.nombre || 'Lugar no disponible'}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.color }]}>
              <Ionicons name={estadoInfo.icon} size={12} color="white" />
              <Text style={styles.estadoText}>{estadoInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.codigoReservacion}>{item.codigoConfirmacion}</Text>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color="#0984A3" />
            <Text style={styles.detailText}>
              {formatDate(item.fechaReservacion)} a las {formatTime(item.horaReservacion)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people" size={14} color="#A3B65A" />
            <Text style={styles.detailText}>{item.numeroPersonas} personas</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="pricetag" size={14} color="#E17055" />
            <Text style={styles.detailText}>
              {formatPrice(item.precioFinal)}
              {item.descuentoAplicado > 0 && (
                <Text style={styles.descuentoText}> ({item.descuentoAplicado}% descuento)</Text>
              )}
            </Text>
          </View>

          {item.promotionId && (
            <View style={styles.detailRow}>
              <Ionicons name="gift" size={14} color="#FFD700" />
              <Text style={styles.detailText}>Promoción: {item.promotionId.titulo}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {item.estado === 'pendiente' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelarReservacion(item._id)}
            >
              <Ionicons name="close" size={16} color="white" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}

          {item.estado === 'completada' && !item.calificacion && (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => {
                setReservacionSeleccionada(item);
                setRatingModalVisible(true);
              }}
            >
              <Ionicons name="star" size={16} color="white" />
              <Text style={styles.rateButtonText}>Calificar</Text>
            </TouchableOpacity>
          )}

          {item.calificacion && (
            <View style={styles.ratingDisplay}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.calificacion}/5</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0984A3" />
        <Text style={styles.loadingText}>Cargando reservaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reservaciones</Text>
        <View style={styles.filterContainer}>
          <Picker
            selectedValue={filtroEstado}
            style={styles.filterPicker}
            onValueChange={setFiltroEstado}
          >
            <Picker.Item label="Todas" value="" />
            <Picker.Item label="Pendientes" value="pendiente" />
            <Picker.Item label="Confirmadas" value="confirmada" />
            <Picker.Item label="Canceladas" value="cancelada" />
            <Picker.Item label="Completadas" value="completada" />
          </Picker>
        </View>
      </View>

      {/* Lista de reservaciones */}
      <FlatList
        data={reservaciones}
        keyExtractor={item => item._id}
        renderItem={renderReservacionCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay reservaciones</Text>
            <Text style={styles.emptySubtext}>
              {filtroEstado 
                ? 'No hay reservaciones con este estado'
                : 'Visita lugares y haz tu primera reservación'
              }
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de detalles */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de Reservación</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {reservacionSeleccionada && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Información del Lugar</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Lugar:</Text> {reservacionSeleccionada.placeId?.nombre}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Dirección:</Text> {reservacionSeleccionada.placeId?.direccion}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Detalles de la Reservación</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Código:</Text> {reservacionSeleccionada.codigoConfirmacion}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Fecha:</Text> {formatDate(reservacionSeleccionada.fechaReservacion)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Hora:</Text> {formatTime(reservacionSeleccionada.horaReservacion)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Personas:</Text> {reservacionSeleccionada.numeroPersonas}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Servicio:</Text> {reservacionSeleccionada.tipoServicio}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Precios</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Precio original:</Text> {formatPrice(reservacionSeleccionada.precioOriginal)}
                </Text>
                {reservacionSeleccionada.descuentoAplicado > 0 && (
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Descuento:</Text> {reservacionSeleccionada.descuentoAplicado}%
                  </Text>
                )}
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Precio final:</Text> {formatPrice(reservacionSeleccionada.precioFinal)}
                </Text>
              </View>

              {reservacionSeleccionada.promotionId && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Promoción Aplicada</Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Título:</Text> {reservacionSeleccionada.promotionId.titulo}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Descuento:</Text> {reservacionSeleccionada.promotionId.descuento}%
                  </Text>
                </View>
              )}

              {reservacionSeleccionada.notasEspeciales && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Notas Especiales</Text>
                  <Text style={styles.modalText}>{reservacionSeleccionada.notasEspeciales}</Text>
                </View>
              )}

              {reservacionSeleccionada.notasEmpresa && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Notas de la Empresa</Text>
                  <Text style={styles.modalText}>{reservacionSeleccionada.notasEmpresa}</Text>
                </View>
              )}

              {reservacionSeleccionada.calificacion && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tu Calificación</Text>
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons
                        key={star}
                        name={star <= reservacionSeleccionada.calificacion ? "star" : "star-outline"}
                        size={20}
                        color="#FFD700"
                      />
                    ))}
                    <Text style={styles.ratingText}>{reservacionSeleccionada.calificacion}/5</Text>
                  </View>
                  {reservacionSeleccionada.comentarioCliente && (
                    <Text style={styles.modalText}>{reservacionSeleccionada.comentarioCliente}</Text>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Modal de calificación */}
      <Modal
        visible={ratingModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.ratingModalOverlay}>
          <View style={styles.ratingModalContent}>
            <Text style={styles.ratingModalTitle}>Califica tu experiencia</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Comparte tu experiencia (opcional)"
              value={comentario}
              onChangeText={setComentario}
              multiline
              numberOfLines={3}
            />

            <View style={styles.ratingModalActions}>
              <TouchableOpacity
                style={styles.cancelRatingButton}
                onPress={() => {
                  setRatingModalVisible(false);
                  setRating(0);
                  setComentario('');
                }}
              >
                <Text style={styles.cancelRatingButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitRatingButton}
                onPress={handleCalificar}
              >
                <Text style={styles.submitRatingButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: { padding: 18, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0984A3', marginBottom: 12 },
  filterContainer: { marginTop: 8 },
  filterPicker: { backgroundColor: '#f8f9fa', borderRadius: 8 },
  card: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { marginBottom: 12 },
  cardTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lugarName: { fontSize: 18, fontWeight: 'bold', color: '#0984A3', flex: 1 },
  estadoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  estadoText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  codigoReservacion: { fontSize: 12, color: '#666', marginTop: 4 },
  cardDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, color: '#444', fontSize: 14 },
  descuentoText: { color: '#4CAF50', fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F44336', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  cancelButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  rateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  rateButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  ratingDisplay: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  ratingText: { marginLeft: 4, color: '#666', fontSize: 12 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0984A3' },
  modalContent: { flex: 1, padding: 18 },
  modalSection: { marginBottom: 24 },
  modalSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0984A3', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#444', marginBottom: 4, lineHeight: 20 },
  modalLabel: { fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  ratingModalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: width * 0.9, alignItems: 'center' },
  ratingModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0984A3', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', marginBottom: 20 },
  commentInput: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20, textAlignVertical: 'top' },
  ratingModalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelRatingButton: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 8, marginRight: 8 },
  cancelRatingButtonText: { textAlign: 'center', color: '#666', fontWeight: 'bold' },
  submitRatingButton: { flex: 1, backgroundColor: '#0984A3', paddingVertical: 12, borderRadius: 8, marginLeft: 8 },
  submitRatingButtonText: { textAlign: 'center', color: 'white', fontWeight: 'bold' }
}); 