import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useChildrenStore = defineStore('children', () => {
  const children = ref([]);
  const currentChild = ref(null);
  const sessions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchChildren(filters = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/children', { params: filters });
      children.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar el listado de niños.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchChildDetails(id) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/children/${id}`);
      currentChild.value = response.data;
      await fetchSessions(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar los detalles del niño.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSessions(childId) {
    try {
      const response = await api.get(`/children/${childId}/sessions`);
      sessions.value = response.data;
    } catch (err) {
      console.error('Error al cargar sesiones:', err);
    }
  }

  async function createChild(data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/children', data);
      children.value.push(response.data);
      return { success: true, child: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el perfil del niño.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateChild(id, data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/children/${id}`, data);
      if (currentChild.value && currentChild.value.id === id) {
        currentChild.value = response.data;
      }
      const idx = children.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        children.value[idx] = response.data;
      }
      return { success: true, child: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar el perfil del niño.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function assignProfessional(childId, profesionalId) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/children/${childId}`, { profesionalId });
      if (currentChild.value && currentChild.value.id === childId) {
        currentChild.value = response.data;
      }
      const idx = children.value.findIndex(c => c.id === childId);
      if (idx !== -1) {
        children.value[idx] = response.data;
      }
      return { success: true, child: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al asignar profesional.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function saveSession(childId, sessionData) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post(`/children/${childId}/sessions`, sessionData);
      sessions.value.unshift(response.data);
      return { success: true, session: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar la sesión.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProgress(childId, progressData) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/children/${childId}/progress`, progressData);
      if (currentChild.value && currentChild.value.id === childId) {
        currentChild.value = response.data;
      }
      return { success: true, child: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar el avance de desarrollo.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function linkChildByCode(inviteCode, parentId) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/children/link', { inviteCode, parentId });
      // Si la vinculación tiene éxito, podemos añadirlo a nuestro listado local si es de este padre
      const linkedChild = response.data.child;
      if (!children.value.some(c => c.id === linkedChild.id)) {
        children.value.push(linkedChild);
      }
      return { success: true, child: linkedChild };
    } catch (err) {
      const msg = err.response?.data?.message || 'Código de invitación inválido o expirado.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    children,
    currentChild,
    sessions,
    isLoading,
    error,
    fetchChildren,
    fetchChildDetails,
    createChild,
    updateChild,
    assignProfessional,
    saveSession,
    updateProgress,
    linkChildByCode
  };
});
