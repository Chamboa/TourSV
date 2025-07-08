import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFavoritos } from './FavoritosContext';

const { width, height } = Dimensions.get('window');
const userImg = 'https://randomuser.me/api/portraits/women/44.jpg';
const CARD_SIZE = width * 0.92;

const favoritos = [
  {
    nombre: 'Sunset Park',
    dept: 'La Libertad',
    img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/3e/2e/7b/sunset-park.jpg?w=700&h=-1&s=1',
    rating: 5.0,
  },
];

const FavoritosScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const { favoritos, quitarFavorito } = useFavoritos();
  const [isLoading, setIsLoading] = useState(false);
  const favoritosFiltrados = favoritos.filter(item => item.nombre && item.nombre.toLowerCase().includes(search.toLowerCase()));

  const handleSearch = (text) => {
    setIsLoading(true);
    setSearch(text);
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
          onChangeText={handleSearch}
        />
        <TouchableOpacity>
          <Feather name="menu" size={width * 0.07} color="#000" style={{ marginRight: width * 0.025 }} />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        favoritosFiltrados.length === 0 ? (
          <Text style={{ color: '#888', fontSize: width * 0.045, textAlign: 'center', marginTop: 40 }}>No tienes favoritos aún.</Text>
        ) : favoritosFiltrados.map((item, idx) => (
          <View style={styles.card} key={idx}>
            <Image source={{ uri: item.img }} style={styles.cardImg} />
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <Text style={styles.cardDept}>{item.dept}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <TouchableOpacity style={styles.heartBtn} onPress={() => quitarFavorito(item)}>
                  <Ionicons name="heart" size={width * 0.07} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.cardRatingRow}>
                <MaterialIcons name="star" size={width * 0.045} color="#fff" />
                <Text style={styles.cardRating}>{Array.isArray(item.reseñas) && item.reseñas.length > 0 ? (item.reseñas.reduce((acc, r) => acc + (r.rating || 0), 0) / item.reseñas.length).toFixed(1) : '0'}</Text>
              </View>
              <TouchableOpacity style={styles.cardDetailsBtn} onPress={() => navigation.navigate('DetallesLugar', { lugar: { _id: item._id } })}>
                <Text style={styles.cardDetailsText}>Más detalles</Text>
                <Ionicons name="chevron-forward" size={width * 0.045} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))
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
    justifyContent: 'flex-end',
    marginTop: height * 0.045,
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.06,
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
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 0.45,
    borderRadius: width * 0.09,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    marginBottom: width * 0.045,
    alignSelf: 'center',
    marginTop: width * 0.04,
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
    right: width * 0.045,
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
    flex: 1,
  },
  heartBtn: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 100,
    padding: 6,
    marginLeft: 8,
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
});

export default FavoritosScreen; 