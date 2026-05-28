<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useContentStore } from '../../stores/content';

const authStore = useAuthStore();
const contentStore = useContentStore();
const route = useRoute();
const router = useRouter();

const user = computed(() => authStore.user);
const role = computed(() => user.value?.role || 'admin_centro');

const isEditMode = computed(() => !!route.params.id);
const currentId = computed(() => route.params.id ? parseInt(route.params.id) : null);

// Form state
const title = ref('');
const description = ref('');
const type = ref('post');
const category = ref('desarrollo');
const recommendedAge = ref('');
const url = ref('');
const content = ref('');
const visibility = ref('public');

onMounted(async () => {
  if (isEditMode.value) {
    const item = await contentStore.fetchContentDetails(currentId.value);
    if (item) {
      title.value = item.title || '';
      description.value = item.description || '';
      type.value = item.type || 'post';
      category.value = item.category || 'desarrollo';
      recommendedAge.value = item.recommendedAge || '';
      url.value = item.url || '';
      content.value = item.content || '';
      visibility.value = item.visibility || 'public';
    } else {
      alert('La publicación no fue encontrada.');
      goBack();
    }
  }
});

const goBack = () => {
  const prefix = role.value === 'admin_centro' ? 'admin-centro' : 'admin-profesional';
  router.push(`/dashboard/${prefix}/contenido`);
};

const handleSave = async (statusVal) => {
  if (!title.value.trim() || !description.value.trim()) {
    alert('Por favor, rellena el título y la descripción.');
    return;
  }

  if (type.value === 'video' && !url.value.trim()) {
    alert('Por favor, introduce la URL del video.');
    return;
  }

  // Get current professional / center ID if available
  const payload = {
    title: title.value,
    description: description.value,
    type: type.value,
    category: category.value,
    recommendedAge: recommendedAge.value,
    url: type.value === 'video' ? url.value : '',
    content: type.value !== 'video' ? content.value : '',
    visibility: visibility.value,
    status: statusVal,
    authorId: user.value?.id || 0,
    authorName: user.value?.name || 'Profesional de Patitas',
    centroId: user.value?.centroId || 1, // default or linked center
    profesionalId: role.value === 'admin_profesional' ? user.value?.id : null
  };

  let result;
  if (isEditMode.value) {
    result = await contentStore.updateContent(currentId.value, payload);
  } else {
    result = await contentStore.createContent(payload);
  }

  if (result.success) {
    goBack();
  } else {
    alert(result.error || 'Ocurrió un error al guardar la publicación.');
  }
};
</script>

<template>
  <div class="content-form-container">
    <div class="form-header">
      <button class="back-btn" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
        Volver
      </button>
      <h2 class="title">{{ isEditMode ? 'Editar Publicación' : 'Crear Nueva Publicación' }}</h2>
      <p class="subtitle">Completa los campos para configurar tu contenido y su nivel de acceso.</p>
    </div>

    <!-- Form card -->
    <div class="form-card">
      <div class="form-grid">
        <!-- Title & Description -->
        <div class="form-group col-span-2">
          <label class="form-label" for="title-input">Título de la publicación <span class="required">*</span></label>
          <input 
            id="title-input"
            v-model="title" 
            type="text" 
            placeholder="Ej. Ejercicios de motricidad fina con pinzas" 
            class="form-control"
          />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label" for="description-input">Descripción corta / Resumen <span class="required">*</span></label>
          <textarea 
            id="description-input"
            v-model="description" 
            rows="2"
            placeholder="Una breve descripción que aparecerá en los listados..." 
            class="form-control"
          ></textarea>
        </div>

        <!-- Type & Visibility -->
        <div class="form-group">
          <label class="form-label" for="type-select">Tipo de contenido</label>
          <select id="type-select" v-model="type" class="form-control">
            <option value="post">Artículo / Post (Blog o Foro)</option>
            <option value="video">Video práctico</option>
            <option value="actividad">Actividad / Taller práctico</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="visibility-select">Visibilidad / Control de Acceso</label>
          <select id="visibility-select" v-model="visibility" class="form-control">
            <option value="public">Público (Para todo el sitio) 🌐</option>
            <option value="private">Privado (Solo para padres vinculados a este centro) 🔒</option>
          </select>
        </div>

        <!-- Category & Age -->
        <div class="form-group">
          <label class="form-label" for="category-select">Categoría temática</label>
          <select id="category-select" v-model="category" class="form-control">
            <option value="desarrollo">Desarrollo general</option>
            <option value="comunicacion">Lenguaje y comunicación</option>
            <option value="sensorial">Procesamiento sensorial</option>
            <option value="conducta">Autorregulación y conducta</option>
            <option value="autonomia">Autonomía y vida diaria</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="age-input">Edad recomendada</label>
          <input 
            id="age-input"
            v-model="recommendedAge" 
            type="text" 
            placeholder="Ej. 2-5 años o Todos" 
            class="form-control"
          />
        </div>

        <!-- Dynamic inputs based on Type -->
        <div v-if="type === 'video'" class="form-group col-span-2 highlight-group">
          <label class="form-label" for="url-input">Enlace del Video (YouTube, Vimeo, etc.) <span class="required">*</span></label>
          <div class="input-with-icon">
            <span class="material-symbols-outlined input-icon">videocam</span>
            <input 
              id="url-input"
              v-model="url" 
              type="text" 
              placeholder="https://www.youtube.com/watch?v=..." 
              class="form-control with-icon"
            />
          </div>
        </div>

        <div v-else class="form-group col-span-2">
          <label class="form-label" for="content-input">Cuerpo del contenido / Instrucciones detalladas</label>
          <textarea 
            id="content-input"
            v-model="content" 
            rows="8"
            placeholder="Escribe aquí el artículo completo o el paso a paso detallado de la actividad. Soporta HTML básico." 
            class="form-control content-textarea"
          ></textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <button class="btn btn-text" @click="goBack">Cancelar</button>
        <div class="actions-right">
          <button 
            class="btn btn-secondary" 
            :disabled="contentStore.isLoading"
            @click="handleSave('draft')"
          >
            Guardar como Borrador
          </button>
          <button 
            class="btn btn-primary" 
            :disabled="contentStore.isLoading"
            @click="handleSave('published')"
          >
            <span v-if="contentStore.isLoading" class="material-symbols-outlined spinner btn-spinner">sync</span>
            {{ isEditMode ? 'Guardar Cambios' : 'Publicar Ahora' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 50rem;
  margin: 0 auto;
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.back-btn {
  background: transparent;
  border: none;
  color: #7c8ba1;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
  padding: 0;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--text-blue, #1a5b82);
}

.title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.subtitle {
  font-size: 0.95rem;
  color: #7c8ba1;
}

.form-card {
  background: white;
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.col-span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-blue, #1a5b82);
}

.required {
  color: #ef4444;
}

.form-control {
  padding: 0.75rem 1rem;
  border-radius: 0.8rem;
  border: 1.5px solid #e2e8f0;
  outline: none;
  font-size: 0.9rem;
  color: #4a5568;
  background-color: white;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: var(--button-purple, #c58cf2);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.15);
}

textarea.form-control {
  resize: vertical;
}

.content-textarea {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
}

.highlight-group {
  background: #fdf2f8;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1.5px dashed rgba(219, 39, 119, 0.2);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.8rem;
  color: #db2777;
  pointer-events: none;
}

.form-control.with-icon {
  padding-left: 2.5rem;
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  border-top: 1px solid #edf2f7;
  padding-top: 1.5rem;
}

.actions-right {
  display: flex;
  gap: 0.8rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  border-radius: 5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--button-purple, #c58cf2);
  color: white;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(197, 140, 242, 0.4);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-text {
  background: transparent;
  color: #7c8ba1;
}

.btn-text:hover {
  color: #4a5568;
}

.btn-spinner {
  font-size: 1.1rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
