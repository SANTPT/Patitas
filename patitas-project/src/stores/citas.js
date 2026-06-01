import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useCitasStore = defineStore('citas', () => {
  const citas = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchCitas(filters = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/citas', { params: filters });
      citas.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar citas.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createCita(data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/citas', data);
      citas.value.push(response.data);
      return { success: true, cita: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al agendar cita.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCita(id, data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/citas/${id}`, data);
      const idx = citas.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        citas.value[idx] = response.data;
      }
      return { success: true, cita: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al modificar cita.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCita(id) {
    isLoading.value = true;
    error.value = null;
    try {
      await api.delete(`/citas/${id}`);
      citas.value = citas.value.filter(c => c.id !== id);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cancelar cita.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function requestReprogramacion(id, rescheduleProps) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post(`/citas/${id}/reprogramar`, rescheduleProps);
      const idx = citas.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        citas.value[idx] = response.data;
      }
      return { success: true, cita: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al solicitar reprogramación.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function respondReprogramacion(id, approve) {
    isLoading.value = true;
    error.value = null;
    try {
      const subAction = approve ? 'accept' : 'reject';
      const response = await api.patch(`/citas/${id}/reprogramacion/${subAction}`);
      const idx = citas.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        citas.value[idx] = response.data;
      }
      return { success: true, cita: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al responder a la reprogramación.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    citas,
    isLoading,
    error,
    fetchCitas,
    createCita,
    updateCita,
    deleteCita,
    requestReprogramacion,
    respondReprogramacion
  };
});
