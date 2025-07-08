import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function CustomDrawerContent(props) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      // Navegar al login
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    {
      name: 'Inicio',
      icon: 'home-outline',
      screen: user?.role === 'empresa' ? 'EmpresaTabs' : 'ClienteTabs',
      params: { screen: 'Home' }
    },
    {
      name: 'Lugares',
      icon: 'location-outline',
      screen: user?.role === 'empresa' ? 'EmpresaTabs' : 'ClienteTabs',
      params: { screen: 'Lugares' }
    },
    {
      name: 'Favoritos',
      icon: 'heart-outline',
      screen: user?.role === 'empresa' ? 'EmpresaTabs' : 'ClienteTabs',
      params: { screen: 'Favoritos' }
    },
    {
      name: 'Calendario',
      icon: 'calendar-outline',
      screen: user?.role === 'empresa' ? 'EmpresaTabs' : 'ClienteTabs',
      params: { screen: 'Calendario' }
    },
    {
      name: 'Promociones',
      icon: 'pricetags-outline',
      screen: user?.role === 'empresa' ? 'EmpresaTabs' : 'ClienteTabs',
      params: { screen: 'Promociones' }
    },
    {
      name: 'Reservaciones',
      icon: 'bookmark-outline',
      screen: user?.role === 'empresa' ? 'EmpresaTabs' : 'ClienteTabs',
      params: { screen: 'Reservaciones' }
    },
    {
      name: 'Perfil',
      icon: 'person-outline',
      screen: user?.role === 'empresa' ? 'EmpresaTabs' : 'ClienteTabs',
      params: { screen: 'Perfil' }
    },
  ];

  // Agregar elementos específicos para empresas
  if (user?.role === 'empresa') {
    menuItems.splice(2, 0, {
      name: 'Mis Lugares',
      icon: 'business-outline',
      screen: 'EmpresaTabs',
      params: { screen: 'MisLugares' }
    });
    menuItems.splice(3, 0, {
      name: 'Crear Lugar',
      icon: 'add-circle-outline',
      screen: 'EmpresaTabs',
      params: { screen: 'CrearLugar' }
    });
    menuItems.splice(4, 0, {
      name: 'Estadísticas',
      icon: 'stats-chart-outline',
      screen: 'EmpresaTabs',
      params: { screen: 'Estadisticas' }
    });
    menuItems.splice(8, 0, {
      name: 'Notificaciones',
      icon: 'notifications-outline',
      screen: 'EmpresaTabs',
      params: { screen: 'Notificaciones' }
    });
  }

  return (
    <View style={styles.container}>
      {/* Header del Drawer */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'usuario@email.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role === 'empresa' ? 'Empresa' : 'Cliente'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menú de navegación */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate(item.screen, item.params);
              props.navigation.closeDrawer();
            }}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name={item.icon} size={24} color="#333" />
              <Text style={styles.menuItemText}>{item.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer del Drawer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#0984A3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 15,
    fontWeight: '500',
  },
}); 