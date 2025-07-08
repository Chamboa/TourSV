import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllPromotions, getPromotionsDestacadas, usarCuponPromotion } from './api';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const CATEGORIAS = [
  'Todas', 'Comida', 'Entretenimiento', 'Hospedaje', 'Transporte', 'Cultura', 'Deportes', 'Otros'
];

export default function PromocionesClienteScreen() {
  const [promos, setPromos] = useState([]);
  const [promosDestacadas, setPromosDestacadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [promoSeleccionada, setPromoSeleccionada] = useState(null);
  const [usandoCupon, setUsandoCupon] = useState(false);

  useEffect(() => {
    loadPromociones();
  }, []);

  const loadPromociones = async () => {
    setLoading(true);
    try {
      console.log('Cargando promociones para clientes...');
      const [todasPromos, destacadas] = await Promise.all([
        getAllPromotions({ activa: 'true' }),
        getPromotionsDestacadas()
      ]);
      
      console.log('Todas las promociones recibidas:', todasPromos);
      console.log('Promociones destacadas recibidas:', destacadas);
      
      // Manejar la nueva estructura de respuesta
      const promociones = todasPromos.promociones || todasPromos;
      console.log('Promociones procesadas para clientes:', promociones);
      
      setPromos(promociones);
      setPromosDestacadas(destacadas);
    } catch (error) {
      console.error('Error loading promotions:', error);
      setPromos([]);
      setPromosDestacadas([]);
    }
    setLoading(false);
  };

  const getFilteredPromos = () => {
    let filtered = promos;

    if (filtroCategoria !== 'Todas') {
      filtered = filtered.filter(p => p.categoria === filtroCategoria);
    }

    if (busqueda.trim()) {
      const searchTerm = busqueda.toLowerCase();
      filtered = filtered.filter(p => 
        p.titulo.toLowerCase().includes(searchTerm) ||
        p.descripcion.toLowerCase().includes(searchTerm) ||
        p.lugar.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const openPromoModal = (promo) => {
    setPromoSeleccionada(promo);
    setModalVisible(true);
  };

  const handleUsarCupon = async () => {
    if (!promoSeleccionada) return;

    setUsandoCupon(true);
    try {
      const result = await usarCuponPromotion(promoSeleccionada._id);
      
      if (result.success) {
        Alert.alert(
          '¡Cupón usado exitosamente!',
          `Cupones restantes: ${result.cuponesRestantes}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                loadPromociones(); // Recargar para actualizar contadores
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo usar el cupón');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo usar el cupón');
    }
    setUsandoCupon(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha límite';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Gratis';
    return `$${price.toFixed(2)}`;
  };

  const isExpired = (fechaFin) => {
    if (!fechaFin) return false;
    return new Date() > new Date(fechaFin);
  };

  const renderPromoCard = ({ item }) => {
    const expired = isExpired(item.fechaFin);
    
    return (
      <TouchableOpacity 
        style={[styles.promoCard, expired && styles.expiredCard]} 
        onPress={() => openPromoModal(item)}
        disabled={expired}
      >
        {item.imagen && (
          <Image source={{ uri: item.imagen }} style={styles.promoImage} />
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.promoTitle}>{item.titulo}</Text>
            {item.destacada && (
              <View style={styles.badgeDestacada}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.badgeText}>Destacada</Text>
              </View>
            )}
          </View>

          <Text style={styles.promoDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={14} color="#A3B65A" />
              <Text style={styles.detailText}>{item.lugar}</Text>
            </View>

            {item.descuento > 0 && (
              <View style={styles.discountRow}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.descuento}% OFF</Text>
                </View>
              </View>
            )}

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

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.categoria}</Text>
            </View>
          </View>

          {expired && (
            <View style={styles.expiredOverlay}>
              <Text style={styles.expiredText}>EXPIRADA</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDestacadasSection = () => {
    if (promosDestacadas.length === 0) return null;

    return (
      <View style={styles.destacadasSection}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="star" size={16} color="#FFD700" />
          {' '}Promociones Destacadas
        </Text>
        <FlatList
          data={promosDestacadas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.destacadaCard}
              onPress={() => openPromoModal(item)}
            >
              {item.imagen && (
                <Image source={{ uri: item.imagen }} style={styles.destacadaImage} />
              )}
              <View style={styles.destacadaContent}>
                <Text style={styles.destacadaTitle} numberOfLines={1}>
                  {item.titulo}
                </Text>
                <Text style={styles.destacadaDesc} numberOfLines={2}>
                  {item.descripcion}
                </Text>
                {item.descuento > 0 && (
                  <View style={styles.destacadaDiscount}>
                    <Text style={styles.destacadaDiscountText}>{item.descuento}% OFF</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    );
  };

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
        <Text style={styles.title}>Promociones Disponibles</Text>
        <Text style={styles.subtitle}>Encuentra las mejores ofertas</Text>
      </View>

      {/* Filtros y búsqueda */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar promociones..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        
        <Picker
          selectedValue={filtroCategoria}
          style={styles.categoryPicker}
          onValueChange={setFiltroCategoria}
        >
          {CATEGORIAS.map(cat => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={getFilteredPromos()}
        keyExtractor={item => item._id}
        renderItem={renderPromoCard}
        ListHeaderComponent={renderDestacadasSection}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay promociones disponibles</Text>
            <Text style={styles.emptySubtext}>
              {busqueda.trim() 
                ? 'Intenta con otros términos de búsqueda'
                : 'Vuelve más tarde para nuevas ofertas'
              }
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de detalles de promoción */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {promoSeleccionada && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de la Promoción</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {promoSeleccionada.imagen && (
                <Image 
                  source={{ uri: promoSeleccionada.imagen }} 
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}

              <Text style={styles.modalPromoTitle}>{promoSeleccionada.titulo}</Text>
              
              {promoSeleccionada.destacada && (
                <View style={styles.modalBadgeDestacada}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.modalBadgeText}>Promoción Destacada</Text>
                </View>
              )}

              <Text style={styles.modalDesc}>{promoSeleccionada.descripcion}</Text>

              <View style={styles.modalDetails}>
                <View style={styles.modalDetailRow}>
                  <Ionicons name="location" size={16} color="#A3B65A" />
                  <Text style={styles.modalDetailText}>{promoSeleccionada.lugar}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Ionicons name="pricetag" size={16} color="#0984A3" />
                  <Text style={styles.modalDetailText}>
                    {promoSeleccionada.descuento > 0 
                      ? `${promoSeleccionada.descuento}% de descuento` 
                      : 'Sin descuento'
                    }
                  </Text>
                </View>

                {(promoSeleccionada.precioOriginal > 0 || promoSeleccionada.precioDescuento > 0) && (
                  <View style={styles.modalPriceSection}>
                    <Text style={styles.modalPriceLabel}>Precios:</Text>
                    <View style={styles.modalPriceRow}>
                      {promoSeleccionada.precioOriginal > 0 && (
                        <Text style={styles.modalPriceOriginal}>
                          {formatPrice(promoSeleccionada.precioOriginal)}
                        </Text>
                      )}
                      {promoSeleccionada.precioDescuento > 0 && (
                        <Text style={styles.modalPriceDiscount}>
                          {formatPrice(promoSeleccionada.precioDescuento)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.modalDetailRow}>
                  <Ionicons name="calendar" size={16} color="#E17055" />
                  <Text style={styles.modalDetailText}>
                    Válida hasta: {formatDate(promoSeleccionada.fechaFin)}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Ionicons name="ticket" size={16} color="#A3B65A" />
                  <Text style={styles.modalDetailText}>
                    {promoSeleccionada.cuponesDisponibles === -1 
                      ? 'Cupones ilimitados' 
                      : `${promoSeleccionada.cuponesUsados || 0}/${promoSeleccionada.cuponesDisponibles} cupones usados`
                    }
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Ionicons name="bookmark" size={16} color="#1976D2" />
                  <Text style={styles.modalDetailText}>
                    Categoría: {promoSeleccionada.categoria}
                  </Text>
                </View>

                {promoSeleccionada.condiciones && (
                  <View style={styles.conditionsSection}>
                    <Text style={styles.conditionsTitle}>Términos y condiciones:</Text>
                    <Text style={styles.conditionsText}>{promoSeleccionada.condiciones}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
              
              {!isExpired(promoSeleccionada.fechaFin) && (
                <TouchableOpacity 
                  style={styles.useButton} 
                  onPress={handleUsarCupon}
                  disabled={usandoCupon}
                >
                  {usandoCupon ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="ticket" size={16} color="#fff" />
                      <Text style={styles.useButtonText}>Usar Cupón</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0984A3',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#F8FAF7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  categoryPicker: {
    backgroundColor: '#F8FAF7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  destacadasSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0984A3',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  destacadaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 280,
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  destacadaImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  destacadaContent: {
    padding: 12,
  },
  destacadaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0984A3',
    marginBottom: 4,
  },
  destacadaDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  destacadaDiscount: {
    backgroundColor: '#E17055',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  destacadaDiscountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promoCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  expiredCard: {
    opacity: 0.6,
  },
  promoImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0984A3',
    flex: 1,
  },
  badgeDestacada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#856404',
    marginLeft: 2,
    fontWeight: 'bold',
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
  discountRow: {
    marginVertical: 4,
  },
  discountBadge: {
    backgroundColor: '#E17055',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  expiredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  expiredText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#E17055',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalPromoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0984A3',
    marginBottom: 8,
  },
  modalBadgeDestacada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  modalBadgeText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  modalDesc: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalDetails: {
    gap: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalDetailText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  modalPriceSection: {
    marginVertical: 8,
  },
  modalPriceLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalPriceOriginal: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  modalPriceDiscount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E17055',
  },
  conditionsSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAF7',
    borderRadius: 8,
  },
  conditionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  conditionsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
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
  useButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#0984A3',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  useButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
}); 