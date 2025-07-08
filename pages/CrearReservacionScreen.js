import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createReservation } from './api';

const { width } = Dimensions.get('window');

export default function CrearReservacionScreen({ route, navigation }) {
  const { lugar } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Formulario
  const [fechaReservacion, setFechaReservacion] = useState(new Date());
  const [horaReservacion, setHoraReservacion] = useState('12:00');
  const [numeroPersonas, setNumeroPersonas] = useState('2');
  const [tipoServicio, setTipoServicio] = useState('Otros');
  const [precioOriginal, setPrecioOriginal] = useState('50.00');
  const [notasEspeciales, setNotasEspeciales] = useState('');
  const [promocionSeleccionada, setPromocionSeleccionada] = useState(null);
  
  // Estados para modales
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPromocionesModal, setShowPromocionesModal] = useState(false);
  
  // Promociones disponibles
  const [promociones, setPromociones] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFechaReservacion(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setHoraReservacion(`${hours}:${minutes}`);
    }
  };

  const handleCrearReservacion = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para crear una reservación');
      return;
    }

    if (!numeroPersonas || parseInt(numeroPersonas) < 1) {
      Alert.alert('Error', 'Debes especificar al menos 1 persona');
      return;
    }

    if (!precioOriginal || parseFloat(precioOriginal) <= 0) {
      Alert.alert('Error', 'Debes especificar un precio válido');
      return;
    }

    setLoading(true);
    try {
      const reservacionData = {
        userId: user.id,
        placeId: lugar._id,
        fechaReservacion: fechaReservacion.toISOString().split('T')[0],
        horaReservacion,
        numeroPersonas: parseInt(numeroPersonas),
        tipoServicio,
        precioOriginal: parseFloat(precioOriginal),
        notasEspeciales,
        promotionId: promocionSeleccionada?._id || null,
        nombreContacto: user.name || 'Cliente',
        telefonoContacto: user.telefono || 'No especificado',
        emailContacto: user.email || 'No especificado'
      };

      const result = await createReservation(reservacionData);
      
      Alert.alert(
        '¡Reservación Creada!',
        `Tu reservación ha sido creada exitosamente.\nCódigo: ${result.codigoConfirmacion}`,
        [
          {
            text: 'Ver Mis Reservaciones',
            onPress: () => {
              // Navegar según el rol del usuario
              if (user.role === 'empresa') {
                navigation.navigate('EmpresaTabs', { screen: 'Reservaciones' });
              } else {
                navigation.navigate('ClienteTabs', { screen: 'Reservaciones' });
              }
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      
      navigation.goBack();
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Error', 'No se pudo crear la reservación. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderPromocionesModal = () => (
    <Modal
      visible={showPromocionesModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Promoción</Text>
            <TouchableOpacity onPress={() => setShowPromocionesModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <TouchableOpacity
              style={styles.noPromocionOption}
              onPress={() => {
                setPromocionSeleccionada(null);
                setShowPromocionesModal(false);
              }}
            >
              <Text style={styles.noPromocionText}>Sin promoción</Text>
            </TouchableOpacity>
            
            {promociones.map((promo) => (
              <TouchableOpacity
                key={promo._id}
                style={styles.promocionOption}
                onPress={() => {
                  setPromocionSeleccionada(promo);
                  setShowPromocionesModal(false);
                }}
              >
                <View style={styles.promocionInfo}>
                  <Text style={styles.promocionTitulo}>{promo.titulo}</Text>
                  <Text style={styles.promocionDescuento}>{promo.descuento}% descuento</Text>
                  <Text style={styles.promocionDescripcion}>{promo.descripcion}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0984A3" />
          </TouchableOpacity>
          <Text style={styles.title}>Crear Reservación</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Información del lugar */}
        <View style={styles.lugarCard}>
          <Text style={styles.lugarNombre}>{lugar.nombre}</Text>
          <Text style={styles.lugarDireccion}>{lugar.direccion}</Text>
          <Text style={styles.lugarDescripcion}>{lugar.descripcion}</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Fecha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha de reservación</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#0984A3" />
              <Text style={styles.dateTimeText}>{formatDate(fechaReservacion)}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Hora */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hora de reservación</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color="#0984A3" />
              <Text style={styles.dateTimeText}>{horaReservacion}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Número de personas */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de personas</Text>
            <Picker
              selectedValue={numeroPersonas}
              style={styles.picker}
              onValueChange={setNumeroPersonas}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <Picker.Item key={num} label={num.toString()} value={num.toString()} />
              ))}
            </Picker>
          </View>

          {/* Tipo de servicio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de servicio</Text>
            <Picker
              selectedValue={tipoServicio}
              style={styles.picker}
              onValueChange={setTipoServicio}
            >
              <Picker.Item label="Comida" value="Comida" />
              <Picker.Item label="Hospedaje" value="Hospedaje" />
              <Picker.Item label="Entretenimiento" value="Entretenimiento" />
              <Picker.Item label="Transporte" value="Transporte" />
              <Picker.Item label="Otros" value="Otros" />
            </Picker>
          </View>

          {/* Precio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Precio por persona ($)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="50.00"
              value={precioOriginal}
              onChangeText={setPrecioOriginal}
              keyboardType="numeric"
            />
          </View>

          {/* Promoción */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Promoción (opcional)</Text>
            <TouchableOpacity
              style={styles.promocionButton}
              onPress={() => setShowPromocionesModal(true)}
            >
              <Ionicons name="gift" size={20} color="#0984A3" />
              <Text style={styles.promocionButtonText}>
                {promocionSeleccionada ? promocionSeleccionada.titulo : 'Seleccionar promoción'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Notas especiales */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notas especiales (opcional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Comentarios adicionales, requerimientos especiales..."
              value={notasEspeciales}
              onChangeText={setNotasEspeciales}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCrearReservacion}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.createButtonText}>Crear Reservación</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modales */}
      {showDatePicker && (
        <DateTimePicker
          value={fechaReservacion}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${horaReservacion}:00`)}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {renderPromocionesModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF7' },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0984A3' },
  lugarCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  lugarNombre: { fontSize: 18, fontWeight: 'bold', color: '#0984A3', marginBottom: 4 },
  lugarDireccion: { fontSize: 14, color: '#666', marginBottom: 8 },
  lugarDescripcion: { fontSize: 14, color: '#444', lineHeight: 20 },
  formContainer: { padding: 16 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: 'bold', color: '#0984A3', marginBottom: 8 },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  dateTimeText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#444' },
  picker: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  promocionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  promocionButtonText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#444' },
  textArea: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 100
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0984A3',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  createButtonDisabled: { backgroundColor: '#ccc' },
  createButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0984A3' },
  modalBody: { padding: 16 },
  noPromocionOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  noPromocionText: { fontSize: 16, color: '#666' },
  promocionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  promocionInfo: { flex: 1 },
  promocionTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0984A3' },
  promocionDescuento: { fontSize: 14, color: '#4CAF50', marginTop: 2 },
  promocionDescripcion: { fontSize: 14, color: '#666', marginTop: 4 },
  textInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16
  }
}); 