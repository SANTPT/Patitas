<script setup>
import { computed } from 'vue';

const props = defineProps({
  resource: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view-details']);

// Traducir categoría y asignar clase de estilo de badge
const categoryMeta = computed(() => {
  switch (props.resource.category) {
    case 'articulos':
      return { label: 'Artículo', class: 'tag-articulo', icon: 'menu_book' };
    case 'guias':
      return { label: 'Guía', class: 'tag-guia', icon: 'auto_stories' };
    case 'videos':
      return { label: 'Video', class: 'tag-video', icon: 'play_circle' };
    case 'centros':
      return { label: 'Centro', class: 'tag-centro', icon: 'distance' };
    default:
      return { label: 'Recurso', class: 'tag-default', icon: 'description' };
  }
});
</script>

<template>
  <div class="resource-card">
    <!-- Imagen del recurso -->
    <div class="card-img-wrap">
      <img :src="resource.image" :alt="resource.title" class="card-img" loading="lazy" />
      <!-- Tag flotante -->
      <span class="category-badge" :class="categoryMeta.class">
        <span class="material-symbols-outlined badge-icon">{{ categoryMeta.icon }}</span>
        {{ categoryMeta.label }}
      </span>
    </div>

    <!-- Contenido -->
    <div class="card-body">
      <h3 class="card-title">{{ resource.title }}</h3>
      <p class="card-desc">{{ resource.description }}</p>
      
      <div class="card-footer">
        <div class="meta-info">
          <span class="author" v-if="resource.author">{{ resource.author }}</span>
          <span class="separator" v-if="resource.author && resource.readTime">•</span>
          <span class="read-time" v-if="resource.readTime">{{ resource.readTime }}</span>
        </div>
        <button class="btn-more" @click="emit('view-details', resource)">
          Ver más
          <span class="material-symbols-outlined btn-arrow">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resource-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(26, 91, 130, 0.04);
  border: 1px solid rgba(26, 91, 130, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.resource-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(26, 91, 130, 0.09);
  border-color: rgba(197, 140, 242, 0.25);
}

.card-img-wrap {
  position: relative;
  height: 12.5rem;
  overflow: hidden;
  background: #f7fafc;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.resource-card:hover .card-img {
  transform: scale(1.06);
}

/* Badges estilizados pastel */
.category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.35rem 0.75rem;
  border-radius: 5rem;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.badge-icon {
  font-size: 0.95rem;
}

.tag-articulo {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-guia {
  background: #e8f5e9;
  color: #2e7d32;
}

.tag-video {
  background: #fff3e0;
  color: #e65100;
}

.tag-centro {
  background: #f3e5f5;
  color: #7b1fa2;
}

.tag-default {
  background: #f7fafc;
  color: #4a5568;
}

/* Cuerpo de la tarjeta */
.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.5rem;
  line-height: 1.35;
}

.card-desc {
  font-size: 0.92rem;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.85;
}

/* Pie de la tarjeta */
.card-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid rgba(26, 91, 130, 0.04);
  padding-top: 1rem;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #718096;
  font-weight: 500;
}

.author {
  font-weight: 600;
  color: var(--text-blue);
  opacity: 0.9;
}

.btn-more {
  width: 100%;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  background: white;
  border: 1.5px solid rgba(197, 140, 242, 0.45);
  color: var(--button-purple);
  padding: 0.55rem 1rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all 0.25s ease;
}

.btn-more:hover {
  background: rgba(197, 140, 242, 0.05);
  border-color: var(--button-purple);
  color: var(--button-purple);
}

.btn-arrow {
  font-size: 1.1rem;
  transition: transform 0.25s ease;
}

.btn-more:hover .btn-arrow {
  transform: translateX(3px);
}
</style>
