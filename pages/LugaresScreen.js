import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Image, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFavoritos } from './FavoritosContext';
import { getPlaces } from './api';

const { width, height } = Dimensions.get('window');
const userImg = 'https://randomuser.me/api/portraits/women/44.jpg';
const departamentos = [
  'Todos',
  'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz',
  'La Unión', 'Morazán', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután'
];
const lugaresEjemplo = [
  { nombre: 'Izalco', dept: 'Sonsonate', img: 'https://www.elsalvador.travel/wp-content/uploads/2020/01/Izalco-1.jpg', rating: 3.9 },
  { nombre: 'Centro de la capital', dept: 'San Salvador', img: 'https://www.elsalvador.travel/wp-content/uploads/2020/01/San-Salvador-1.jpg', rating: 4.7 },
  { nombre: 'Sunset Park', dept: 'La Libertad', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/3e/2e/7b/sunset-park.jpg?w=700&h=-1&s=1', rating: 5.0 },
];

const CARD_SIZE = width * 0.42;

const LugaresScreen = () => {
  const navigation = useNavigation();
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [search, setSearch] = useState('');
  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritos();
  const [isLoading, setIsLoading] = useState(false);
  const [lugares, setLugares] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    getPlaces().then(data => {
      setLugares(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const lugaresFiltrados = selectedDept === 'Todos'
    ? lugares.filter(l => l.nombre.toLowerCase().includes(search.toLowerCase()))
    : lugares.filter(l => l.dept === selectedDept && l.nombre.toLowerCase().includes(search.toLowerCase()));

  const handleDept = (dep) => {
    setIsLoading(true);
    setSelectedDept(dep);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Image source={{ uri: userImg }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={width * 0.06} color="#888" style={{ marginLeft: width * 0.025 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity>
          <Feather name="menu" size={width * 0.07} color="#000" style={{ marginRight: width * 0.025 }} />
        </TouchableOpacity>
      </View>
      {/* Chips departamentos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={{ paddingLeft: width * 0.06, paddingRight: width * 0.06 }}>
        {departamentos.map(dep => (
          <TouchableOpacity
            key={dep}
            style={[styles.chip, selectedDept === dep && styles.chipActive]}
            onPress={() => handleDept(dep)}
          >
            <Text style={selectedDept === dep ? styles.chipTextActive : styles.chipText}>{dep}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={lugaresFiltrados}
          keyExtractor={(_, i) => i.toString()}
          numColumns={2}
          contentContainerStyle={styles.cardsGrid}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.img }} style={styles.cardImg} />
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <Text style={styles.cardDept}>{item.dept}</Text>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <View style={styles.cardRatingRow}>
                  <MaterialIcons name="star" size={width * 0.04} color="#fff" />
                  <Text style={styles.cardRating}>{Array.isArray(item.reseñas) && item.reseñas.length > 0 ? (item.reseñas.reduce((acc, r) => acc + (r.rating || 0), 0) / item.reseñas.length).toFixed(1) : '0'}</Text>
                </View>
                <TouchableOpacity style={styles.cardDetailsBtn} onPress={() => navigation.navigate('DetallesLugar', { lugar: { _id: item._id } })}>
                  <Text style={styles.cardDetailsText}>Más detalles</Text>
                  <Ionicons name="chevron-forward" size={width * 0.04} color="#fff" />
                </TouchableOpacity>
              </View>
              {/* Botón de favorito */}
              <TouchableOpacity
                style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 100, padding: 6, zIndex: 10 }}
                onPress={() => esFavorito(item) ? quitarFavorito(item) : agregarFavorito(item)}
              >
                <Ionicons name={esFavorito(item) ? 'heart' : 'heart-outline'} size={width * 0.07} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay lugares en este departamento.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: height * 0.045,
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.06,
  },
  hora: {
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.045,
    color: '#000',
  },
  placeholder: {
    width: width * 0.22,
    height: width * 0.055,
    backgroundColor: '#000',
    borderRadius: width * 0.03,
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
  chipsScroll: {
    marginBottom: height * 0.01,
    minHeight: height * 0.045,
    maxHeight: height * 0.045,
    paddingVertical: 0,
  },
  chip: {
    backgroundColor: '#F3F3F3',
    borderRadius: width * 0.04,
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.006,
    marginRight: width * 0.025,
  },
  chipActive: {
    backgroundColor: '#000',
  },
  chipText: {
    fontFamily: 'Roboto_700Bold',
    color: '#888',
    fontSize: width * 0.038,
  },
  chipTextActive: {
    fontFamily: 'Roboto_700Bold',
    color: '#fff',
    fontSize: width * 0.038,
  },
  cardsGrid: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.14,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.18,
    borderRadius: width * 0.07,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    marginBottom: width * 0.045,
    marginRight: width * 0.045,
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
  cardDept: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    marginBottom: 2,
  },
  cardTitle: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.052,
    marginBottom: 8,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardRating: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: width * 0.038,
    marginLeft: 4,
  },
  cardDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  cardDetailsText: {
    color: '#fff',
    fontFamily: 'Roboto_400Regular',
    fontSize: width * 0.038,
    marginRight: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: width * 0.045,
    marginTop: 40,
  },
});

export default LugaresScreen; 