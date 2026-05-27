<template>
  <div class="article-container">
    <!-- Spinner de carga -->
    <div v-if="loading" class="loader-wrap">
      <div class="spinner"></div>
      <p>Cargando artículo...</p>
    </div>

    <div v-else-if="!article" class="no-article">
      <span class="material-symbols-outlined no-article-icon">error</span>
      <h3>Artículo no encontrado</h3>
      <p>El artículo que buscas no existe o ha sido retirado.</p>
      <button @click="goBack" class="back-btn">Volver al Blog</button>
    </div>

    <!-- Contenido del Artículo -->
    <div v-else class="article-layout">
      <!-- Botón de retroceso -->
      <button @click="goBack" class="back-link-btn">
        <span class="material-symbols-outlined">arrow_back</span>
        Volver al Blog
      </button>

      <!-- Encabezado del Artículo -->
      <header class="article-header">
        <span class="category-badge" :class="article.category">{{ article.categoryLabel }}</span>
        <h1 class="article-title">{{ article.title }}</h1>
        
        <div class="header-meta">
          <div class="author-info">
            <div class="author-avatar" :style="{ backgroundColor: getAuthorColor(article.author) }">
              {{ getInitials(article.author) }}
            </div>
            <div class="author-details">
              <span class="author-name">{{ article.author }}</span>
              <span class="author-role">Especialista Patitas</span>
            </div>
          </div>

          <div class="meta-right">
            <span class="meta-date">
              <span class="material-symbols-outlined">calendar_today</span>
              {{ formatDate(article.date) }}
            </span>
            <span class="meta-readtime">
              <span class="material-symbols-outlined">schedule</span>
              Lectura: {{ readTime }} min
            </span>
          </div>
        </div>
      </header>

      <!-- Imagen Destacada -->
      <div class="featured-image-wrap">
        <img :src="article.image" :alt="article.title" class="featured-image" />
      </div>

      <!-- Grid de Contenido Principal -->
      <div class="content-grid">
        <!-- Columna de Contenido -->
        <main class="article-body">
          <div class="article-text" v-html="article.content"></div>
        </main>

        <!-- Columna de Acciones Lateral (Escritorio) o Inferior (Móvil) -->
        <aside class="article-sidebar">
          <div class="sidebar-card">
            <!-- Acción de Guardar -->
            <button 
              @click="toggleSave" 
              :class="['action-btn', 'save-btn', { active: isSaved }]"
            >
              <span class="material-symbols-outlined">{{ isSaved ? 'bookmark_added' : 'bookmark' }}</span>
              <span>{{ isSaved ? 'Guardado en tu perfil' : 'Guardar este artículo' }}</span>
            </button>

            <div class="share-section">
              <h4 class="share-title">Compartir artículo</h4>
              <div class="share-buttons">
                <!-- Compartir Nativo (si está disponible) -->
                <button v-if="canShare" @click="shareNative" class="share-btn native" title="Compartir">
                  <span class="material-symbols-outlined">share</span>
                </button>
                <!-- Facebook -->
                <a :href="shareUrls.facebook" target="_blank" rel="noopener noreferrer" class="share-btn facebook" title="Facebook">
                  <svg viewBox="0 0 24 24" class="share-svg"><path d="M14 13.5h2.5l1-3H14V8.5c0-.8.2-1.3 1.3-1.3H17v-2.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H8v3h2.3V21h3.7v-7.5z"/></svg>
                </a>
                <!-- X / Twitter -->
                <a :href="shareUrls.x" target="_blank" rel="noopener noreferrer" class="share-btn x" title="X">
                  <svg viewBox="0 0 24 24" class="share-svg"><path d="M18.2 2.4h3.3L14.3 11l8.5 11.3h-6.7L10.8 15.3l-6 7H1.5L9 13.8 1 2.4h6.9l4.7 6.2 5.6-6.2zm-1.2 17.6h1.8L7.1 4.5H5.1L17 20z"/></svg>
                </a>
                <!-- WhatsApp -->
                <a :href="shareUrls.whatsapp" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp" title="WhatsApp">
                  <svg viewBox="0 0 24 24" class="share-svg"><path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.77.462 3.498 1.332 5.022L2 22l5.148-1.35c1.47.8 3.12 1.218 4.812 1.218 5.532 0 10.014-4.482 10.014-10.012C22.018 6.48 17.544 2 12.012 2zm5.72 13.788c-.246.69-1.2 1.26-1.638 1.302-.378.036-.882.066-2.532-.6-2.112-.852-3.486-3.006-3.594-3.15-.102-.144-.834-1.11-1.026-1.926a2.034 2.034 0 01.594-1.572c.162-.162.36-.204.48-.204.09 0 .18 0 .258.006.078.006.186-.03.288.222.108.258.372.906.402.972.036.066.06.144.012.246-.048.102-.072.162-.15.252-.072.09-.156.204-.222.27-.078.078-.162.162-.066.324.09.156.408.672.876 1.092.6.534 1.104.702 1.26.78.156.078.246.066.336-.036.09-.102.39-.456.492-.612.108-.156.216-.126.366-.072.156.054.984.462 1.152.546.168.084.282.126.324.198.042.072.042.42-.204 1.11z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- Sección Artículos Relacionados -->
      <section class="related-section">
        <h3 class="related-title">Artículos recomendados</h3>
        <div class="related-grid">
          <article 
            v-for="related in relatedArticles" 
            :key="related.id" 
            class="related-card"
            @click="goToArticle(related.slug)"
          >
            <div class="r-img-wrap">
              <img :src="related.image" :alt="related.title" class="r-img" />
              <span class="r-category" :class="related.category">{{ related.categoryLabel }}</span>
            </div>
            <div class="r-body">
              <h4 class="r-title">{{ related.title }}</h4>
              <span class="r-date">{{ formatDate(related.date) }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const article = ref(null);
const relatedArticles = ref([]);

const canShare = ref(false);
const currentUrl = ref('');

onMounted(() => {
  canShare.value = !!navigator.share;
  currentUrl.value = window.location.href;
});

const readTime = computed(() => {
  if (!article.value || !article.value.content) return 1;
  const cleanText = article.value.content.replace(/<\/?[^>]+(>|$)/g, ""); // Quitar tags HTML
  const wordCount = cleanText.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
});

const isSaved = computed(() => {
  if (!authStore.user || !authStore.user.savedResources || !article.value) return false;
  return authStore.user.savedResources.includes(article.value.id);
});

const shareUrls = computed(() => {
  const urlStr = encodeURIComponent(currentUrl.value);
  const titleStr = article.value ? encodeURIComponent(article.value.title) : '';
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${urlStr}`,
    x: `https://twitter.com/intent/tweet?url=${urlStr}&text=${titleStr}`,
    whatsapp: `https://api.whatsapp.com/send?text=${titleStr}%20${urlStr}`
  };
});

const fetchArticleData = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/blog/${route.params.slug}`);
    article.value = response.data;
    
    // Set dynamic SEO tags
    document.title = `${article.value.title} | Blog Patitas`;
    
    // Set Open Graph tags
    updateMetaTag('og:title', article.value.title);
    updateMetaTag('og:description', article.value.description);
    
    // Fetch related articles
    await fetchRelated(article.value.id);
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    article.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchRelated = async (currentId) => {
  try {
    const response = await api.get('/blog');
    relatedArticles.value = response.data
      .filter(art => art.id !== currentId)
      .slice(0, 3);
  } catch (error) {
    console.error('Error al obtener recomendados:', error);
  }
};

const toggleSave = async () => {
  if (!authStore.isAuthenticated) {
    window.dispatchEvent(new CustomEvent('open-login-modal'));
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Inicia sesión para poder guardar artículos.', type: 'info' }
    }));
    return;
  }

  const willSave = !isSaved.value;
  let updatedList;
  if (isSaved.value) {
    updatedList = authStore.user.savedResources.filter(id => id !== article.value.id);
  } else {
    updatedList = [...(authStore.user.savedResources || []), article.value.id];
  }

  const result = await authStore.updateProfile({
    savedResources: updatedList
  });

  if (result.success) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: willSave ? 'Artículo guardado en tu perfil.' : 'Artículo eliminado de tus guardados.', 
        type: 'success' 
      }
    }));
  } else {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Error al actualizar artículos guardados.', type: 'error' }
    }));
  }
};

const shareNative = () => {
  if (navigator.share) {
    navigator.share({
      title: article.value.title,
      text: article.value.description,
      url: currentUrl.value
    }).catch(err => console.log('Error sharing:', err));
  }
};

const updateMetaTag = (property, content) => {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getInitials = (name) => {
  if (!name) return 'A';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    if (parts[0].endsWith('.') && parts.length > 2) {
      return (parts[1][0] + parts[2][0]).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const getAuthorColor = (name) => {
  if (!name) return '#c58cf2';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#c58cf2', '#5bbfd6', '#f6ad55', '#4fd1c5', '#fc8181', '#90cdf4'];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const goBack = () => {
  router.push('/blog');
};

const goToArticle = (slug) => {
  router.push(`/blog/${slug}`);
};

watch(() => route.params.slug, () => {
  fetchArticleData();
  currentUrl.value = window.location.href;
});

onMounted(() => {
  fetchArticleData();
});
</script>

<style scoped>
.article-container {
  max-width: 55rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem 1.5rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
}

/* Spinner */
.loader-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  gap: 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(197, 140, 242, 0.1);
  border-left-color: var(--button-purple, #c58cf2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* No Article */
.no-article {
  text-align: center;
  padding: 5rem 1.5rem;
}

.no-article-icon {
  font-size: 4rem;
  color: #fc8181;
  margin-bottom: 1rem;
}

.back-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  border-radius: 5rem;
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

/* Layout */
.article-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.back-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-blue, #1a5b82);
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
  transition: transform 0.2s ease;
}

.back-link-btn:hover {
  transform: translateX(-3px);
  color: var(--button-purple, #c58cf2);
}

.article-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-badge {
  align-self: flex-start;
  padding: 0.35rem 1rem;
  border-radius: 5rem;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-badge.desarrollo { background-color: #48bb78; }
.category-badge.tea { background-color: var(--button-purple, #c58cf2); }
.category-badge.crianza { background-color: #f6ad55; }
.category-badge.sensorial { background-color: #4fd1c5; }

.article-title {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--text-blue, #1a5b82);
}

.header-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1.5px solid #edf2f7;
}

@media (min-width: 36rem) {
  .header-meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.author-role {
  font-size: 0.75rem;
  opacity: 0.65;
  font-family: 'Outfit', sans-serif;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: #718096;
}

.meta-right span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.meta-right span .material-symbols-outlined {
  font-size: 1.1rem;
}

/* Featured Image */
.featured-image-wrap {
  width: 100%;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  max-height: 28rem;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  margin-top: 1rem;
}

@media (min-width: 48rem) {
  .content-grid {
    grid-template-columns: 1fr 18rem;
  }
}

.article-body {
  font-family: 'Outfit', sans-serif;
  line-height: 1.75;
  color: #2d3748;
  font-size: 1.1rem;
}

.article-text :deep(p) {
  margin-bottom: 1.5rem;
}

.article-text :deep(h3) {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  margin: 2rem 0 1rem 0;
}

.article-text :deep(blockquote) {
  border-left: 4px solid var(--button-purple, #c58cf2);
  background: #faf5ff;
  padding: 1.25rem 1.5rem;
  border-radius: 0 1rem 1rem 0;
  font-style: italic;
  font-size: 1.15rem;
  color: #553c9a;
  margin: 2rem 0;
}

.article-text :deep(ul) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.article-text :deep(li) {
  margin-bottom: 0.5rem;
}

/* Sidebar */
.sidebar-card {
  position: sticky;
  top: 6rem;
  background: #f7fafc;
  border-radius: 1.25rem;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-btn {
  width: 100%;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.8rem 1.25rem;
  border-radius: 5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.22s ease;
}

.save-btn {
  background: white;
  border: 1.5px solid var(--button-purple, #c58cf2);
  color: var(--button-purple, #c58cf2);
  box-shadow: 0 4px 12px rgba(197, 140, 242, 0.05);
}

.save-btn:hover {
  background: rgba(197, 140, 242, 0.04);
  transform: translateY(-1px);
}

.save-btn.active {
  background: #f3e5f5;
  border-color: var(--button-purple, #c58cf2);
  color: var(--button-purple, #c58cf2);
}

.save-btn.active span.material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}

.share-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1.5px solid #edf2f7;
  padding-top: 1.25rem;
}

.share-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #718096;
}

.share-buttons {
  display: flex;
  gap: 0.75rem;
}

.share-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.22s ease;
}

.share-btn:hover {
  transform: translateY(-2px);
}

.share-btn.native {
  color: var(--text-blue, #1a5b82);
}
.share-btn.native:hover {
  background: #e8f5ff;
}

.share-btn.facebook {
  color: #1877f2;
}
.share-btn.facebook:hover {
  background: #e8f0fe;
}

.share-btn.x {
  color: #000000;
}
.share-btn.x:hover {
  background: #e2e8f0;
}

.share-btn.whatsapp {
  color: #25d366;
}
.share-btn.whatsapp:hover {
  background: #e6fffa;
}

.share-svg {
  width: 1.2rem;
  height: 1.2rem;
  fill: currentColor;
}

/* Related Section */
.related-section {
  border-top: 1.5px solid #edf2f7;
  padding-top: 3rem;
  margin-top: 2rem;
}

.related-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.related-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 36rem) {
  .related-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.related-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.22s ease;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 22px rgba(197, 140, 242, 0.08);
}

.r-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}

.r-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.r-category {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 5rem;
  color: white;
  text-transform: uppercase;
}

.r-category.desarrollo { background-color: #48bb78; }
.r-category.tea { background-color: var(--button-purple, #c58cf2); }
.r-category.crianza { background-color: #f6ad55; }
.r-category.sensorial { background-color: #4fd1c5; }

.r-body {
  padding: 1rem;
}

.r-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 0.5rem;
  color: var(--text-blue, #1a5b82);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.r-date {
  font-size: 0.75rem;
  color: #718096;
}
</style>
