import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavorites, addFavorite, removeFavorite } from './api';

const FavoritosContext = createContext();

export const FavoritosProvider = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);
  const [userId, setUserId] = useState(null);

  // Cargar usuario y favoritos al iniciar
  useEffect(() => {
    (async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const { id } = JSON.parse(user);
          setUserId(id);
          const favs = await getFavorites(id);
          setFavoritos(favs.map(f => f.lugarId));
        }
      } catch {}
    })();
  }, []);

  const esFavorito = (lugar) => favoritos.some(f => f._id === lugar._id);

  const agregarFavorito = async (lugar) => {
    if (!userId || esFavorito(lugar)) return;
    await addFavorite(userId, lugar._id);
    setFavoritos([...favoritos, lugar]);
  };

  const quitarFavorito = async (lugar) => {
    if (!userId) return;
    await removeFavorite(userId, lugar._id);
    setFavoritos(favoritos.filter(f => f._id !== lugar._id));
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, esFavorito, agregarFavorito, quitarFavorito }}>
      {children}
    </FavoritosContext.Provider>
  );
};

export const useFavoritos = () => useContext(FavoritosContext); 