<script setup>
import { ref } from 'vue';
import api from '../services/api';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'post-created']);

const title = ref('');
const content = ref('');
const category = ref('General');
const isSubmitting = ref(false);
const errorMessage = ref('');

function closeModal() {
  if (isSubmitting.value) return;
  title.value = '';
  content.value = '';
  category.value = 'General';
  errorMessage.value = '';
  emit('update:modelValue', false);
}

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) {
    errorMessage.value = 'Por favor, completa todos los campos obligatorios.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // Formatear contenido con párrafos básicos
    const formattedContent = `<p>${content.value.replace(/\n/g, '<br>')}</p>`;
    
    const response = await api.post('/posts', {
      title: title.value,
      content: formattedContent,
      category: category.value
    });

    emit('post-created', response.data);
    
    // Toast de éxito
    const event = new CustomEvent('show-toast', {
      detail: {
        message: '¡Tu publicación ha sido compartida con éxito!',
        type: 'success'
      }
    });
    window.dispatchEvent(event);

    closeModal();
  } catch (err) {
    errorMessage.value = 'Hubo un error al crear la publicación. Inténtalo de nuevo.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="modal-backdrop" @click.self="closeModal">
      <Transition name="modal-scale">
        <div v-if="modelValue" class="modal-window" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <!-- Header -->
          <div class="modal-header">
            <h2 id="modal-title">Nueva Publicación</h2>
            <button class="close-btn" @click="closeModal" :disabled="isSubmitting" aria-label="Cerrar modal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body / Form -->
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div v-if="errorMessage" class="error-banner">
              <span class="material-symbols-outlined">error</span>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Título -->
            <div class="form-group">
              <label for="post-title">Título *</label>
              <input 
                id="post-title"
                v-model="title"
                type="text"
                placeholder="¿Sobre qué quieres hablar?"
                required
                :disabled="isSubmitting"
                maxlength="80"
              />
            </div>

            <!-- Categoría -->
            <div class="form-group">
              <label for="post-category">Categoría *</label>
              <select id="post-category" v-model="category" :disabled="isSubmitting">
                <option value="General">General</option>
                <option value="Consejos">Consejos</option>
                <option value="Dudas">Dudas</option>
              </select>
            </div>

            <!-- Cuerpo del mensaje -->
            <div class="form-group">
              <label for="post-content">Cuerpo del mensaje *</label>
              <textarea 
                id="post-content"
                v-model="content"
                rows="6"
                placeholder="Escribe aquí tu duda, experiencia o recomendación..."
                required
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <p class="form-help">* Campos obligatorios. Sé respetuoso con la comunidad.</p>

            <!-- Footer con acciones -->
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner"></span>
                <span>{{ isSubmitting ? 'Compartiendo...' : 'Publicar ahora' }}</span>
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(26, 91, 130, 0.45);
  backdrop-filter: blur(0.22rem);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.11rem;
}

.modal-window {
  background: white;
  width: 100%;
  max-width: 32rem;
  border-radius: 1.5rem;
  box-shadow: var(--shadow-mid);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(26, 91, 130, 0.08);
}

.modal-header {
  padding: 1.33rem 1.55rem;
  border-bottom: 1px dashed rgba(26, 91, 130, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-blue);
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
  padding: 0.22rem;
}

.close-btn:hover:not(:disabled) {
  opacity: 1;
  transform: rotate(90deg);
}

.close-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.close-btn .material-symbols-outlined {
  font-size: 1.33rem;
}

.modal-form {
  padding: 1.55rem;
  display: flex;
  flex-direction: column;
  gap: 1.11rem;
}

.error-banner {
  background-color: rgba(229, 62, 62, 0.08);
  color: #e53e3e;
  border-radius: 0.78rem;
  padding: 0.67rem 0.89rem;
  display: flex;
  align-items: center;
  gap: 0.56rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.error-banner .material-symbols-outlined {
  font-size: 1.11rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.33rem;
}

.form-group label {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.89rem;
  font-weight: 700;
  color: var(--text-blue);
}

.form-group input,
.form-group select,
.form-group textarea {
  font-family: inherit;
  font-size: 0.89rem;
  padding: 0.67rem 0.89rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.78rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: var(--text-blue);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--button-purple);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.15);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-group textarea {
  resize: vertical;
}

.form-help {
  font-size: 0.75rem;
  opacity: 0.6;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.78rem;
  margin-top: 0.44rem;
}

.btn {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 5.5rem;
  padding: 0.56rem 1.33rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.44rem;
}

.btn-secondary {
  background-color: #edf2f7;
  color: var(--text-blue);
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.btn-primary {
  background: var(--button-purple);
  color: white;
  box-shadow: var(--shadow-purple);
}

.btn-primary:hover:not(:disabled) {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Spinner */
.spinner {
  width: 0.89rem;
  height: 0.89rem;
  border: 2px solid white;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.9);
}
</style>
