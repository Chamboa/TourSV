import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import SplashScreen from './pages/SplashScreen.js';
import LoginScreen from './pages/LoginScreen.js';
import LoginFormScreen from './pages/LoginFormScreen.js';
import RegisterScreen from './pages/RegisterScreen.js';
import AdminPanelScreen from './pages/AdminPanelScreen';
import EmpresaTabs from './pages/EmpresaTabs';
import ClienteTabs from './pages/ClienteTabs';
import { FavoritosProvider } from './pages/FavoritosContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import DetallesLugarScreen from './pages/DetallesLugarScreen.js';
import CrearReservacionScreen from './pages/CrearReservacionScreen.js';
import { UserProvider, UserContext } from './pages/UserContext';
import PromocionesScreen from './pages/PromocionesScreen';
import NotificacionesScreen from './pages/NotificacionesScreen';
import EstadisticasScreen from './pages/EstadisticasScreen';
import CrearLugarScreen from './pages/CrearLugarScreen';
import EstadisticasLugarScreen from './pages/EstadisticasLugarScreen';

const Stack = createStackNavigator();

function MainApp() {
  const { user, loading } = React.useContext(UserContext);
  if (loading) return null;
  return (
    <FavoritosProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignIn" component={LoginFormScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="EmpresaTabs" component={EmpresaTabs} />
          <Stack.Screen name="ClienteTabs" component={ClienteTabs} />
          <Stack.Screen name="DetallesLugar" component={DetallesLugarScreen} />
          <Stack.Screen name="CrearReservacion" component={CrearReservacionScreen} />
          <Stack.Screen name="Promociones" component={PromocionesScreen} />
          <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
          <Stack.Screen name="Estadisticas" component={EstadisticasScreen} />
          <Stack.Screen name="CrearLugar" component={CrearLugarScreen} />
          <Stack.Screen name="EstadisticasLugar" component={EstadisticasLugarScreen} />
          {user && user.role === 'admin' && (
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritosProvider>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}
