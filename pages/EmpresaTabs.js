import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import EmpresaDashboardScreen from './EmpresaDashboardScreen';
import EmpresaPanelScreen from './EmpresaPanelScreen';
import ReservacionesEmpresaScreen from './ReservacionesEmpresaScreen';
import PerfilScreen from './PerfilScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  {
    name: 'Inicio',
    component: EmpresaDashboardScreen,
    icon: 'home',
  },
  {
    name: 'Lugares',
    component: EmpresaPanelScreen,
    icon: 'business',
  },
  {
    name: 'Reservas',
    component: ReservacionesEmpresaScreen,
    icon: 'bookmark',
  },
  {
    name: 'Perfil',
    component: PerfilScreen,
    icon: 'person',
  },
];

export default function EmpresaTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
        headerShown: false,
        tabBarActiveTintColor: '#2E5006',
        tabBarInactiveTintColor: '#A3B65A',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E8F5E9',
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
          elevation: 8,
            borderRadius: 20,
            marginHorizontal: 16,
          position: 'absolute',
          left: 0,
          right: 0,
            bottom: 16,
        },
        tabBarLabelStyle: {
            fontSize: 13,
          fontWeight: '600',
        },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? tab.icon : tab.icon + '-outline'}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        };
      }}
    >
      {TABS.map(tab => (
      <Tab.Screen 
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ tabBarLabel: tab.name }}
        />
      ))}
    </Tab.Navigator>
  );
}