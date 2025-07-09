import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePushToken } from '../pages/api';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationHandler({ navigation }) {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Escuchar notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Escuchar cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuario tocó notificación:', response);
      handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Registrar para notificaciones push
  const registerForPushNotificationsAsync = async () => {
    try {
      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación no otorgados');
        return;
      }

      // Obtener token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Reemplazar con tu project ID
      })).data;

      console.log('Push token:', token);

      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('pushToken', token);

      // Obtener usuario actual y actualizar token en el backend
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        try {
          await updatePushToken(user.id, token);
          console.log('Token actualizado en el backend');
        } catch (error) {
          console.error('Error actualizando token en backend:', error);
        }
      }

      // Configurar notificaciones para Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error registrando notificaciones:', error);
    }
  };

  // Manejar respuesta a notificación
  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    
    if (data.tipo === 'promocion' && data.promocionId) {
      // Navegar a la promoción
      navigation.navigate('Promociones', { 
        promocionId: data.promocionId 
      });
    } else if (data.tipo === 'reservacion' && data.reservacionId) {
      // Navegar a la reservación
      if (data.empresaId) {
        // Si es empresa, ir a reservaciones de empresa
        navigation.navigate('Reservaciones', { 
          reservacionId: data.reservacionId 
        });
      } else {
        // Si es cliente, ir a reservaciones de cliente
        navigation.navigate('Reservaciones', { 
          reservacionId: data.reservacionId 
        });
      }
    }
  };

  return null; // Este componente no renderiza nada
}

// Función para enviar notificación local (para testing)
export const sendLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Enviar inmediatamente
  });
};

// Función para cancelar todas las notificaciones
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Función para obtener el token actual
export const getCurrentPushToken = async () => {
  return await AsyncStorage.getItem('pushToken');
}; 