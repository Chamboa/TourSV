const API_URL = 'http://192.168.0.34:4000/api';

function handleApiError(e) {
  return { error: e.message || 'Error de red o servidor' };
}

// Usuarios
export const registerUser = async (name, email, password, role = 'user') => {
  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const getUserProfile = async (id) => {
  try {
    const res = await fetch(`${API_URL}/users/${id}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const updateUserProfile = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

// Lugares
export const getPlaces = async (userId = null) => {
  try {
    const url = userId ? `${API_URL}/places?userId=${userId}` : `${API_URL}/places`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const getPlace = async (id) => {
  try {
    const res = await fetch(`${API_URL}/places/${id}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const createPlace = async (data, userId) => {
  try {
    const res = await fetch(`${API_URL}/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const updatePlace = async (id, data, userId) => {
  try {
    const res = await fetch(`${API_URL}/places/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const deletePlace = async (id, userId) => {
  try {
    const res = await fetch(`${API_URL}/places/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const addReview = async (placeId, review) => {
  try {
    const res = await fetch(`${API_URL}/places/${placeId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

// Favoritos
export const getFavorites = async (usuarioId) => {
  try {
    const res = await fetch(`${API_URL}/favorites/${usuarioId}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const addFavorite = async (usuarioId, lugarId) => {
  try {
    const res = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, lugarId })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const removeFavorite = async (usuarioId, lugarId) => {
  try {
    const res = await fetch(`${API_URL}/favorites`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, lugarId })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

// Eventos (Calendario)
export const getEvents = async (userId) => {
  try {
    const res = await fetch(`${API_URL}/events/${userId}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const createEvent = async (data) => {
  try {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const updateEvent = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

export const deleteEvent = async (id) => {
  try {
    const res = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
};

// PROMOCIONES
export async function getPromotions(empresaId, filters = {}) {
  try {
    const params = new URLSearchParams({ empresaId, ...filters });
    const res = await fetch(`${API_URL}/promotions?${params}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function getPromotionById(id) {
  try {
    const res = await fetch(`${API_URL}/promotions/${id}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function getPromotionsDestacadas() {
  try {
    const res = await fetch(`${API_URL}/promotions/destacadas`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function createPromotion(data) {
  try {
    const res = await fetch(`${API_URL}/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function updatePromotion(id, data) {
  try {
    const res = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function deletePromotion(id) {
  try {
    const res = await fetch(`${API_URL}/promotions/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function usarCuponPromotion(id) {
  try {
    const res = await fetch(`${API_URL}/promotions/${id}/usar-cupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function getAllPromotions(filters = {}) {
  try {
    // Para clientes, solo mostrar promociones activas y no expiradas
    const params = new URLSearchParams({
      ...filters,
      soloActivas: 'true'
    });
    const res = await fetch(`${API_URL}/promotions?${params}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}
// NOTIFICACIONES
export async function getNotifications(empresaId) {
  try {
    const res = await fetch(`${API_URL}/notifications?empresaId=${empresaId}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}
export async function createNotification(data) {
  try {
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}
export async function deleteNotification(id) {
  try {
    const res = await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

export async function getEmpresaEstadisticas(empresaId) {
  try {
    const res = await fetch(`${API_URL}/users2/empresas/${empresaId}/estadisticas`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// ===== RESERVACIONES =====

// Obtener reservaciones del cliente
export async function getClienteReservaciones(userId, filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_URL}/reservations/cliente/${userId}?${params}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// Obtener reservaciones de una empresa
export async function getEmpresaReservaciones(empresaId, filters = {}) {
  try {
    console.log('API: Obteniendo reservaciones para empresa:', empresaId, 'filtros:', filters);
    const params = new URLSearchParams(filters);
    const url = `${API_URL}/reservations/empresa/${empresaId}?${params}`;
    console.log('API: URL de la petición:', url);
    const res = await fetch(url);
    const data = await res.json();
    console.log('API: Respuesta recibida:', data);
    return data;
  } catch (e) {
    console.error('API: Error obteniendo reservaciones:', e);
    return handleApiError(e);
  }
}

// Obtener reservación por ID
export async function getReservationById(id) {
  try {
    const res = await fetch(`${API_URL}/reservations/${id}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// Crear nueva reservación
export async function createReservation(data) {
  try {
    const res = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// Actualizar estado de reservación (empresa)
export async function updateReservationStatus(id, estado, notasEmpresa = '') {
  try {
    const res = await fetch(`${API_URL}/reservations/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, notasEmpresa })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// Cancelar reservación (cliente)
export async function cancelReservation(id) {
  try {
    const res = await fetch(`${API_URL}/reservations/${id}/cancelar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// Calificar reservación completada
export async function rateReservation(id, calificacion, comentarioCliente) {
  try {
    const res = await fetch(`${API_URL}/reservations/${id}/calificar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calificacion, comentarioCliente })
    });
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// Obtener estadísticas de reservaciones para empresa
export async function getReservacionesEstadisticas(empresaId, periodo = 'mes') {
  try {
    const res = await fetch(`${API_URL}/reservations/empresa/${empresaId}/estadisticas?periodo=${periodo}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
}

// Buscar reservación por código de confirmación
export async function getReservationByCode(codigo) {
  try {
    const res = await fetch(`${API_URL}/reservations/codigo/${codigo}`);
    return await res.json();
  } catch (e) {
    return handleApiError(e);
  }
} 