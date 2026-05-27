<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['like-updated']);
const authStore = useAuthStore();

// Formatear fecha
const formattedDate = computed(() => {
  if (!props.post.createdAt) return '';
  const date = new Date(props.post.createdAt);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
});

// Comprobar si el usuario actual le dio like
const isLiked = computed(() => {
  const userToken = localStorage.getItem('patitas_token') || 'anonymous';
  return props.post.likedBy && props.post.likedBy.includes(userToken);
});

// Manejar Like con actualización optimista
async function handleLike() {
  if (!authStore.isAuthenticated) {
    // Si no está autenticado, despachar un evento global para abrir el login modal
    const event = new CustomEvent('show-toast', {
      detail: {
        message: 'Debes iniciar sesión para reaccionar a publicaciones.',
        type: 'info'
      }
    });
    window.dispatchEvent(event);
    
    // Despachar evento para abrir modal login
    window.dispatchEvent(new CustomEvent('open-login-modal'));
    return;
  }

  // Optimistic update
  const userToken = localStorage.getItem('patitas_token') || 'anonymous';
  const originalLikes = props.post.likes;
  const originalLikedBy = [...(props.post.likedBy || [])];

  if (isLiked.value) {
    props.post.likes = Math.max(0, props.post.likes - 1);
    props.post.likedBy = props.post.likedBy.filter(t => t !== userToken);
  } else {
    props.post.likes += 1;
    props.post.likedBy.push(userToken);
  }

  try {
    const res = await api.post(`/posts/${props.post.id}/likes`);
    // Sincronizar con respuesta final del servidor
    props.post.likes = res.data.likes;
    props.post.likedBy = res.data.likedBy;
  } catch (error) {
    // Revertir en caso de error
    props.post.likes = originalLikes;
    props.post.likedBy = originalLikedBy;
    
    const event = new CustomEvent('show-toast', {
      detail: {
        message: 'No se pudo registrar tu reacción. Reintentando...',
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
</script>

<template>
  <article class="post-card">
    <!-- Header -->
    <div class="post-header">
      <img :src="post.author.avatar || getAvatarFallback(post.author.name)" :alt="post.author.name" class="author-avatar" />
      <div class="author-info">
        <h4 class="author-name">{{ post.author.name }}</h4>
        <span class="author-role">{{ post.author.role }}</span>
      </div>
      <div class="post-meta-right">
        <span class="category-tag" :class="post.category.toLowerCase()">{{ post.category }}</span>
        <span class="post-date">{{ formattedDate }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="post-body">
      <RouterLink :to="`/comunidad/${post.id}`" class="post-title-link">
        <h3>{{ post.title }}</h3>
      </RouterLink>
      <div class="post-preview" v-html="post.content"></div>
    </div>

    <!-- Footer -->
    <div class="post-footer">
      <!-- Botón de Like -->
      <button @click="handleLike" class="action-btn like-btn" :class="{ 'is-liked': isLiked }" aria-label="Me gusta">
        <span class="material-symbols-outlined icon">
          {{ isLiked ? 'favorite' : 'favorite' }}
        </span>
        <span class="action-count">{{ post.likes }}</span>
      </button>

      <!-- Botón de Comentarios / Respuestas -->
      <RouterLink :to="`/comunidad/${post.id}`" class="action-btn comment-btn" aria-label="Comentarios">
        <span class="material-symbols-outlined icon">chat_bubble</span>
        <span class="action-count">{{ post.comments ? post.comments.length : 0 }}</span>
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  background: white;
  border-radius: 1.33rem;
  padding: 1.33rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(26, 91, 130, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-mid);
}

/* Header */
.post-header {
  display: flex;
  align-items: center;
  gap: 0.78rem;
}

.author-avatar {
  width: 2.44rem;
  height: 2.44rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--button-purple-soft);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
}

.author-role {
  font-size: 0.78rem;
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
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.56rem;
  border-radius: 5.5rem;
  text-transform: uppercase;
}

/* Colores de categorías */
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
  font-size: 0.75rem;
  opacity: 0.6;
}

/* Body */
.post-body {
  display: flex;
  flex-direction: column;
  gap: 0.44rem;
}

.post-title-link {
  text-decoration: none;
  color: var(--text-blue);
  transition: color 0.15s ease;
}

.post-title-link:hover {
  color: var(--button-purple);
}

.post-body h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.11rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.35;
}

.post-preview {
  font-size: 0.89rem;
  line-height: 1.5;
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.post-footer {
  display: flex;
  gap: 1.11rem;
  border-top: 1px dashed rgba(26, 91, 130, 0.06);
  padding-top: 0.78rem;
  margin-top: 0.22rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.33rem;
  color: #a0aec0;
  padding: 0.22rem 0.44rem;
  border-radius: 0.44rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f7fafc;
  color: var(--text-blue);
}

.action-btn .icon {
  font-size: 1.22rem;
}

.action-count {
  font-size: 0.85rem;
  font-weight: 600;
}

/* Like activo */
.like-btn.is-liked {
  color: #e53e3e;
}

.like-btn.is-liked .icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

.like-btn.is-liked:hover {
  background: rgba(229, 62, 62, 0.05);
}

.comment-btn {
  text-decoration: none;
}

.comment-btn:hover {
  color: var(--button-purple);
  background: rgba(197, 140, 242, 0.05);
}
</style>
