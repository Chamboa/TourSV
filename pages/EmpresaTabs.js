import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EmpresaDashboardScreen from './EmpresaDashboardScreen';
import EmpresaPanelScreen from './EmpresaPanelScreen';
import PerfilScreen from './PerfilScreen';
import CrearLugarScreen from './CrearLugarScreen';
import EstadisticasScreen from './EstadisticasScreen';
import PromocionesScreen from './PromocionesScreen';
import ReservacionesEmpresaScreen from './ReservacionesEmpresaScreen';
import NotificacionesScreen from './NotificacionesScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function EmpresaTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0984A3',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <Ionicons name="home" size={size} color={color} />;
          if (route.name === 'MisLugares') return <Ionicons name="business" size={size} color={color} />;
          if (route.name === 'CrearLugar') return <Ionicons name="add-circle" size={size} color={color} />;
          if (route.name === 'Estadisticas') return <Ionicons name="stats-chart" size={size} color={color} />;
          if (route.name === 'Perfil') return <Ionicons name="person" size={size} color={color} />;
          if (route.name === 'Promociones') return <Ionicons name="pricetags" size={size} color={color} />;
          if (route.name === 'Reservaciones') return <Ionicons name="bookmark" size={size} color={color} />;
          if (route.name === 'Notificaciones') return <Ionicons name="notifications" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={EmpresaDashboardScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="MisLugares" component={EmpresaPanelScreen} options={{ tabBarLabel: 'Mis Lugares' }} />
      <Tab.Screen name="CrearLugar" component={CrearLugarScreen} options={{ tabBarLabel: 'Crear Lugar' }} />
      <Tab.Screen name="Estadisticas" component={EstadisticasScreen} options={{ tabBarLabel: 'Estadísticas' }} />
      <Tab.Screen name="Promociones" component={PromocionesScreen} options={{ tabBarLabel: 'Promos' }} />
      <Tab.Screen name="Reservaciones" component={ReservacionesEmpresaScreen} options={{ tabBarLabel: 'Reservas' }} />
      <Tab.Screen name="Notificaciones" component={NotificacionesScreen} options={{ tabBarLabel: 'Notis' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
} 