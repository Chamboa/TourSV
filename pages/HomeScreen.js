import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, Dimensions, Animated, FlatList, PanResponder, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useNavigation } from '@react-navigation/native';
import { useFavoritos } from './FavoritosContext';
import { getPlaces, getPromotionsDestacadas } from './api';

const { width, height } = Dimensions.get('window');
const userImg = 'https://randomuser.me/api/portraits/women/44.jpg'; // Puedes cambiar por la URL real

const departamentos = [
  'Todos',
  'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz',
  'La Unión', 'Morazán', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután'
];

const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = height * 0.32;
const CARD_SPACING = width * 0.05;
const VISIBLE_CARDS = 3;

const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });
  const [selectedDept, setSelectedDept] = useState('Todos');
  const scaleAnim = useRef({});
  departamentos.forEach(dep => {
    if (!scaleAnim.current[dep]) {
      scaleAnim.current[dep] = new Animated.Value(dep === selectedDept ? 1.1 : 1);
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleSelectDept = (dep) => {
    setIsLoading(true);
    Animated.parallel([
      Animated.spring(scaleAnim.current[dep], {
        toValue: 1.1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      ...departamentos.filter(d => d !== dep).map(d =>
        Animated.spring(scaleAnim.current[d], {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        })
      )
    ]).start();
    setSelectedDept(dep);
    setMainIndex(0);
    anim.setValue(0);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const [search, setSearch] = useState('');
  const [lugares, setLugares] = useState([]);
  const [promocionesDestacadas, setPromocionesDestacadas] = useState([]);

  const scrollX = useRef(new Animated.Value(0)).current;

  const [mainIndex, setMainIndex] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const [isSwiping, setIsSwiping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritos();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isAnimating && lugares.length > 1 && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: anim }
      ], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (isAnimating || lugares.length < 2) return;
        if (gestureState.dx < -60) {
          setIsAnimating(true);
          Animated.spring(anim, {
            toValue: -width,
            useNativeDriver: true,
            friction: 5,
            tension: 40,
          }).start(() => {
            setMainIndex(idx => {
              const total = lugares.length;
              const next = total === 0 ? 0 : (idx + 1 + total) % total;
              setTimeout(() => {
                anim.setValue(0);
                setIsAnimating(false);
              }, 0);
              return next;
            });
          });
        } else if (gestureState.dx > 60) {
          setIsAnimating(true);
          Animated.spring(anim, {
            toValue: width,
            useNativeDriver: true,
            friction: 5,
            tension: 40,
          }).start(() => {
            setMainIndex(idx => {
              const total = lugares.length;
              const next = total === 0 ? 0 : (idx - 1 + total) % total;
              setTimeout(() => {
                anim.setValue(0);
                setIsAnimating(false);
              }, 0);
              return next;
            });
          });
        } else {
          Animated.spring(anim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
            tension: 40,
          }).start();
        }
      },
    })
  ).current;

  // Helper para obtener el índice original del lugar en lugares
  const getOriginalIndex = (lugar) => {
    return lugares.findIndex(l => l.nombre === lugar.nombre && l.dept === lugar.dept);
  };

  const renderStack = () => {
    const total = lugares.length;
    const safeIndex = total === 0 ? 0 : (mainIndex >= total ? 0 : mainIndex);
    if (total === 0) {
      return <Text style={{ color: '#888', fontSize: width * 0.045, textAlign: 'center', marginTop: 40 }}>No hay lugares para mostrar.</Text>;
    }
    const visibleIndices = [
      (safeIndex - 1 + total) % total,
      safeIndex % total,
      (safeIndex + 1) % total
    ];
    return (
      <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT + 30, marginTop: height * 0.02, marginBottom: height * 0.01, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
          {visibleIndices.map((cardIdx, i) => {
            const lugar = lugares[cardIdx];
            const originalIdx = getOriginalIndex(lugar);
            let rel = cardIdx - safeIndex;
            if (rel > 1) rel -= total;
            if (rel < -1) rel += total;
            let style = {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100 - Math.abs(rel),
              opacity: 1,
              transform: [],
            };
            if (rel === 0) {
              style.transform = [
                { translateX: anim },
                { scale: anim.interpolate({ inputRange: [-width, 0, width], outputRange: [0.92, 1, 0.92] }) },
              ];
              style.opacity = anim.interpolate({ inputRange: [-width, 0, width], outputRange: [0.6, 1, 0.6] });
            } else {
              if (rel === 1) {
                style.transform = [
                  { translateX: anim.interpolate({ inputRange: [-width, 0, width], outputRange: [0, 60, 120] }) },
                  { scale: anim.interpolate({ inputRange: [-width, 0, width], outputRange: [0.92, 0.92, 0.92] }) },
                ];
              } else {
                style.transform = [
                  { translateX: anim.interpolate({ inputRange: [-width, 0, width], outputRange: [-60, -60, -120] }) },
                  { scale: 0.86 },
                ];
              }
              style.opacity = 0.6;
            }
            return (
              <Animated.View
                key={`card-${originalIdx}-${lugar.nombre}-${lugar.dept}-${safeIndex}-${i}`}
                style={[styles.card, style]}
                {...(rel === 0 ? panResponder.panHandlers : {})}
                pointerEvents={rel === 0 ? 'auto' : 'none'}
              >
                <Image source={{ uri: lugar.img }} style={styles.cardImg} />
                <View style={styles.cardOverlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLocation}>{lugar.dept}</Text>
                  <Text style={styles.cardTitle}>{lugar.nombre}</Text>
                  <View style={styles.cardRatingRow}>
                    <MaterialIcons name="star" size={width * 0.04} color="#fff" />
                    <Text style={styles.cardRating}>{Array.isArray(lugar.reseñas) && lugar.reseñas.length > 0 ? (lugar.reseñas.reduce((acc, r) => acc + (r.rating || 0), 0) / lugar.reseñas.length).toFixed(1) : '0'}</Text>
                  </View>
                  <TouchableOpacity style={styles.cardDetailsBtn} onPress={() => navigation.navigate('DetallesLugar', { lugar })}>
                    <Text style={styles.cardDetailsText}>Más detalles</Text>
                    <Ionicons name="chevron-forward" size={width * 0.04} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 100, padding: 6, zIndex: 10 }}
                  onPress={() => esFavorito(lugar) ? quitarFavorito(lugar) : agregarFavorito(lugar)}
                >
                  <Ionicons name={esFavorito(lugar) ? 'heart' : 'heart-outline'} size={width * 0.07} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  };

  const toIndex = (idx, total) => total === 0 ? 0 : (idx + total) % total;

  const navigation = useNavigation();

  // Manejar búsqueda y reiniciar mainIndex y animación
  const handleSearch = (text) => {
    setIsLoading(true);
    setSearch(text);
    setMainIndex(0);
    anim.setValue(0);
    setTimeout(() => setIsLoading(false), 1000);
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getPlaces(),
      getPromotionsDestacadas()
    ]).then(([lugaresData, promocionesData]) => {
      setLugares(lugaresData);
      setPromocionesDestacadas(promocionesData);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const renderPromocionesDestacadas = () => {
    if (promocionesDestacadas.length === 0) return null;

    return (
      <View style={styles.promocionesSection}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="star" size={16} color="#FFD700" />
          {' '}Promociones Destacadas
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: width * 0.04 }}
        >
          {promocionesDestacadas.map((promo) => (
            <TouchableOpacity
              key={promo._id}
              style={styles.promoCard}
              onPress={() => navigation.navigate('ClienteTabs', { screen: 'Promociones' })}
            >
              {promo.imagen && (
                <Image source={{ uri: promo.imagen }} style={styles.promoImage} />
              )}
              <View style={styles.promoContent}>
                <Text style={styles.promoTitle} numberOfLines={1}>
                  {promo.titulo}
                </Text>
                <Text style={styles.promoDesc} numberOfLines={2}>
                  {promo.descripcion}
                </Text>
                <View style={styles.promoDetails}>
                  <Text style={styles.promoLocation}>{promo.lugar}</Text>
                  {promo.descuento > 0 && (
                    <View style={styles.promoDiscount}>
                      <Text style={styles.promoDiscountText}>{promo.descuento}% OFF</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.hola}>Hola, Andrea</Text>
          <Text style={styles.bienvenido}>Bienvenid@ a TourSV</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ClienteTabs', { screen: 'Perfil' })}>
          <Image source={{ uri: userImg }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={width * 0.055} color="#888" style={{ marginLeft: width * 0.025 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar"
          placeholderTextColor="#888"
          value={search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity>
          <Feather name="menu" size={width * 0.06} color="#000" style={{ marginRight: width * 0.025 }} />
        </TouchableOpacity>
      </View>

      {/* Promociones Destacadas */}
      {renderPromocionesDestacadas()}

      {/* Destino selector */}
      <Text style={styles.selectLabel}>Selecciona tu siguiente destino</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.departamentoCarousel}
        contentContainerStyle={{ paddingLeft: width * 0.04, paddingRight: width * 0.04, alignItems: 'center', height: height * 0.055 }}
      >
        {departamentos.map((dep) => (
          <Animated.View
            key={dep}
            style={{
              transform: [{ scale: scaleAnim.current[dep] }],
              marginRight: width * 0.02,
            }}
          >
            <TouchableOpacity
              style={[styles.destinoBtn, selectedDept === dep && styles.destinoBtnActive]}
              onPress={() => handleSelectDept(dep)}
              activeOpacity={0.8}
            >
              <Text style={selectedDept === dep ? styles.destinoTextActive : styles.destinoText}>{dep}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        renderStack()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    paddingTop: height * 0.06,
    paddingHorizontal: 0,
    fontFamily: 'Roboto_400Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.015,
  },
  hola: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.055,
    color: '#222',
  },
  bienvenido: {
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.038,
    color: '#A0A0A0',
    marginTop: 2,
  },
  avatar: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: (width * 0.13) / 2,
    backgroundColor: '#ccc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: width * 0.06,
    marginHorizontal: width * 0.06,
    marginBottom: height * 0.022,
    height: height * 0.06,
    shadowColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    fontFamily: 'Roboto_400Regular',
    color: '#222',
    marginLeft: width * 0.02,
    backgroundColor: 'transparent',
  },
  selectLabel: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    color: '#A0A0A0',
    marginLeft: width * 0.06,
    marginBottom: height * 0.01,
  },
  destinoRow: {
    flexDirection: 'row',
    marginLeft: width * 0.04,
    marginBottom: height * 0.022,
  },
  destinoBtn: {
    backgroundColor: '#fff',
    borderRadius: width * 0.04,
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.006,
  },
  destinoBtnActive: {
    backgroundColor: '#000',
  },
  destinoText: {
    fontFamily: 'Roboto_700Bold',
    color: '#888',
    fontSize: width * 0.038,
  },
  destinoTextActive: {
    fontFamily: 'Roboto_700Bold',
    color: '#fff',
    fontSize: width * 0.038,
  },
  cardsScroll: {
    marginLeft: width * 0.04,
    marginBottom: height * 0.03,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: width * 0.07,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    position: 'relative',
    marginBottom: 8,
  },
  cardImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  cardContent: {
    position: 'absolute',
    left: width * 0.045,
    bottom: width * 0.045,
  },
  cardLocation: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    marginBottom: 2,
  },
  cardTitle: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.055,
    marginBottom: 8,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRating: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    marginLeft: 4,
    marginRight: 12,
  },
  cardDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  cardDetailsText: {
    color: '#fff',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.038,
    marginRight: 2,
  },
  departamentoCarousel: {
    marginBottom: height * 0.012,
    height: height * 0.055,
    minHeight: height * 0.055,
    maxHeight: height * 0.055,
  },
  promocionesSection: {
    marginBottom: height * 0.02,
  },
  sectionTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    color: '#222',
    marginLeft: width * 0.06,
    marginBottom: height * 0.01,
  },
  promoCard: {
    backgroundColor: '#fff',
    borderRadius: width * 0.04,
    width: width * 0.4,
    marginRight: width * 0.04,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoImage: {
    width: '100%',
    height: width * 0.2,
    borderTopLeftRadius: width * 0.04,
    borderTopRightRadius: width * 0.04,
    marginBottom: 0,
  },
  promoContent: {
    padding: width * 0.03,
  },
  promoTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.035,
    color: '#222',
    marginBottom: 4,
  },
  promoDesc: {
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.03,
    color: '#888',
    marginBottom: 8,
  },
  promoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoLocation: {
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.028,
    color: '#666',
    flex: 1,
  },
  promoDiscount: {
    backgroundColor: '#E17055',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  promoDiscountText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.025,
    color: '#fff',
  },
});

export default HomeScreen; 