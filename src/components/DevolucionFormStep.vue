<template>
  <div class="form-step">

    <!-- Breadcrumb -->
    <div class="breadcrumb-bar">
      <span class="bc-item">{{ product?.name }}</span>
      <span class="material-symbols-outlined bc-sep">chevron_right</span>
      <span class="bc-item active">{{ reason?.emoji }} {{ reason?.title }}</span>
      <span class="material-symbols-outlined bc-sep">chevron_right</span>
      <span class="bc-current">Formulario</span>
    </div>

    <!-- Nota de política -->
    <div class="policy-note" :class="'policy-' + reason?.type">
      <span class="material-symbols-outlined">{{ reason?.policyIcon }}</span>
      <div>
        <strong>{{ reason?.policyTitle }}</strong>
        <span>{{ reason?.policyText }}</span>
      </div>
    </div>

    <!-- Producto afectado (solo lectura, ya viene seleccionado) -->
    <div class="form-card">
      <h3 class="form-section-title">
        <span class="material-symbols-outlined">inventory_2</span>
        Producto afectado
      </h3>
      <div class="product-selected-row">
        <img :src="product?.image" :alt="product?.name" />
        <div>
          <strong>{{ product?.name }}</strong>
          <small>Pedido {{ product?.orderId }} · {{ fmtShort(product?.orderDate) }}</small>
        </div>
      </div>
    </div>

    <!-- Detalles -->
    <div class="form-card">
      <h3 class="form-section-title">
        <span class="material-symbols-outlined">edit_note</span>
        Cuéntanos más
      </h3>

      <div class="sub-reason-grid">
        <button
          v-for="s in reason?.subReasons"
          :key="s"
          class="sub-reason-btn"
          :class="{ selected: subReason === s }"
          @click="subReason = s"
        >{{ s }}</button>
      </div>

      <div class="field-group mt">
        <label>Descripción adicional <span class="optional">(opcional)</span></label>
        <textarea v-model="description" rows="4" :placeholder="reason?.placeholder"></textarea>
      </div>

      <!-- Fotos si aplica -->
      <div v-if="reason?.allowPhotos" class="field-group">
        <label>Adjunta fotos <span class="optional">(muy útil si el producto llegó dañado)</span></label>
        <div class="photo-drop" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
          <span class="material-symbols-outlined photo-drop-icon">add_photo_alternate</span>
          <span>Arrastra fotos aquí o haz clic</span>
          <small>JPG, PNG o WEBP · máx. 5 MB</small>
          <input ref="fileInput" type="file" accept="image/*" multiple style="display:none" @change="handleFiles" />
        </div>
        <div v-if="photos.length" class="photo-previews">
          <div v-for="(p, i) in photos" :key="i" class="photo-thumb">
            <img :src="p.url" />
            <button class="remove-photo" @click="photos.splice(i, 1)">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Email -->
      <div class="field-group">
        <label>Tu email de contacto</label>
        <input v-model="email" type="email" placeholder="tu@email.com" />
        <small class="field-hint">Te notificaremos el estado aquí.</small>
      </div>
    </div>

    <!-- Resumen -->
    <div class="summary-card">
      <h3 class="form-section-title">
        <span class="material-symbols-outlined">summarize</span>
        Resumen
      </h3>
      <div class="summary-rows">
        <div class="summary-row"><span>Producto</span><strong>{{ product?.name }}</strong></div>
        <div class="summary-row"><span>Pedido</span><strong>{{ product?.orderId }}</strong></div>
        <div class="summary-row"><span>Tipo de gestión</span><strong>{{ reason?.title }}</strong></div>
        <div class="summary-row" v-if="subReason"><span>Motivo</span><strong>{{ subReason }}</strong></div>
        <div class="summary-row"><span>Resolución esperada</span><strong class="highlight">{{ reason?.resolution }}</strong></div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="form-actions">
      <button class="back-btn" @click="$emit('back')">
        <span class="material-symbols-outlined">arrow_back</span>
        Volver
      </button>
      <button
        class="submit-btn"
        :disabled="!canSubmit"
        @click="submit"
      >
        <span class="material-symbols-outlined">send</span>
        Enviar solicitud
      </button>
    </div>
    <p v-if="!canSubmit" class="form-required-hint">
      <span class="material-symbols-outlined">info</span>
      Selecciona un motivo específico e introduce tu email para continuar.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  product:      { type: Object, required: true },
  reason:       { type: Object, required: true },
  contactEmail: { type: String, default: '' },
});
const emit = defineEmits(['back', 'submit']);

const subReason   = ref('');
const description = ref('');
const email       = ref(props.contactEmail);
const photos      = ref([]);

const canSubmit = computed(() => !!subReason.value && !!email.value);

function submit() {
  emit('submit', {
    subReason: subReason.value,
    description: description.value,
    photos: photos.value.map(p => p.url), // base64 urls of the uploaded images
    contactEmail: email.value
  });
}

function handleFiles(e) {
  [...e.target.files].forEach(f => photos.value.push({ url: URL.createObjectURL(f), file: f }));
}
function handleDrop(e) {
  [...e.dataTransfer.files].filter(f => f.type.startsWith('image/')).forEach(f => {
    photos.value.push({ url: URL.createObjectURL(f), file: f });
  });
}
function fmtShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
</script>

<style scoped>
.form-step { font-family: 'Fredoka', sans-serif; color: #1a5b82; }
.breadcrumb-bar { display: flex; align-items: center; gap: .35rem; font-size: .85rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.bc-item { color: #1a5b82; opacity: .55; }
.bc-item.active { opacity: .8; }
.bc-sep { font-size: 1rem; opacity: .3; }
.bc-current { font-weight: 700; color: #c58cf2; }

.policy-note { display: flex; align-items: flex-start; gap: .9rem; border-radius: 1rem; padding: 1.1rem 1.25rem; margin-bottom: 1.5rem; border: 1.5px solid; }
.policy-devolucion { background: #fff7f0; border-color: rgba(234,88,12,.25); color: #c2410c; }
.policy-cambio     { background: #f0fdf4; border-color: rgba(52,211,153,.3);  color: #059669; }
.policy-incidencia { background: #eff6ff; border-color: rgba(59,130,246,.25); color: #1d4ed8; }
.policy-consulta   { background: #fdf4ff; border-color: rgba(197,140,242,.3); color: #7c3aed; }
.policy-note .material-symbols-outlined { font-size: 1.5rem; flex-shrink: 0; margin-top: .05rem; }
.policy-note strong { display: block; font-size: .95rem; margin-bottom: .2rem; }
.policy-note span { font-size: .85rem; opacity: .8; line-height: 1.5; }

.form-card { background: white; border-radius: 1.25rem; padding: 1.5rem; margin-bottom: 1.25rem; border: 1.5px solid rgba(26,91,130,.07); box-shadow: 0 4px 16px rgba(26,91,130,.04); }
.form-section-title { display: flex; align-items: center; gap: .5rem; font-size: 1.05rem; font-weight: 700; margin-bottom: 1.1rem; }
.form-section-title .material-symbols-outlined { font-size: 1.2rem; color: #c58cf2; }

.product-selected-row { display: flex; align-items: center; gap: .85rem; background: #f7f9fc; border-radius: .8rem; padding: .75rem 1rem; }
.product-selected-row img { width: 3rem; height: 3rem; object-fit: cover; border-radius: .55rem; flex-shrink: 0; border: 1px solid rgba(0,0,0,.06); }
.product-selected-row strong { display: block; font-size: .95rem; }
.product-selected-row small { font-size: .78rem; opacity: .6; }

.sub-reason-grid { display: flex; flex-wrap: wrap; gap: .5rem; }
.sub-reason-btn { background: #f0f4f8; border: 1.5px solid transparent; border-radius: 5rem; padding: .45rem 1rem; font-family: 'Fredoka', sans-serif; font-size: .9rem; font-weight: 600; color: #1a5b82; cursor: pointer; transition: all .2s; }
.sub-reason-btn:hover { border-color: rgba(197,140,242,.4); background: #fdf9ff; }
.sub-reason-btn.selected { background: #c58cf2; border-color: #c58cf2; color: white; }

.field-group { display: flex; flex-direction: column; gap: .4rem; }
.field-group.mt { margin-top: 1.1rem; }
.field-group label { font-family: 'Fredoka', sans-serif; font-size: .9rem; font-weight: 600; color: #1a5b82; opacity: .85; }
.optional { font-weight: 400; font-family: 'Outfit', sans-serif; font-size: .8rem; opacity: .6; }
.field-group input, .field-group textarea {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid rgba(197, 140, 242, 0.2);
  color: #1a5b82;
  background: #fcf8ff;
  outline: none;
  transition: all 0.22s ease;
}
.field-group input:focus, .field-group textarea:focus {
  border-color: #c58cf2;
  background: white;
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.12);
}
.field-group textarea { resize: vertical; min-height: 80px; }
.field-hint { font-size: .8rem; opacity: .6; font-family: 'Outfit', sans-serif; }

.photo-drop {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem;
  padding: 2rem; background: #fcf8ff;
  border: 2px dashed rgba(197, 140, 242, 0.35);
  border-radius: 1.1rem; cursor: pointer; transition: all .22s; text-align: center;
}
.photo-drop:hover { border-color: #c58cf2; background: rgba(197, 140, 242, 0.05); }
.photo-drop-icon { font-size: 2.2rem; color: #c58cf2; }
.photo-drop span:not(.photo-drop-icon) { font-family: 'Fredoka', sans-serif; font-size: .95rem; font-weight: 600; color: #1a5b82; }
.photo-drop small { font-family: 'Outfit', sans-serif; font-size: .8rem; opacity: .55; }

.photo-previews { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .75rem; }
.photo-thumb { position: relative; width: 5rem; height: 5rem; }
.photo-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: .6rem; border: 1.5px solid rgba(197, 140, 242, 0.3); }
.remove-photo { position: absolute; top: -.35rem; right: -.35rem; background: #e53e3e; color: white; border: none; border-radius: 50%; width: 1.2rem; height: 1.2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.remove-photo .material-symbols-outlined { font-size: .75rem; }

.summary-card { background: linear-gradient(135deg, rgba(197,140,242,0.06), rgba(26,91,130,0.04)); border: 1.5px solid rgba(197,140,242,.25); border-radius: 1.25rem; padding: 1.5rem; margin-bottom: 1.5rem; }
.summary-rows { display: flex; flex-direction: column; gap: .6rem; margin-top: .5rem; }
.summary-row { display: flex; justify-content: space-between; align-items: center; font-size: .9rem; padding-bottom: .6rem; border-bottom: 1px dashed rgba(26,91,130,.08); }
.summary-row:last-child { border-bottom: none; padding-bottom: 0; }
.summary-row span { opacity: .65; }
.summary-row strong { font-weight: 700; }
.summary-row .highlight { color: #059669; }

.form-actions { display: flex; gap: .75rem; margin-bottom: .75rem; }
.back-btn { display: inline-flex; align-items: center; gap: .4rem; background: white; border: 1.5px solid rgba(26,91,130,.15); border-radius: 5rem; padding: .8rem 1.4rem; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700; color: #1a5b82; cursor: pointer; transition: all .2s; }
.back-btn:hover { border-color: #c58cf2; background: #fdf9ff; }
.submit-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: #c58cf2; color: white; border: none; border-radius: 5rem; padding: .85rem 1.75rem; font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all .22s; box-shadow: 0 4px 15px rgba(197,140,242,.3); }
.submit-btn:hover:not(:disabled) { background: #b373e6; transform: translateY(-1px); }
.submit-btn:disabled { opacity: .5; cursor: not-allowed; }
.form-required-hint { display: flex; align-items: center; gap: .4rem; font-size: .83rem; opacity: .6; font-family: 'Outfit', sans-serif; justify-content: center; }
.form-required-hint .material-symbols-outlined { font-size: 1rem; }
</style>
