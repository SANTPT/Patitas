import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAdminsStore = defineStore('admins', () => {
  const admins = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchAdmins() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/admin/users');
      admins.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar los administradores.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createAdminCentro(data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/admin/users', {
        name: data.name,
        email: data.email,
        role: 'admin_centro',
        centroId: data.centroId
      });
      admins.value.push(response.data);
      return { success: true, admin: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el administrador de centro.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateAdminCentro(id, data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/admin/users/${id}`, {
        name: data.name,
        email: data.email,
        centroId: data.centroId
      });
      const idx = admins.value.findIndex(a => a.id === id);
      if (idx !== -1) {
        admins.value[idx] = response.data;
      }
      return { success: true, admin: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar el administrador.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function suspendUser(id, reason) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/admin/users/${id}`, {
        status: 'suspended',
        suspensionReason: reason
      });
      const idx = admins.value.findIndex(a => a.id === id);
      if (idx !== -1) {
        admins.value[idx] = response.data;
      }
      return { success: true, admin: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al suspender al usuario.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function reactivateUser(id) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/admin/users/${id}`, {
        status: 'active',
        suspensionReason: null
      });
      const idx = admins.value.findIndex(a => a.id === id);
      if (idx !== -1) {
        admins.value[idx] = response.data;
      }
      return { success: true, admin: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al reactivar al usuario.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id, reason) {
    isLoading.value = true;
    error.value = null;
    try {
      // Registrar la razón primero si es necesario, luego eliminar
      await api.patch(`/admin/users/${id}`, {
        status: 'deleted',
        deletionReason: reason
      });
      await api.delete(`/admin/users/${id}`);
      admins.value = admins.value.filter(a => a.id !== id);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar al usuario.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    admins,
    isLoading,
    error,
    fetchAdmins,
    createAdminCentro,
    updateAdminCentro,
    suspendUser,
    reactivateUser,
    deleteUser
  };
});
