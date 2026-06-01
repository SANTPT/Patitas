import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useEventsStore = defineStore('events', () => {
  const events = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchEvents(userCentroId = null) {
    isLoading.value = true;
    error.value = null;
    try {
      const params = userCentroId ? { userCentroId } : {};
      const response = await api.get('/eventos', { params });
      events.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar eventos.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createEvent(data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/eventos', data);
      events.value.push(response.data);
      return { success: true, event: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear evento.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function enrollEvent(id, email) {
    try {
      const response = await api.post(`/eventos/${id}/inscripcion`, { email });
      const idx = events.value.findIndex(e => e.id === id);
      if (idx !== -1) {
        events.value[idx] = response.data;
      }
      return { success: true, event: response.data };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al inscribirse.' };
    }
  }

  async function unenrollEvent(id, email) {
    try {
      const response = await api.delete(`/eventos/${id}/inscripcion`, { params: { email } });
      const idx = events.value.findIndex(e => e.id === id);
      if (idx !== -1) {
        events.value[idx] = response.data;
      }
      return { success: true, event: response.data };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al cancelar inscripción.' };
    }
  }

  async function deleteEvent(id) {
    isLoading.value = true;
    try {
      await api.delete(`/eventos/${id}`);
      events.value = events.value.filter(e => e.id !== id);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al eliminar evento.' };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    enrollEvent,
    unenrollEvent,
    deleteEvent
  };
});
