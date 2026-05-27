<template>
  <div class="blog-container">
    <!-- Hero Banner del Blog -->
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">Blog para Familias</h1>
        <p class="page-subtitle">Artículos redactados por profesionales para acompañarte en cada etapa del desarrollo infantil</p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <!-- Buscador y Filtros -->
    <section class="filters-section">
      <div class="search-bar-wrap">
        <span class="material-symbols-outlined search-icon">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar artículos por título o descripción..." 
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="category-chips">
        <button 
          v-for="cat in categories" 
          :key="cat.value" 
          @click="selectedCategory = cat.value"
          :class="['chip-btn', { active: selectedCategory === cat.value }]"
        >
          <span class="material-symbols-outlined chip-icon">{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      </div>
    </section>

    <!-- Spinner de carga -->
    <div v-if="loading" class="loader-wrap">
      <div class="spinner"></div>
      <p>Cargando artículos...</p>
    </div>

    <!-- Mensaje sin resultados -->
    <div v-else-if="filteredArticles.length === 0" class="no-results">
      <span class="material-symbols-outlined no-results-icon">article_off</span>
      <h3>No encontramos artículos</h3>
      <p>Intenta cambiar los términos de búsqueda o de categoría.</p>
      <button @click="resetFilters" class="reset-btn">Restablecer filtros</button>
    </div>

    <!-- Grilla de Artículos -->
    <div v-else class="blog-grid-wrap">
      <div class="blog-grid">
        <article 
          v-for="art in paginatedArticles" 
          :key="art.id" 
          class="article-card"
          @click="goToArticle(art.slug)"
        >
          <div class="card-img-wrap">
            <img :src="art.image" :alt="art.title" class="card-img" />
            <span class="category-tag" :class="art.category">{{ art.categoryLabel }}</span>
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span class="meta-date">
                <span class="material-symbols-outlined">calendar_today</span>
                {{ formatDate(art.date) }}
              </span>
              <span class="meta-readtime">
                <span class="material-symbols-outlined">schedule</span>
                Lectura: {{ calculateReadTime(art.content) }} min
              </span>
            </div>

            <h2 class="card-title">{{ art.title }}</h2>
            <p class="card-desc">{{ art.description }}</p>

            <div class="card-footer">
              <div class="author-info">
                <div class="author-avatar" :style="{ backgroundColor: getAuthorColor(art.author) }">
                  {{ getInitials(art.author) }}
                </div>
                <span class="author-name">{{ art.author }}</span>
              </div>
              <span class="read-more-btn">
                Leer artículo
                <span class="material-symbols-outlined arrow-icon">arrow_forward</span>
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Botón Cargar Más -->
      <div v-if="hasMore" class="load-more-wrap">
        <button @click="loadMore" class="load-more-btn">
          Cargar más artículos
          <span class="material-symbols-outlined">expand_more</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const articles = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('all');

const itemsPerPage = ref(3);
const currentPage = ref(1);

const categories = [
  { value: 'all', label: 'Todos', icon: 'apps' },
  { value: 'desarrollo', label: 'Desarrollo', icon: 'child_care' },
  { value: 'tea', label: 'TEA', icon: 'extension' },
  { value: 'crianza', label: 'Crianza', icon: 'diversity_1' },
  { value: 'sensorial', label: 'Sensorial', icon: 'spa' }
];

const fetchArticles = async () => {
  loading.value = true;
  try {
    const response = await api.get('/blog');
    articles.value = response.data;
  } catch (error) {
    console.error('Error al cargar artículos:', error);
  } finally {
    loading.value = false;
  }
};

const calculateReadTime = (content) => {
  if (!content) return 1;
  const cleanText = content.replace(/<\/?[^>]+(>|$)/g, ""); // Quitar HTML tags
  const wordCount = cleanText.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getInitials = (name) => {
  if (!name) return 'A';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    // Si tiene título profesional como Dra. o Psic.
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
  const colors = [
    '#c58cf2', // lila
    '#5bbfd6', // cian
    '#f6ad55', // naranja
    '#4fd1c5', // turquesa
    '#fc8181', // coral
    '#90cdf4'  // azul claro
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const filteredArticles = computed(() => {
  return articles.value.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          article.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'all' || article.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const paginatedArticles = computed(() => {
  return filteredArticles.value.slice(0, currentPage.value * itemsPerPage.value);
});

const hasMore = computed(() => {
  return paginatedArticles.value.length < filteredArticles.value.length;
});

const loadMore = () => {
  currentPage.value++;
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
};

const goToArticle = (slug) => {
  router.push(`/blog/${slug}`);
};

watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1;
});

onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.blog-container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem 1.5rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
}

/* Hero Banner */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 4.5rem 0 5.5rem;
  text-align: center;
  margin-bottom: 3rem;
}

.header-wave-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.11rem;
  z-index: 2;
}

.header-wave-bottom svg {
  width: 100%;
  height: 100%;
  display: block;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.75rem;
}

.page-subtitle {
  font-size: 1.05rem;
  color: var(--text-blue);
  opacity: 0.85;
  max-width: 38rem;
  margin: 0 auto;
  line-height: 1.6;
}

/* Buscador y Filtros */
.filters-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.search-bar-wrap {
  position: relative;
  width: 100%;
  max-width: 38rem;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 3.2rem;
  font-size: 1rem;
  font-family: 'Outfit', sans-serif;
  border: 2px solid rgba(197, 140, 242, 0.2);
  border-radius: 5rem;
  background: white;
  color: var(--text-blue, #1a5b82);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  transition: all 0.25s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--button-purple, #c58cf2);
  box-shadow: 0 6px 20px rgba(197, 140, 242, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-btn:hover {
  color: var(--text-blue, #1a5b82);
}

.category-chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 5rem;
  background: white;
  border: 1.5px solid rgba(197, 140, 242, 0.15);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-blue, #1a5b82);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.chip-btn:hover {
  background: rgba(197, 140, 242, 0.05);
  border-color: var(--button-purple, #c58cf2);
  transform: translateY(-1px);
}

.chip-btn.active {
  background: var(--button-purple, #c58cf2);
  border-color: var(--button-purple, #c58cf2);
  color: white;
  box-shadow: 0 4px 12px rgba(197, 140, 242, 0.3);
}

.chip-icon {
  font-size: 1.2rem;
}

/* Spinner */
.loader-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
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

/* No Resultados */
.no-results {
  text-align: center;
  padding: 4rem 1.5rem;
  background: #f7fafc;
  border-radius: 1rem;
  max-width: 30rem;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
}

.no-results-icon {
  font-size: 3.5rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.no-results p {
  opacity: 0.7;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.reset-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 5rem;
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reset-btn:hover {
  background: var(--button-purple-hover, #b373e6);
}

/* Grilla de Artículos */
.blog-grid-wrap {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.blog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 48rem) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 64rem) {
  .blog-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.article-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 35px rgba(197, 140, 242, 0.12);
  border-color: rgba(197, 140, 242, 0.2);
}

.card-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #f7fafc;
}

.card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .card-img {
  transform: scale(1.04);
}

.category-tag {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 5rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.category-tag.desarrollo { background-color: #48bb78; }
.category-tag.tea { background-color: var(--button-purple, #c58cf2); }
.category-tag.crianza { background-color: #f6ad55; }
.category-tag.sensorial { background-color: #4fd1c5; }

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.75rem;
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-meta span .material-symbols-outlined {
  font-size: 0.95rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  color: var(--text-blue, #1a5b82);
  transition: color 0.2s ease;
}

.article-card:hover .card-title {
  color: var(--button-purple, #c58cf2);
}

.card-desc {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #4a5568;
  opacity: 0.85;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #edf2f7;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}

.author-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
}

.read-more-btn {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--button-purple, #c58cf2);
  display: flex;
  align-items: center;
  gap: 0.15rem;
  transition: all 0.2s ease;
}

.arrow-icon {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.article-card:hover .read-more-btn {
  color: var(--button-purple-hover, #b373e6);
}

.article-card:hover .arrow-icon {
  transform: translateX(3px);
}

/* Load More */
.load-more-wrap {
  display: flex;
  justify-content: center;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2rem;
  border-radius: 5rem;
  background: white;
  border: 1.5px solid var(--button-purple, #c58cf2);
  color: var(--button-purple, #c58cf2);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: rgba(197, 140, 242, 0.05);
  transform: translateY(-1px);
}
</style>
