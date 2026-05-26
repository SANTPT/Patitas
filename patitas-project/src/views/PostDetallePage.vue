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
    const event = new CustomEvent('show-toast', {
      detail: {
        message: 'Debes iniciar sesión para reaccionar a publicaciones.',
        type: 'info'
      }
    });
    window.dispatchEvent(event);
    
    // Abrir login modal
    window.dispatchEvent(new CustomEvent('open-login-modal'));
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
  window.dispatchEvent(new CustomEvent('open-login-modal'));
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
          <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
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
              <img :src="comment.author.avatar" :alt="comment.author.name" class="comment-avatar" />
              <div class="comment-author-info">
                <h5>{{ comment.author.name }}</h5>
                <span>{{ comment.author.role }}</span>
              </div>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </header>
            <div class="comment-content">
              <p>{{ comment.content }}</p>
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
  margin-left: auto;
  font-size: 0.72rem;
  opacity: 0.5;
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
