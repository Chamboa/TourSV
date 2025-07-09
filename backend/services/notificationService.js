const Notification = require('../models/Notification');
const User = require('../models/User');
const axios = require('axios');

class NotificationService {
  
  // Enviar notificación push usando Expo
  async sendPushNotification(token, title, body, data = {}) {
    try {
      const message = {
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
      };

      const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error enviando notificación push:', error);
      return null;
    }
  }

  // Crear notificación en la base de datos
  async createNotification(userId, tipo, titulo, mensaje, datos = {}) {
    try {
      const notification = new Notification({
        userId,
        tipo,
        titulo,
        mensaje,
        datos
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  // Enviar notificación a un usuario específico
  async sendNotificationToUser(userId, tipo, titulo, mensaje, datos = {}) {
    try {
      // Obtener usuario
      const user = await User.findById(userId);
      if (!user || !user.notificacionesActivas) {
        return null;
      }

      // Verificar preferencias según el tipo
      if (tipo === 'promocion' && !user.preferenciasNotificaciones.promociones) {
        return null;
      }
      if (tipo === 'reservacion' && !user.preferenciasNotificaciones.reservaciones) {
        return null;
      }

      // Crear notificación en BD
      const notification = await this.createNotification(userId, tipo, titulo, mensaje, datos);

      // Enviar push notification si tiene token
      if (user.pushToken) {
        const pushResult = await this.sendPushNotification(
          user.pushToken,
          titulo,
          mensaje,
          {
            notificationId: notification._id.toString(),
            tipo,
            ...datos
          }
        );

        // Marcar como enviada
        if (pushResult) {
          notification.enviada = true;
          await notification.save();
        }
      }

      return notification;
    } catch (error) {
      console.error('Error enviando notificación a usuario:', error);
      throw error;
    }
  }

  // Notificar nueva promoción a todos los clientes
  async notifyNewPromotion(promotion) {
    try {
      // Obtener todos los usuarios clientes con notificaciones activas
      const users = await User.find({
        role: 'user',
        notificacionesActivas: true,
        'preferenciasNotificaciones.promociones': true,
        pushToken: { $exists: true, $ne: null }
      });

      const titulo = '¡Nueva Promoción Disponible!';
      const mensaje = `${promotion.titulo} - ${promotion.lugar}`;

      const promises = users.map(user => 
        this.sendNotificationToUser(
          user._id,
          'promocion',
          titulo,
          mensaje,
          {
            promocionId: promotion._id,
            lugarId: promotion.placeId,
            empresaId: promotion.empresaId
          }
        )
      );

      await Promise.all(promises);
      console.log(`Notificación de promoción enviada a ${users.length} usuarios`);
    } catch (error) {
      console.error('Error notificando nueva promoción:', error);
    }
  }

  // Notificar nueva reservación a la empresa
  async notifyNewReservation(reservation) {
    try {
      // Obtener información del lugar para saber qué empresa notificar
      const Place = require('../models/Place');
      const place = await Place.findById(reservation.placeId);
      
      if (!place || !place.empresaId) {
        return;
      }

      const titulo = '¡Nueva Reservación!';
      const mensaje = `Reservación para ${reservation.nombreContacto} - ${place.nombre}`;

      await this.sendNotificationToUser(
        place.empresaId,
        'reservacion',
        titulo,
        mensaje,
        {
          reservacionId: reservation._id,
          lugarId: reservation.placeId,
          userId: reservation.userId
        }
      );

      console.log('Notificación de reservación enviada a la empresa');
    } catch (error) {
      console.error('Error notificando nueva reservación:', error);
    }
  }

  // Notificar cambio de estado de reservación
  async notifyReservationStatusChange(reservation, nuevoEstado) {
    try {
      const Place = require('../models/Place');
      const place = await Place.findById(reservation.placeId);
      
      if (!place) return;

      const estados = {
        'confirmada': 'confirmada',
        'cancelada': 'cancelada',
        'completada': 'completada'
      };

      const titulo = `Reservación ${estados[nuevoEstado]}`;
      const mensaje = `Tu reservación en ${place.nombre} ha sido ${estados[nuevoEstado]}`;

      // Notificar al cliente
      await this.sendNotificationToUser(
        reservation.userId,
        'reservacion',
        titulo,
        mensaje,
        {
          reservacionId: reservation._id,
          lugarId: reservation.placeId,
          empresaId: place.empresaId
        }
      );

      console.log('Notificación de cambio de estado enviada al cliente');
    } catch (error) {
      console.error('Error notificando cambio de estado:', error);
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        leida: true,
        fechaLeida: new Date()
      });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  // Obtener notificaciones no leídas de un usuario
  async getUnreadNotifications(userId) {
    try {
      return await Notification.find({
        userId,
        leida: false
      }).sort({ fecha: -1 });
    } catch (error) {
      console.error('Error obteniendo notificaciones no leídas:', error);
      throw error;
    }
  }

  // Actualizar token de push de un usuario
  async updatePushToken(userId, pushToken) {
    try {
      await User.findByIdAndUpdate(userId, { pushToken });
    } catch (error) {
      console.error('Error actualizando push token:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 