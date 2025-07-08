import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from './pages/SplashScreen.js';
import LoginScreen from './pages/LoginScreen.js';
import LoginFormScreen from './pages/LoginFormScreen.js';
import RegisterScreen from './pages/RegisterScreen.js';
import EmpresaPanelScreen from './pages/EmpresaPanelScreen';
import AdminPanelScreen from './pages/AdminPanelScreen';
import EmpresaTabs from './pages/EmpresaTabs';
import ClienteTabs from './pages/ClienteTabs';
import { FavoritosProvider } from './pages/FavoritosContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import DetallesLugarScreen from './pages/DetallesLugarScreen.js';
import CrearReservacionScreen from './pages/CrearReservacionScreen.js';
import CustomDrawerContent from './pages/CustomDrawerContent.js';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator para usuarios autenticados
function AuthenticatedDrawer() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      console.log('Usuario leído de AsyncStorage:', u);
      if (u) setUser(JSON.parse(u));
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.7)',
        sceneContainerStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      {user && user.role === 'empresa' ? (
        <Drawer.Screen 
          name="EmpresaTabs" 
          component={EmpresaTabs}
          options={{
            drawerLabel: 'Dashboard',
            title: 'Dashboard Empresa'
          }}
        />
      ) : (
        <Drawer.Screen 
          name="ClienteTabs" 
          component={ClienteTabs}
          options={{
            drawerLabel: 'Dashboard',
            title: 'Dashboard Cliente'
          }}
        />
      )}
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      console.log('Usuario leído de AsyncStorage:', u);
      if (u) setUser(JSON.parse(u));
      setLoading(false);
    })();
  }, []);

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
          <Stack.Screen name="AuthenticatedDrawer" component={AuthenticatedDrawer} />
          <Stack.Screen name="DetallesLugar" component={DetallesLugarScreen} />
          <Stack.Screen name="CrearReservacion" component={CrearReservacionScreen} />
          {user && user.role === 'admin' && (
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritosProvider>
  );
}
