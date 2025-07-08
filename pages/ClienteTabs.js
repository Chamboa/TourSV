import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import LugaresScreen from './LugaresScreen';
import FavoritosScreen from './FavoritosScreen';
import CalendarioScreen from './CalendarioScreen';
import PromocionesClienteScreen from './PromocionesClienteScreen';
import ReservacionesClienteScreen from './ReservacionesClienteScreen';
import PerfilScreen from './PerfilScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function ClienteTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0984A3',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Ionicons name="home" size={size} color={color} />;
          if (route.name === 'Lugares') return <Ionicons name="location" size={size} color={color} />;
          if (route.name === 'Favoritos') return <Ionicons name="heart" size={size} color={color} />;
          if (route.name === 'Calendario') return <Ionicons name="calendar" size={size} color={color} />;
          if (route.name === 'Promociones') return <Ionicons name="pricetags" size={size} color={color} />;
          if (route.name === 'Reservaciones') return <Ionicons name="bookmark" size={size} color={color} />;
          if (route.name === 'Perfil') return <Ionicons name="person" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Lugares" component={LugaresScreen} options={{ tabBarLabel: 'Lugares' }} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} options={{ tabBarLabel: 'Favoritos' }} />
      <Tab.Screen name="Calendario" component={CalendarioScreen} options={{ tabBarLabel: 'Calendario' }} />
      <Tab.Screen name="Promociones" component={PromocionesClienteScreen} options={{ tabBarLabel: 'Promos' }} />
      <Tab.Screen name="Reservaciones" component={ReservacionesClienteScreen} options={{ tabBarLabel: 'Reservas' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
} 