import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useContentStore = defineStore('content', () => {
  const contents = ref([]);
  const currentContent = ref(null);
  const parentPrivateContent = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchMyContent(authorId) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/content', { params: { authorId } });
      contents.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar tus publicaciones.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPrivateContentForParent(parentId) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get('/content', { params: { parentId } });
      parentPrivateContent.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar recursos de tu centro.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchContentDetails(id) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/content/${id}`);
      currentContent.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar detalles de la publicación.';
      console.error(err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createContent(data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/content', data);
      contents.value.unshift(response.data);
      return { success: true, content: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear la publicación.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateContent(id, data) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.patch(`/content/${id}`, data);
      if (currentContent.value && currentContent.value.id === id) {
        currentContent.value = response.data;
      }
      const idx = contents.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        contents.value[idx] = response.data;
      }
      return { success: true, content: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar la publicación.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteContent(id) {
    isLoading.value = true;
    error.value = null;
    try {
      await api.delete(`/content/${id}`);
      contents.value = contents.value.filter(c => c.id !== id);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar la publicación.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    contents,
    currentContent,
    parentPrivateContent,
    isLoading,
    error,
    fetchMyContent,
    fetchPrivateContentForParent,
    fetchContentDetails,
    createContent,
    updateContent,
    deleteContent
  };
});
