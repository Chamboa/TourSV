import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import LugaresScreen from './LugaresScreen';
import CalendarioScreen from './CalendarioScreen';
import PerfilScreen from './PerfilScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function ClienteTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2E5006',
        tabBarInactiveTintColor: '#A3B65A',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E8F5E9',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          marginHorizontal: 20,
          borderRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explorar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MisViajes') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={focused ? 26 : 24} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }} 
      />
      <Tab.Screen 
        name="Explorar" 
        component={LugaresScreen} 
        options={{ 
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'search' : 'search-outline'} size={focused ? 26 : 24} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }} 
      />
      <Tab.Screen 
        name="MisViajes" 
        component={CalendarioScreen} 
        options={{ 
          tabBarLabel: 'Mis Viajes',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'map' : 'map-outline'} size={focused ? 26 : 24} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{ 
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={focused ? 26 : 24} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2E5006',
  },
}); 