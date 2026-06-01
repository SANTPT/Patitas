import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useModerationStore = defineStore('moderation', () => {
  const deleteRequests = ref([]);
  const pendingStories = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchModerationQueue() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/moderation');
      deleteRequests.value = response.data.deleteRequests || [];
      pendingStories.value = response.data.pendingStories || [];
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar colas de moderación.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function approveDeleteRequest(id) {
    try {
      await api.patch(`/moderation/delete-requests/${id}/approve`);
      deleteRequests.value = deleteRequests.value.filter(r => r.id !== id);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al aprobar eliminación.' };
    }
  }

  async function rejectDeleteRequest(id) {
    try {
      await api.patch(`/moderation/delete-requests/${id}/reject`);
      deleteRequests.value = deleteRequests.value.filter(r => r.id !== id);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al rechazar eliminación.' };
    }
  }

  async function approveStory(id) {
    try {
      await api.patch(`/historias/${id}`, { status: 'publicada' });
      pendingStories.value = pendingStories.value.filter(s => s.id !== id);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al aprobar historia.' };
    }
  }

  async function rejectStory(id) {
    try {
      await api.patch(`/historias/${id}`, { status: 'rechazada' });
      pendingStories.value = pendingStories.value.filter(s => s.id !== id);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al rechazar historia.' };
    }
  }

  return {
    deleteRequests,
    pendingStories,
    isLoading,
    error,
    fetchModerationQueue,
    approveDeleteRequest,
    rejectDeleteRequest,
    approveStory,
    rejectStory
  };
});
