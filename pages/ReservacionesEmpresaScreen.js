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
import { getEmpresaReservaciones, updateReservationStatus, getReservacionesEstadisticas } from './api';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: '#FFA500', icon: 'time' },
  confirmada: { label: 'Confirmada', color: '#4CAF50', icon: 'checkmark-circle' },
  cancelada: { label: 'Cancelada', color: '#F44336', icon: 'close-circle' },
  completada: { label: 'Completada', color: '#2196F3', icon: 'trophy' }
};

export default function ReservacionesEmpresaScreen() {
  const [reservaciones, setReservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [reservacionSeleccionada, setReservacionSeleccionada] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [notasEmpresa, setNotasEmpresa] = useState('');

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      loadReservaciones();
      loadEstadisticas();
    }
  }, [user, filtroEstado]);

  const loadReservaciones = async () => {
    setLoading(true);
    try {
      console.log('Cargando reservaciones para empresa:', user.id);
      const filters = {};
      if (filtroEstado) filters.estado = filtroEstado;
      
      const data = await getEmpresaReservaciones(user.id, filters);
      console.log('Datos de reservaciones recibidos:', data);
      setReservaciones(data.reservaciones || data || []);
      console.log('Reservaciones establecidas:', data.reservaciones || data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservaciones');
    }
    setLoading(false);
  };

  const loadEstadisticas = async () => {
    try {
      const stats = await getReservacionesEstadisticas(user.id);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleUpdateStatus = async (id, nuevoEstado) => {
    try {
      await updateReservationStatus(id, nuevoEstado, notasEmpresa);
      Alert.alert('Éxito', `Reservación ${nuevoEstado} correctamente`);
      setModalVisible(false);
      setNotasEmpresa('');
      loadReservaciones();
      loadEstadisticas();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
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
            <Ionicons name="person" size={14} color="#0984A3" />
            <Text style={styles.detailText}>{item.userId?.name || 'Cliente'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color="#A3B65A" />
            <Text style={styles.detailText}>
              {formatDate(item.fechaReservacion)} a las {formatTime(item.horaReservacion)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people" size={14} color="#E17055" />
            <Text style={styles.detailText}>{item.numeroPersonas} personas</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="pricetag" size={14} color="#FFD700" />
            <Text style={styles.detailText}>{formatPrice(item.precioFinal)}</Text>
          </View>

          {item.promotionId && (
            <View style={styles.detailRow}>
              <Ionicons name="gift" size={14} color="#9C27B0" />
              <Text style={styles.detailText}>Promoción: {item.promotionId.titulo}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {item.estado === 'pendiente' && (
            <>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleUpdateStatus(item._id, 'confirmada')}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleUpdateStatus(item._id, 'cancelada')}
              >
                <Ionicons name="close" size={16} color="white" />
                <Text style={styles.cancelButtonText}>Rechazar</Text>
              </TouchableOpacity>
            </>
          )}

          {item.estado === 'confirmada' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleUpdateStatus(item._id, 'completada')}
            >
              <Ionicons name="trophy" size={16} color="white" />
              <Text style={styles.completeButtonText}>Completar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Estadísticas del Mes</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{estadisticas.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{estadisticas.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{estadisticas.confirmadas}</Text>
            <Text style={styles.statLabel}>Confirmadas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{estadisticas.completadas}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>
        <View style={styles.incomeRow}>
          <Text style={styles.incomeLabel}>Ingresos:</Text>
          <Text style={styles.incomeAmount}>{formatPrice(estadisticas.ingresos)}</Text>
        </View>
        {estadisticas.calificacionPromedio > 0 && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Calificación promedio:</Text>
            <Text style={styles.ratingAmount}>{estadisticas.calificacionPromedio}/5</Text>
          </View>
        )}
      </View>
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
        <Text style={styles.title}>Gestión de Reservaciones</Text>
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

      {/* Estadísticas */}
      {renderEstadisticas()}

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
                : 'Los clientes podrán hacer reservaciones en tus lugares'
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
                <Text style={styles.modalSectionTitle}>Información del Cliente</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Nombre:</Text> {reservacionSeleccionada.nombreContacto}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Email:</Text> {reservacionSeleccionada.emailContacto}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Teléfono:</Text> {reservacionSeleccionada.telefonoContacto}
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
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Precio final:</Text> {formatPrice(reservacionSeleccionada.precioFinal)}
                </Text>
              </View>

              {reservacionSeleccionada.notasEspeciales && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Notas del Cliente</Text>
                  <Text style={styles.modalText}>{reservacionSeleccionada.notasEspeciales}</Text>
                </View>
              )}

              {reservacionSeleccionada.notasEmpresa && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Notas de la Empresa</Text>
                  <Text style={styles.modalText}>{reservacionSeleccionada.notasEmpresa}</Text>
                </View>
              )}

              {/* Acciones según estado */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Acciones</Text>
                
                {reservacionSeleccionada.estado === 'pendiente' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.modalConfirmButton}
                      onPress={() => handleUpdateStatus(reservacionSeleccionada._id, 'confirmada')}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                      <Text style={styles.modalButtonText}>Confirmar Reservación</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => handleUpdateStatus(reservacionSeleccionada._id, 'cancelada')}
                    >
                      <Ionicons name="close" size={20} color="white" />
                      <Text style={styles.modalButtonText}>Rechazar Reservación</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {reservacionSeleccionada.estado === 'confirmada' && (
                  <TouchableOpacity
                    style={styles.modalCompleteButton}
                    onPress={() => handleUpdateStatus(reservacionSeleccionada._id, 'completada')}
                  >
                    <Ionicons name="trophy" size={20} color="white" />
                    <Text style={styles.modalButtonText}>Marcar como Completada</Text>
                  </TouchableOpacity>
                )}

                <TextInput
                  style={styles.notasInput}
                  placeholder="Agregar notas para el cliente (opcional)"
                  value={notasEmpresa}
                  onChangeText={setNotasEmpresa}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          )}
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
  statsContainer: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, elevation: 2 },
  statsTitle: { fontSize: 16, fontWeight: 'bold', color: '#0984A3', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#2E5006' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  incomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  incomeLabel: { fontSize: 14, color: '#666' },
  incomeAmount: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  ratingLabel: { fontSize: 14, color: '#666' },
  ratingAmount: { fontSize: 16, fontWeight: 'bold', color: '#FFD700' },
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
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  confirmButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  confirmButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  cancelButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F44336', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  cancelButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  completeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  completeButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
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
  actionButtons: { marginBottom: 16 },
  modalConfirmButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginBottom: 8 },
  modalCancelButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F44336', padding: 12, borderRadius: 8, marginBottom: 8 },
  modalCompleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginBottom: 8 },
  modalButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  notasInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, textAlignVertical: 'top' }
}); 