import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useCentersStore = defineStore('centers', () => {
  const centers = ref([]);
  const currentCenter = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchCenters() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/centros');
      centers.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar centros.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCenterById(id) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/centros/${id}`);
      currentCenter.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar el centro.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createCenter(data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/centros', data);
      centers.value.push(response.data);
      return { success: true, center: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear centro.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCenter(id, data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/centros/${id}`, data);
      const idx = centers.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        centers.value[idx] = response.data;
      }
      if (currentCenter.value && currentCenter.value.id === id) {
        currentCenter.value = response.data;
      }
      return { success: true, center: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar centro.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleCenterStatus(id, newStatus) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/centros/${id}/status`, { status: newStatus });
      const idx = centers.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        centers.value[idx] = response.data;
      }
      if (currentCenter.value && currentCenter.value.id === id) {
        currentCenter.value = response.data;
      }
      return { success: true, center: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cambiar estado del centro.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    centers,
    currentCenter,
    isLoading,
    error,
    fetchCenters,
    fetchCenterById,
    createCenter,
    updateCenter,
    toggleCenterStatus
  };
});
