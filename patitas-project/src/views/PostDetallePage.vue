<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const post = ref(null);
const isLoading = ref(true);
const errorMsg = ref('');
const commentText = ref('');
const isSubmittingComment = ref(false);

// Variables de edición/borrado de comentarios
const editingCommentId = ref(null);
const editCommentText = ref('');
const isSubmittingEdit = ref(false);

const postId = computed(() => route.params.id);

async function fetchPost() {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.get(`/posts/${postId.value}`);
    post.value = res.data;
  } catch (err) {
    errorMsg.value = 'No se pudo cargar la publicación. Quizá no exista o se eliminó.';
  } finally {
    isLoading.value = false;
  }
}

// Formatear fechas
function formatDate(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Comprobar si el usuario actual le dio like
const isLiked = computed(() => {
  const userToken = localStorage.getItem('patitas_token') || 'anonymous';
  return post.value?.likedBy && post.value.likedBy.includes(userToken);
});

// Manejar Like con actualización optimista
async function handleLike() {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: {
        redirect: route.fullPath,
        message: 'Debes iniciar sesión para participar en la comunidad'
      }
    });
    return;
  }

  // Optimistic update
  const userToken = localStorage.getItem('patitas_token') || 'anonymous';
  const originalLikes = post.value.likes;
  const originalLikedBy = [...post.value.likedBy];

  if (isLiked.value) {
    post.value.likes = Math.max(0, post.value.likes - 1);
    post.value.likedBy = post.value.likedBy.filter(t => t !== userToken);
  } else {
    post.value.likes += 1;
    post.value.likedBy.push(userToken);
  }

  try {
    const res = await api.post(`/posts/${post.value.id}/likes`);
    post.value.likes = res.data.likes;
    post.value.likedBy = res.data.likedBy;
  } catch (error) {
    post.value.likes = originalLikes;
    post.value.likedBy = originalLikedBy;
  }
}

// Enviar Comentario
async function submitComment() {
  if (!commentText.value.trim()) return;

  isSubmittingComment.value = true;
  try {
    const res = await api.post(`/posts/${post.value.id}/comments`, {
      content: commentText.value.trim()
    });

    post.value.comments.push(res.data);
    commentText.value = '';
    
    const event = new CustomEvent('show-toast', {
      detail: {
        message: '¡Tu respuesta ha sido publicada!',
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  } catch (err) {
    const event = new CustomEvent('show-toast', {
      detail: {
        message: 'Error al publicar el comentario. Reintenta.',
        type: 'error'
      }
    });
    window.dispatchEvent(event);
  } finally {
    isSubmittingComment.value = false;
  }
}

function openLogin() {
  router.push({
    path: '/login',
    query: {
      redirect: route.fullPath,
      message: 'Debes iniciar sesión para participar en la comunidad'
    }
  });
}

// Comprobar si el comentario es propio
function isMyComment(comment) {
  if (!authStore.isAuthenticated || !authStore.user || !comment || !comment.author) return false;
  
  if (comment.author.email && authStore.user.email) {
    return comment.author.email.toLowerCase() === authStore.user.email.toLowerCase();
  }
  if (comment.author.id && authStore.user.id) {
    return comment.author.id === authStore.user.id;
  }
  return comment.author.name === authStore.user.name;
}

function startEdit(comment) {
  editingCommentId.value = comment.id;
  editCommentText.value = comment.content;
}

function cancelEdit() {
  editingCommentId.value = null;
  editCommentText.value = '';
}

async function saveEdit(commentId) {
  if (!editCommentText.value.trim()) return;

  isSubmittingEdit.value = true;
  try {
    const res = await api.put(`/posts/${post.value.id}/comments/${commentId}`, {
      content: editCommentText.value.trim()
    });

    const index = post.value.comments.findIndex(c => c.id === commentId);
    if (index !== -1) {
      post.value.comments[index].content = res.data.content;
    }
    
    cancelEdit();
    
    const event = new CustomEvent('show-toast', {
      detail: {
        message: '¡Respuesta editada con éxito!',
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  } catch (err) {
    const event = new CustomEvent('show-toast', {
      detail: {
        message: 'Error al editar la respuesta. Reintenta.',
        type: 'error'
      }
    });
    window.dispatchEvent(event);
  } finally {
    isSubmittingEdit.value = false;
  }
}

async function deleteComment(commentId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

  try {
    await api.delete(`/posts/${post.value.id}/comments/${commentId}`);

    post.value.comments = post.value.comments.filter(c => c.id !== commentId);

    const event = new CustomEvent('show-toast', {
      detail: {
        message: '¡Respuesta eliminada!',
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  } catch (err) {
    const event = new CustomEvent('show-toast', {
      detail: {
        message: 'Error al eliminar el comentario. Reintenta.',
        type: 'error'
      }
    });
    window.dispatchEvent(event);
  }
}

// Generar Avatar SVG estético de forma dinámica a partir de las iniciales de un nombre
function getAvatarFallback(name) {
  const colors = [
    '#c58cf2', // Morado patitas
    '#5bbfd6', // Azul patitas
    '#f6ad55', // Naranja
    '#fc8181', // Rosa
    '#4fd1c5', // Cerceta
    '#68d391', // Verde
    '#63b3ed'  // Celeste
  ];
  
  const parts = (name || 'P').trim().split(/\s+/);
  const initials = parts.length > 1 
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <circle cx='50' cy='50' r='50' fill='${color.replace('#', '%23')}'/>
    <text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${svg}`;
}

onMounted(() => {
  fetchPost();
});
</script>

<template>
  <div class="post-detail-page container">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Navegación secundaria">
      <RouterLink to="/comunidad">Comunidad</RouterLink>
      <span class="separator">/</span>
      <span class="current">Publicación</span>
    </nav>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando publicación...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="error-state">
      <span class="material-symbols-outlined error-icon">sentiment_dissatisfied</span>
      <p>{{ errorMsg }}</p>
      <RouterLink to="/comunidad" class="back-btn">Volver al foro</RouterLink>
    </div>

    <!-- Detalle de Post -->
    <div v-else class="detail-container">
      <!-- Post principal -->
      <article class="main-post-card">
        <header class="post-header">
          <img :src="post.author.avatar || getAvatarFallback(post.author.name)" :alt="post.author.name" class="author-avatar" />
          <div class="author-info">
            <h4 class="author-name">{{ post.author.name }}</h4>
            <span class="author-role">{{ post.author.role }}</span>
          </div>
          <div class="post-meta-right">
            <span class="category-tag" :class="post.category.toLowerCase()">{{ post.category }}</span>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </header>

        <div class="post-body">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-content" v-html="post.content"></div>
        </div>

        <footer class="post-footer">
          <button @click="handleLike" class="like-btn" :class="{ 'is-liked': isLiked }">
            <span class="material-symbols-outlined">favorite</span>
            <span>{{ post.likes }} {{ post.likes === 1 ? 'Reacción' : 'Reacciones' }}</span>
          </button>
        </footer>
      </article>

      <!-- Sección de Comentarios -->
      <section class="comments-section">
        <h2 class="section-title">
          <span class="material-symbols-outlined">forum</span>
          Respuestas ({{ post.comments.length }})
        </h2>

        <!-- Listado de comentarios -->
        <div class="comments-list">
          <div v-if="post.comments.length === 0" class="no-comments">
            <p>Todavía no hay respuestas. ¡Sé el primero en iniciar la conversación!</p>
          </div>
          <div v-else v-for="comment in post.comments" :key="comment.id" class="comment-card">
            <header class="comment-header">
              <img :src="comment.author.avatar || getAvatarFallback(comment.author.name)" :alt="comment.author.name" class="comment-avatar" />
              <div class="comment-author-info">
                <h5>{{ comment.author.name }}</h5>
                <span>{{ comment.author.role }}</span>
              </div>
              <div class="comment-header-right">
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                <div v-if="isMyComment(comment) && editingCommentId !== comment.id" class="comment-actions">
                  <button @click="startEdit(comment)" class="action-btn edit" title="Editar comentario">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button @click="deleteComment(comment.id)" class="action-btn delete" title="Borrar comentario">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </header>
            <div class="comment-content">
              <div v-if="editingCommentId === comment.id" class="edit-comment-wrapper">
                <textarea 
                  v-model="editCommentText"
                  rows="3"
                  class="edit-textarea"
                  :disabled="isSubmittingEdit"
                  placeholder="Edita tu respuesta..."
                ></textarea>
                <div class="edit-actions-row">
                  <button 
                    type="button"
                    @click="cancelEdit" 
                    class="btn-cancel" 
                    :disabled="isSubmittingEdit"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    @click="saveEdit(comment.id)" 
                    class="btn-save" 
                    :disabled="isSubmittingEdit || !editCommentText.trim()"
                  >
                    <span v-if="isSubmittingEdit" class="spinner-small"></span>
                    <span>{{ isSubmittingEdit ? 'Guardando...' : 'Guardar' }}</span>
                  </button>
                </div>
              </div>
              <p v-else>{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <!-- Formulario para agregar comentarios -->
        <div class="add-comment-wrapper">
          <div v-if="!authStore.isAuthenticated" class="auth-required-banner">
            <h3>¿Quieres unirte a la conversación?</h3>
            <p>Debes iniciar sesión para participar en el foro de la comunidad Patitas.</p>
            <button @click="openLogin" class="login-action-btn">
              Iniciar Sesión
            </button>
          </div>
          <form v-else @submit.prevent="submitComment" class="comment-form">
            <div class="form-group">
              <label for="new-comment">Tu respuesta</label>
              <textarea 
                id="new-comment"
                v-model="commentText"
                rows="4"
                placeholder="Escribe un consejo respetuoso o comparte tu experiencia aquí..."
                required
                :disabled="isSubmittingComment"
              ></textarea>
            </div>
            <button type="submit" class="submit-comment-btn" :disabled="isSubmittingComment || !commentText.trim()">
              <span v-if="isSubmittingComment" class="spinner-small"></span>
              <span>{{ isSubmittingComment ? 'Publicando...' : 'Enviar Respuesta' }}</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.post-detail-page {
  padding-top: 1.55rem;
  padding-bottom: 3.33rem;
  min-height: 70vh;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.44rem;
  font-size: 0.83rem;
  color: var(--text-blue);
  margin-bottom: 1.55rem;
}

.breadcrumbs a {
  opacity: 0.7;
  font-weight: 500;
  transition: opacity 0.2s;
}

.breadcrumbs a:hover {
  opacity: 1;
}

.breadcrumbs .separator {
  opacity: 0.4;
}

.breadcrumbs .current {
  font-weight: 700;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3.33rem 1.11rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: var(--shadow-soft);
}

.spinner {
  width: 2.22rem;
  height: 2.22rem;
  border: 3px solid var(--button-purple-soft);
  border-bottom-color: var(--button-purple);
  border-radius: 50%;
  animation: rotation 1s linear infinite;
  margin-bottom: 0.89rem;
}

.error-icon {
  font-size: 3.33rem;
  color: #e53e3e;
  margin-bottom: 0.89rem;
}

.back-btn {
  margin-top: 1.11rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  padding: 0.56rem 1.33rem;
  border-radius: 5.5rem;
  box-shadow: var(--shadow-purple);
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

/* Detail Container */
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.78rem;
}

/* Post Card */
.main-post-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.78rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.89rem;
  border-bottom: 1px dashed rgba(26, 91, 130, 0.06);
  padding-bottom: 1.11rem;
  margin-bottom: 1.33rem;
}

.author-avatar {
  width: 2.89rem;
  height: 2.89rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--button-purple-soft);
}

.author-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
}

.author-role {
  font-size: 0.83rem;
  opacity: 0.75;
}

.post-meta-right {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.22rem;
}

.category-tag {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.22rem 0.67rem;
  border-radius: 5.5rem;
  text-transform: uppercase;
}

.category-tag.consejos {
  background-color: rgba(197, 140, 242, 0.12);
  color: var(--button-purple);
}

.category-tag.dudas {
  background-color: rgba(229, 62, 62, 0.08);
  color: #e53e3e;
}

.category-tag.general {
  background-color: rgba(49, 151, 149, 0.08);
  color: #319795;
}

.post-date {
  font-size: 0.78rem;
  opacity: 0.6;
}

.post-body {
  margin-bottom: 1.55rem;
}

.post-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.post-content {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.95;
}

.post-content :deep(p) {
  margin-bottom: 0.89rem;
}

.post-footer {
  border-top: 1px dashed rgba(26, 91, 130, 0.06);
  padding-top: 1.11rem;
}

.like-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.44rem;
  color: #a0aec0;
  padding: 0.44rem 1rem;
  border-radius: 5.5rem;
  transition: all 0.2s ease;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.89rem;
}

.like-btn:hover {
  background: rgba(229, 62, 62, 0.03);
  color: var(--text-blue);
  border-color: #cbd5e0;
}

.like-btn.is-liked {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.05);
  border-color: rgba(229, 62, 62, 0.2);
}

.like-btn.is-liked .material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

/* Comments Section */
.comments-section {
  background: white;
  border-radius: 1.5rem;
  padding: 1.78rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.22rem;
  font-weight: 700;
  color: var(--text-blue);
  display: flex;
  align-items: center;
  gap: 0.44rem;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 0.78rem;
  margin: 0 0 1.33rem 0;
}

.no-comments {
  text-align: center;
  padding: 1.78rem 0;
  opacity: 0.7;
  font-size: 0.89rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.11rem;
  margin-bottom: 2rem;
}

.comment-card {
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.11rem;
  border: 1px solid #edf2f7;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.67rem;
  margin-bottom: 0.67rem;
}

.comment-avatar {
  width: 2.11rem;
  height: 2.11rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--button-purple-soft);
}

.comment-author-info h5 {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.89rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
}

.comment-author-info span {
  font-size: 0.72rem;
  opacity: 0.7;
}

.comment-date {
  font-size: 0.72rem;
  opacity: 0.5;
}

/* Acciones y edición de comentarios */
.comment-header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.33rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
  color: #a0aec0;
}

.action-btn:hover {
  background-color: #edf2f7;
}

.action-btn.edit:hover {
  color: var(--button-purple);
}

.action-btn.delete:hover {
  color: #e53e3e;
}

.action-btn span {
  font-size: 1.1rem;
}

.edit-comment-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
}

.edit-textarea {
  width: 100%;
  font-family: inherit;
  font-size: 0.89rem;
  padding: 0.67rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.67rem;
  outline: none;
  resize: vertical;
  color: var(--text-blue);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.edit-textarea:focus {
  border-color: var(--button-purple);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.15);
}

.edit-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel {
  background: #edf2f7;
  color: #4a5568;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 1.5rem;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: var(--button-purple);
  color: white;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 1.5rem;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  gap: 0.33rem;
  box-shadow: var(--shadow-purple);
}

.btn-save:hover:not(:disabled) {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.comment-content p {
  font-size: 0.89rem;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
}

/* Add Comment Form */
.add-comment-wrapper {
  border-top: 1px dashed rgba(26, 91, 130, 0.08);
  padding-top: 1.55rem;
}

.auth-required-banner {
  background: #f7fafc;
  border: 1px dashed #cbd5e0;
  border-radius: 1rem;
  padding: 1.55rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.44rem;
}

.auth-required-banner h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.11rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
}

.auth-required-banner p {
  font-size: 0.85rem;
  opacity: 0.75;
  margin: 0 0 0.44rem 0;
}

.login-action-btn {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.89rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.56rem 1.33rem;
  cursor: pointer;
  box-shadow: var(--shadow-purple);
  transition: all 0.2s;
}

.login-action-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.89rem;
}

.comment-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.33rem;
}

.comment-form label {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.89rem;
  font-weight: 700;
  color: var(--text-blue);
}

.comment-form textarea {
  font-family: inherit;
  font-size: 0.89rem;
  padding: 0.78rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.78rem;
  outline: none;
  resize: vertical;
  color: var(--text-blue);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.comment-form textarea:focus {
  border-color: var(--button-purple);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.15);
}

.comment-form textarea:disabled {
  background: #f7fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

.submit-comment-btn {
  align-self: flex-end;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.89rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.56rem 1.33rem;
  cursor: pointer;
  box-shadow: var(--shadow-purple);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.44rem;
}

.submit-comment-btn:hover:not(:disabled) {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

.submit-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.spinner-small {
  width: 0.78rem;
  height: 0.78rem;
  border: 2px solid white;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
