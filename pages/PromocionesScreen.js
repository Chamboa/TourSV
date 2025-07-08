import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
  Switch,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPromotions, createPromotion, deletePromotion, updatePromotion, getPlaces } from './api';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const CATEGORIAS = [
  'Comida', 'Entretenimiento', 'Hospedaje', 'Transporte', 'Cultura', 'Deportes', 'Otros'
];

export default function PromocionesScreen() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [datePickerField, setDatePickerField] = useState('');

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    lugar: '',
    placeId: '',
    descuento: '',
    precioOriginal: '',
    precioDescuento: '',
    fechaInicio: new Date(),
    fechaFin: null,
    categoria: 'Otros',
    imagen: '',
    cuponesDisponibles: '',
    condiciones: '',
    destacada: false,
    activa: true
  });

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Cargando datos para empresa:', user.id);
      const [promosData, lugaresData] = await Promise.all([
        getPromotions(user.id),
        getPlaces(user.id)
      ]);
      
      console.log('Datos de promociones recibidos:', promosData);
      console.log('Datos de lugares recibidos:', lugaresData);
      
      // Manejar la nueva estructura de respuesta
      const promociones = promosData.promociones || promosData;
      console.log('Promociones procesadas:', promociones);
      
      setPromos(promociones);
      setLugares(lugaresData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      titulo: '',
      descripcion: '',
      lugar: '',
      placeId: '',
      descuento: '',
      precioOriginal: '',
      precioDescuento: '',
      fechaInicio: new Date(),
      fechaFin: null,
      categoria: 'Otros',
      imagen: '',
      cuponesDisponibles: '',
      condiciones: '',
      destacada: false,
      activa: true
    });
    setEditingPromo(null);
  };

  const openModal = (promo = null) => {
    if (promo) {
      setForm({
        ...promo,
        fechaInicio: new Date(promo.fechaInicio),
        fechaFin: promo.fechaFin ? new Date(promo.fechaFin) : null,
        descuento: promo.descuento?.toString() || '',
        precioOriginal: promo.precioOriginal?.toString() || '',
        precioDescuento: promo.precioDescuento?.toString() || '',
        cuponesDisponibles: promo.cuponesDisponibles?.toString() || ''
      });
      setEditingPromo(promo);
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.titulo || !form.placeId) {
      return Alert.alert('Error', 'Título y lugar son obligatorios');
    }

    setLoading(true);
    try {
      const promoData = {
        ...form,
        empresaId: user.id,
        descuento: parseFloat(form.descuento) || 0,
        precioOriginal: parseFloat(form.precioOriginal) || 0,
        precioDescuento: parseFloat(form.precioDescuento) || 0,
        cuponesDisponibles: parseInt(form.cuponesDisponibles) || -1
      };

      if (editingPromo) {
        await updatePromotion(editingPromo._id, promoData);
        Alert.alert('Éxito', 'Promoción actualizada correctamente');
      } else {
        await createPromotion(promoData);
        Alert.alert('Éxito', 'Promoción creada correctamente');
      }

      setModalVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving promotion:', error);
      Alert.alert('Error', 'No se pudo guardar la promoción');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta promoción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deletePromotion(id);
              Alert.alert('Éxito', 'Promoción eliminada correctamente');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la promoción');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm(prev => ({
        ...prev,
        [datePickerField]: selectedDate
      }));
    }
  };

  const showDatePickerModal = (field, mode = 'date') => {
    setDatePickerField(field);
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const getFilteredPromos = () => {
    let filtered = promos;

    if (filtroCategoria) {
      filtered = filtered.filter(p => p.categoria === filtroCategoria);
    }

    if (filtroEstado === 'activas') {
      filtered = filtered.filter(p => p.activa);
    } else if (filtroEstado === 'inactivas') {
      filtered = filtered.filter(p => !p.activa);
    }

    return filtered;
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha límite';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Gratis';
    return `$${price.toFixed(2)}`;
  };

  const renderPromoCard = ({ item }) => (
    <View style={[styles.promoCard, !item.activa && styles.inactiveCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.promoTitle}>{item.titulo}</Text>
          {item.destacada && (
            <View style={styles.badgeDestacada}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.badgeText}>Destacada</Text>
            </View>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => openModal(item)}
          >
            <Ionicons name="pencil" size={16} color="#0984A3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]} 
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash" size={16} color="#E17055" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.promoDesc}>{item.descripcion}</Text>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={14} color="#A3B65A" />
          <Text style={styles.detailText}>{item.lugar}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="pricetag" size={14} color="#0984A3" />
          <Text style={styles.detailText}>
            {item.descuento > 0 ? `${item.descuento}% OFF` : 'Sin descuento'}
          </Text>
        </View>

        {(item.precioOriginal > 0 || item.precioDescuento > 0) && (
          <View style={styles.priceRow}>
            {item.precioOriginal > 0 && (
              <Text style={styles.priceOriginal}>{formatPrice(item.precioOriginal)}</Text>
            )}
            {item.precioDescuento > 0 && (
              <Text style={styles.priceDiscount}>{formatPrice(item.precioDescuento)}</Text>
            )}
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={14} color="#E17055" />
          <Text style={styles.detailText}>
            Válida hasta: {formatDate(item.fechaFin)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="ticket" size={14} color="#A3B65A" />
          <Text style={styles.detailText}>
            {item.cuponesDisponibles === -1 
              ? 'Cupones ilimitados' 
              : `${item.cuponesUsados || 0}/${item.cuponesDisponibles} usados`
            }
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, item.activa ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>
              {item.activa ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.categoria}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0984A3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Promociones</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Picker
            selectedValue={filtroCategoria}
            style={styles.filterPicker}
            onValueChange={setFiltroCategoria}
          >
            <Picker.Item label="Todas las categorías" value="" />
            {CATEGORIAS.map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>

          <Picker
            selectedValue={filtroEstado}
            style={styles.filterPicker}
            onValueChange={setFiltroEstado}
          >
            <Picker.Item label="Todas" value="todas" />
            <Picker.Item label="Activas" value="activas" />
            <Picker.Item label="Inactivas" value="inactivas" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={getFilteredPromos()}
        keyExtractor={item => item._id}
        renderItem={renderPromoCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay promociones</Text>
            <Text style={styles.emptySubtext}>
              {lugares.length === 0 
                ? 'Crea lugares primero para agregar promociones'
                : 'Crea tu primera promoción'
              }
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para crear/editar promoción */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="Título de la promoción *"
              value={form.titulo}
              onChangeText={v => setForm(prev => ({ ...prev, titulo: v }))}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Descripción"
              value={form.descripcion}
              onChangeText={v => setForm(prev => ({ ...prev, descripcion: v }))}
              multiline
              numberOfLines={3}
            />

            <Picker
              selectedValue={form.placeId}
              style={styles.modalInput}
              onValueChange={v => {
                const lugar = lugares.find(l => l._id === v);
                setForm(prev => ({ 
                  ...prev, 
                  placeId: v, 
                  lugar: lugar ? lugar.nombre : '' 
                }));
              }}
            >
              <Picker.Item label="Selecciona un lugar *" value="" />
              {lugares.map(l => (
                <Picker.Item key={l._id} label={l.nombre} value={l._id} />
              ))}
            </Picker>

            <View style={styles.row}>
              <TextInput
                style={[styles.modalInput, styles.halfInput]}
                placeholder="Descuento (%)"
                value={form.descuento}
                onChangeText={v => setForm(prev => ({ ...prev, descuento: v }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.modalInput, styles.halfInput]}
                placeholder="Precio original"
                value={form.precioOriginal}
                onChangeText={v => setForm(prev => ({ ...prev, precioOriginal: v }))}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Precio con descuento"
              value={form.precioDescuento}
              onChangeText={v => setForm(prev => ({ ...prev, precioDescuento: v }))}
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfInput]}
                onPress={() => showDatePickerModal('fechaInicio')}
              >
                <Ionicons name="calendar" size={16} color="#0984A3" />
                <Text style={styles.dateButtonText}>
                  Inicio: {form.fechaInicio.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateButton, styles.halfInput]}
                onPress={() => showDatePickerModal('fechaFin')}
              >
                <Ionicons name="calendar" size={16} color="#0984A3" />
                <Text style={styles.dateButtonText}>
                  Fin: {form.fechaFin ? form.fechaFin.toLocaleDateString() : 'Sin límite'}
                </Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={form.categoria}
              style={styles.modalInput}
              onValueChange={v => setForm(prev => ({ ...prev, categoria: v }))}
            >
              {CATEGORIAS.map(cat => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>

            <TextInput
              style={styles.modalInput}
              placeholder="URL de imagen (opcional)"
              value={form.imagen}
              onChangeText={v => setForm(prev => ({ ...prev, imagen: v }))}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Cupones disponibles (-1 = ilimitado)"
              value={form.cuponesDisponibles}
              onChangeText={v => setForm(prev => ({ ...prev, cuponesDisponibles: v }))}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Términos y condiciones"
              value={form.condiciones}
              onChangeText={v => setForm(prev => ({ ...prev, condiciones: v }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Promoción destacada</Text>
              <Switch
                value={form.destacada}
                onValueChange={v => setForm(prev => ({ ...prev, destacada: v }))}
                trackColor={{ false: '#ccc', true: '#0984A3' }}
                thumbColor={form.destacada ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Promoción activa</Text>
              <Switch
                value={form.activa}
                onValueChange={v => setForm(prev => ({ ...prev, activa: v }))}
                trackColor={{ false: '#ccc', true: '#0984A3' }}
                thumbColor={form.activa ? '#fff' : '#f4f3f4'}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingPromo ? 'Actualizar' : 'Crear'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={form[datePickerField] || new Date()}
          mode={datePickerMode}
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0984A3',
  },
  addButton: {
    backgroundColor: '#0984A3',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterPicker: {
    flex: 1,
    backgroundColor: '#F8FAF7',
    borderRadius: 8,
  },
  promoCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0984A3',
    marginBottom: 4,
  },
  badgeDestacada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: '#856404',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAF7',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
  },
  promoDesc: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceOriginal: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  priceDiscount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E17055',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0984A3',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalInput: {
    backgroundColor: '#F8FAF7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#0984A3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
}); 