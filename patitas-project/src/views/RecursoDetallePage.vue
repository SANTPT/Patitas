<template>
  <div class="recurso-detalle-page">
    <!-- Estado de carga / Skeleton -->
    <div v-if="loading" class="container loading-state">
      <div class="skeleton-header"></div>
      <div class="skeleton-banner"></div>
      <div class="skeleton-body-grid">
        <div class="skeleton-sidebar"></div>
        <div class="skeleton-main"></div>
      </div>
    </div>

    <!-- Si no se encuentra el recurso -->
    <div v-else-if="!resource" class="container error-state">
      <span class="material-symbols-outlined error-icon">sentiment_dissatisfied</span>
      <h2>Recurso no encontrado</h2>
      <p>Lo sentimos, el recurso que estás buscando no existe o ha sido trasladado.</p>
      <router-link to="/recursos" class="back-btn">Volver al catálogo</router-link>
    </div>

    <!-- Contenido del recurso -->
    <div v-else class="detalle-container container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <router-link to="/recursos">Recursos</router-link>
        <span class="separator-icon">/</span>
        <router-link :to="`/recursos?categoria=${resource.category}`" class="category-link">
          {{ categoryLabel }}
        </router-link>
        <span class="separator-icon">/</span>
        <span class="current-item" aria-current="page">{{ resource.title }}</span>
      </nav>

      <!-- Encabezado de metadatos -->
      <header class="resource-header">
        <div class="meta-row">
          <span class="badge" :class="resource.category">{{ categoryLabelSingular }}</span>
          <div class="meta-item">
            <span class="material-symbols-outlined">schedule</span>
            <span>{{ resource.readTime }}</span>
          </div>
          <div class="meta-item" v-if="resource.updatedAt">
            <span class="material-symbols-outlined">calendar_today</span>
            <span>Actualizado: {{ resource.updatedAt }}</span>
          </div>
        </div>
        <h1 class="main-title">{{ resource.title }}</h1>
      </header>

      <!-- Banner de imagen destacado -->
      <div class="hero-banner-wrap">
        <img :src="resource.image" :alt="resource.title" class="hero-banner-img" />
      </div>

      <!-- Layout de dos columnas -->
      <div class="content-layout">
        <!-- Columna Izquierda: Sidebar -->
        <aside class="sidebar-col">
          <div class="sidebar-card">
            <h3 class="sidebar-title">Temas en este recurso</h3>
            <ul class="topics-list">
              <li 
                v-for="(section, idx) in anchorSections" 
                :key="idx"
                :class="{ active: activeSectionIndex === idx }"
              >
                <a :href="`#${section.id}`" @click.prevent="scrollTo(section.id, idx)">
                  {{ section.title }}
                </a>
              </li>
            </ul>
            <button class="download-pdf-btn" @click="simulateDownload" :disabled="downloading">
              <span class="material-symbols-outlined">download</span>
              <span>{{ downloading ? 'Preparando...' : 'Descargar PDF' }}</span>
            </button>
            <transition name="toast-fade">
              <div v-if="showToast" class="download-toast">
                <span class="material-symbols-outlined">check_circle</span>
                ¡Descarga iniciada con éxito!
              </div>
            </transition>
          </div>
        </aside>

        <!-- Columna Derecha: Contenido Principal -->
        <main class="main-content-col">
          <!-- Introducción destacada -->
          <p class="intro-text">{{ resource.intro || resource.description }}</p>

          <!-- Renderizador de Secciones Dinámicas -->
          <div class="sections-container" v-if="resource.sections && resource.sections.length">
            <section 
              v-for="(sec, idx) in resource.sections" 
              :key="idx" 
              :id="sec.id"
              class="content-section"
            >
              <!-- Tipo TEXT -->
              <div v-if="sec.type === 'text'" class="section-type-text">
                <h2 class="section-heading">
                  <span class="material-symbols-outlined sec-icon">help_center</span>
                  {{ sec.title }}
                </h2>
                <p class="section-paragraph">{{ sec.content }}</p>
              </div>

              <!-- Tipo TIPS -->
              <div v-else-if="sec.type === 'tips'" class="tips-box">
                <div class="tips-header">
                  <span class="material-symbols-outlined tips-icon">lightbulb</span>
                  <h4>{{ sec.title }}</h4>
                </div>
                <ul class="tips-list-items">
                  <li v-for="(tip, tIdx) in sec.items" :key="tIdx">
                    <span class="tip-num">{{ getTipNumber(tip) }}</span>
                    <span class="tip-content">{{ getTipText(tip) }}</span>
                  </li>
                </ul>
              </div>

              <!-- Tipo LIST (Proceso de atención) -->
              <div v-else-if="sec.type === 'list'" class="section-type-list">
                <h2 class="section-heading">
                  <span class="material-symbols-outlined sec-icon">route</span>
                  {{ sec.title }}
                </h2>
                <ol class="process-list">
                  <li v-for="(item, lIdx) in sec.items" :key="lIdx" class="process-item">
                    <div class="process-badge">{{ lIdx + 1 }}</div>
                    <div class="process-text-wrap">
                      <strong class="process-label">{{ item.label }}:</strong>
                      <span class="process-text"> {{ item.text }}</span>
                    </div>
                  </li>
                </ol>
              </div>

              <!-- Tipo CARDS (Grilla de apoyo final) -->
              <div v-else-if="sec.type === 'cards'" class="subcards-grid">
                <div 
                  v-for="(sub, sIdx) in sec.items" 
                  :key="sIdx" 
                  class="subcard"
                  :class="sub.theme"
                >
                  <div class="subcard-header">
                    <span class="material-symbols-outlined subcard-icon">
                      {{ sub.theme === 'purple' ? 'psychology' : 'forum' }}
                    </span>
                    <h5>{{ sub.title }}</h5>
                  </div>
                  <p>{{ sub.desc }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Fallback si no hay secciones estructuradas -->
          <div v-else class="fallback-content">
            <p class="section-paragraph">{{ resource.content }}</p>
          </div>
        </main>
      </div>

      <!-- Sección de Recursos Relacionados -->
      <section class="related-section">
        <h2 class="related-title">Recursos relacionados</h2>
        <div class="related-grid">
          <article v-for="rel in relatedResources" :key="rel.id" class="related-card">
            <div class="card-img-wrap">
              <img :src="rel.image" :alt="rel.title" />
              <span class="card-badge" :class="rel.category">{{ getCategoryLabelSingularOf(rel.category) }}</span>
            </div>
            <div class="card-content">
              <h3>{{ rel.title }}</h3>
              <p>{{ rel.description }}</p>
              <router-link :to="`/recursos/${rel.id}`" class="card-link">
                <span>Leer más</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
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
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const resource = ref(null);
const allResources = ref([]);
const activeSectionIndex = ref(0);
const downloading = ref(false);
const showToast = ref(false);

const categories = {
  articulos: { label: 'Artículos', singular: 'Artículo' },
  guias: { label: 'Guías', singular: 'Guía' },
  videos: { label: 'Videos', singular: 'Video' },
  centros: { label: 'Centros de Apoyo', singular: 'Centro' },
};

const categoryLabel = computed(() => {
  if (!resource.value) return '';
  return categories[resource.value.category]?.label || resource.value.category;
});

const categoryLabelSingular = computed(() => {
  if (!resource.value) return '';
  return categories[resource.value.category]?.singular || 'Recurso';
});

const getCategoryLabelSingularOf = (cat) => {
  return categories[cat]?.singular || 'Recurso';
};

// Secciones que tienen un ID para el menú lateral
const anchorSections = computed(() => {
  if (!resource.value || !resource.value.sections) return [];
  return resource.value.sections.filter(s => s.id && s.title);
});

// Recursos relacionados: busca 3 del mismo catálogo que no sean el actual
const relatedResources = computed(() => {
  if (!resource.value) return [];
  return allResources.value
    .filter(r => r.id !== resource.value.id)
    .slice(0, 3);
});

const fetchResource = async () => {
  loading.value = true;
  try {
    const response = await api.get('/recursos');
    allResources.value = response.data;
    const targetId = parseInt(route.params.id);
    resource.value = allResources.value.find(r => r.id === targetId) || null;
  } catch (error) {
    console.error('Error al obtener el recurso:', error);
  } finally {
    loading.value = false;
  }
};

const scrollTo = (id, idx) => {
  activeSectionIndex.value = idx;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const simulateDownload = () => {
  downloading.value = true;
  setTimeout(() => {
    downloading.value = false;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }, 1200);
};

// Formatea los tips para separar número de contenido
const getTipNumber = (tipStr) => {
  const match = tipStr.match(/^(\d+\.|•)\s*/);
  return match ? match[1].replace('.', '') : '•';
};

const getTipText = (tipStr) => {
  return tipStr.replace(/^(\d+\.|•)\s*/, '');
};

watch(() => route.params.id, () => {
  fetchResource();
});

onMounted(() => {
  fetchResource();
});
</script>

<style scoped>
.recurso-detalle-page {
  background-color: var(--page-bg, #f0f8ff);
  min-height: 90vh;
  padding: 2rem 0 4rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
}

/* ─── BREADCRUMBS ─── */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.breadcrumbs a {
  color: var(--text-blue, #1a5b82);
  opacity: 0.7;
  transition: opacity 0.2s;
  text-decoration: none;
}

.breadcrumbs a:hover {
  opacity: 1;
  text-decoration: underline;
}

.breadcrumbs .separator-icon {
  opacity: 0.4;
  font-weight: 300;
}

.breadcrumbs .current-item {
  opacity: 0.9;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 25rem;
}

/* ─── HEADER ─── */
.resource-header {
  margin-bottom: 2rem;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  padding: 0.25rem 0.8rem;
  border-radius: 5.5rem;
  color: white;
}

.badge.articulos {
  background-color: #c58cf2;
  box-shadow: 0 0.15rem 0.5rem rgba(197, 140, 242, 0.3);
}

.badge.guias {
  background-color: #5bbfd6;
  box-shadow: 0 0.15rem 0.5rem rgba(91, 191, 214, 0.3);
}

.badge.videos {
  background-color: #f09dc0;
  box-shadow: 0 0.15rem 0.5rem rgba(240, 157, 192, 0.3);
}

.badge.centros {
  background-color: #a78bfa;
  box-shadow: 0 0.15rem 0.5rem rgba(167, 139, 250, 0.3);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  opacity: 0.75;
  font-weight: 500;
}

.meta-item .material-symbols-outlined {
  font-size: 1.1rem;
}

.main-title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0.5rem 0 0;
}

/* ─── BANNER ─── */
.hero-banner-wrap {
  width: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 0.5rem 1.8rem rgba(26, 91, 130, 0.1);
  margin-bottom: 2.5rem;
  background-color: white;
}

.hero-banner-img {
  width: 100%;
  max-height: 28rem;
  object-fit: cover;
  display: block;
}

/* ─── LAYOUT DE COLUMNAS ─── */
.content-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  align-items: start;
}

/* Sidebar */
.sidebar-col {
  position: sticky;
  top: 7rem;
}

.sidebar-card {
  background: white;
  border-radius: 1.25rem;
  border: 1.5px solid rgba(91, 191, 214, 0.25);
  padding: 1.75rem;
  box-shadow: 0 0.3rem 1.2rem rgba(26, 91, 130, 0.04);
  position: relative;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  border-bottom: 1.5px solid rgba(26, 91, 130, 0.05);
  padding-bottom: 0.75rem;
}

.topics-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.topics-list li {
  position: relative;
}

.topics-list a {
  color: var(--text-blue, #1a5b82);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.2s;
  display: block;
  padding: 0.4rem 0.5rem 0.4rem 0.75rem;
  border-radius: 0.5rem;
}

.topics-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0%;
  background-color: var(--button-purple, #c58cf2);
  border-radius: 2px;
  transition: height 0.2s;
}

.topics-list li.active::before,
.topics-list li:hover::before {
  height: 60%;
}

.topics-list li.active a {
  opacity: 1;
  color: var(--button-purple, #c58cf2);
  background-color: rgba(197, 140, 242, 0.05);
  font-weight: 600;
}

.topics-list a:hover:not(.active) {
  opacity: 1;
  background-color: rgba(26, 91, 130, 0.03);
}

.download-pdf-btn {
  width: 100%;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  background: var(--button-purple, #c58cf2);
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(197, 140, 242, 0.35);
  transition: all 0.22s ease;
}

.download-pdf-btn:hover:not(:disabled) {
  background: var(--button-purple-hover, #b373e6);
  transform: translateY(-1px);
  box-shadow: 0 0.35rem 1rem rgba(197, 140, 242, 0.45);
}

.download-pdf-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-toast {
  position: absolute;
  bottom: -3.5rem;
  left: 0;
  right: 0;
  background-color: #48bb78;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 0.25rem 0.75rem rgba(72, 187, 120, 0.2);
  z-index: 10;
}

/* Transición Toast */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Main Content Column */
.main-content-col {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 0.4rem 1.5rem rgba(26, 91, 130, 0.03);
}

.intro-text {
  font-size: 1.15rem;
  line-height: 1.7;
  font-weight: 500;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.content-section {
  margin-bottom: 2.5rem;
  scroll-margin-top: 8rem;
}

.section-heading {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sec-icon {
  font-size: 1.6rem;
  color: var(--button-purple, #c58cf2);
}

.section-paragraph {
  font-size: 1rem;
  line-height: 1.75;
  margin-bottom: 1.25rem;
  opacity: 0.85;
}

/* Caja de Tips */
.tips-box {
  background: rgba(197, 140, 242, 0.05);
  border: 1.5px solid rgba(197, 140, 242, 0.12);
  border-radius: 1.25rem;
  padding: 1.75rem;
  margin: 2rem 0;
  position: relative;
  overflow: hidden;
}

.tips-box::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 3.5rem;
  height: 3.5rem;
  background: radial-gradient(circle, rgba(197,140,242,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.tips-icon {
  color: var(--button-purple, #c58cf2);
  font-size: 1.5rem;
}

.tips-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.tips-list-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.tips-list-items li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

.tip-num {
  font-weight: 700;
  color: var(--button-purple, #c58cf2);
  font-size: 0.9rem;
  background: white;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.1rem 0.3rem rgba(197,140,242,0.1);
  flex-shrink: 0;
}

.tip-content {
  opacity: 0.85;
}

/* Lista de Proceso */
.process-list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.process-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.process-badge {
  background: #5bbfd6;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0.15rem 0.5rem rgba(91, 191, 214, 0.25);
}

.process-text-wrap {
  font-size: 1rem;
  line-height: 1.65;
  padding-top: 0.25rem;
}

.process-label {
  font-weight: 700;
}

.process-text {
  opacity: 0.85;
}

/* Sub-cards Grid */
.subcards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin: 2rem 0 1rem;
}

.subcard {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 0.25rem 0.8rem rgba(26, 91, 130, 0.02);
  transition: transform 0.2s;
}

.subcard:hover {
  transform: translateY(-2px);
}

.subcard.purple {
  border: 1.5px solid rgba(197, 140, 242, 0.25);
}

.subcard.blue {
  border: 1.5px solid rgba(91, 191, 214, 0.25);
}

.subcard-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.subcard-icon {
  font-size: 1.3rem;
}

.purple .subcard-icon {
  color: #c58cf2;
}

.blue .subcard-icon {
  color: #5bbfd6;
}

.subcard h5 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.subcard p {
  font-size: 0.88rem;
  line-height: 1.6;
  opacity: 0.8;
  margin: 0;
}

/* ─── RECURSOS RELACIONADOS ─── */
.related-section {
  margin-top: 4rem;
  border-top: 1.5px dashed rgba(26, 91, 130, 0.1);
  padding-top: 3rem;
}

.related-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.8rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.related-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 0.3rem 1.2rem rgba(26, 91, 130, 0.04);
  border: 1px solid rgba(26, 91, 130, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1.5rem rgba(26, 91, 130, 0.08);
}

.card-img-wrap {
  position: relative;
  width: 100%;
  height: 11rem;
  background-color: #f7fafc;
}

.card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 5.5rem;
  color: white;
}

.card-badge.articulos { background-color: #c58cf2; }
.card-badge.guias { background-color: #5bbfd6; }
.card-badge.videos { background-color: #f09dc0; }
.card-badge.centros { background-color: #a78bfa; }

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.6rem;
  line-height: 1.3;
}

.card-content p {
  font-size: 0.88rem;
  line-height: 1.6;
  opacity: 0.75;
  flex: 1;
  margin: 0 0 1.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--button-purple, #c58cf2);
  text-decoration: none;
  transition: gap 0.2s;
}

.card-link:hover {
  gap: 0.5rem;
}

.card-link .material-symbols-outlined {
  font-size: 1rem;
}

/* ─── LOADING Y SKELETONS ─── */
.loading-state {
  padding: 3rem 0;
}

.skeleton-header {
  height: 3rem;
  width: 60%;
  background: linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: loading-pulse 1.5s infinite;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.skeleton-banner {
  height: 20rem;
  width: 100%;
  background: linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: loading-pulse 1.5s infinite;
  border-radius: 1.5rem;
  margin-bottom: 3rem;
}

.skeleton-body-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
}

.skeleton-sidebar {
  height: 15rem;
  background: linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: loading-pulse 1.5s infinite;
  border-radius: 1.25rem;
}

.skeleton-main {
  height: 25rem;
  background: linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: loading-pulse 1.5s infinite;
  border-radius: 1.5rem;
}

.error-state {
  text-align: center;
  padding: 5rem 1rem;
}

.error-icon {
  font-size: 4rem;
  color: #e53e3e;
  margin-bottom: 1rem;
}

.back-btn {
  display: inline-block;
  background: var(--button-purple, #c58cf2);
  color: white;
  padding: 0.6rem 1.5rem;
  border-radius: 5.5rem;
  text-decoration: none;
  font-weight: 700;
  margin-top: 1.5rem;
  box-shadow: 0 0.2rem 0.6rem rgba(197, 140, 242, 0.3);
}

@keyframes loading-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive */
@media (max-width: 992px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .sidebar-col {
    position: relative;
    top: 0;
  }
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
  .subcards-grid {
    grid-template-columns: 1fr;
  }
  .main-content-col {
    padding: 1.5rem;
  }
  .meta-row {
    gap: 0.75rem;
  }
}
</style>
