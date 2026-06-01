<template>
  <div class="dash-view">
    <div class="view-header">
      <h1><span class="material-symbols-outlined">domain</span> Mi Centro</h1>
      <p>Información y configuración del centro de atención temprana.</p>
    </div>
    
    <div v-if="centersStore.isLoading" class="loading-state">
      <p>Cargando información del centro...</p>
    </div>

    <div v-else-if="!centersStore.currentCenter" class="empty-state">
      <p>No se encontró información del centro.</p>
    </div>

    <div v-else>
      <div class="centro-card">
        <div class="centro-top">
          <div class="centro-avatar"><span class="material-symbols-outlined">home_work</span></div>
          <div>
            <h2>{{ centersStore.currentCenter.name }}</h2>
            <p>{{ centersStore.currentCenter.address || 'Sin dirección' }}, {{ centersStore.currentCenter.city }}</p>
            <p>{{ centersStore.currentCenter.email }}</p>
          </div>
          <button class="btn-primary" @click="editing=!editing">
            <span class="material-symbols-outlined">{{ editing?'close':'edit' }}</span>
            {{ editing?'Cancelar':'Editar' }}
          </button>
        </div>
        <div v-if="editing" class="edit-form">
          <label>Nombre</label><input v-model="centersStore.currentCenter.name" />
          <label>Dirección</label><input v-model="centersStore.currentCenter.address" />
          <label>Ciudad</label><input v-model="centersStore.currentCenter.city" />
          <label>Email</label><input v-model="centersStore.currentCenter.email" type="email" />
          <label>Teléfono</label><input v-model="centersStore.currentCenter.phone" />
          <button class="btn-primary" style="margin-top:.5rem" @click="saveChanges">Guardar cambios</button>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat" v-for="s in stats" :key="s.label">
          <span class="material-symbols-outlined" :style="{color:s.color}">{{s.icon}}</span>
          <div><span class="stat-val">{{s.val}}</span><span class="stat-lbl">{{s.label}}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useCentersStore } from '../../stores/centers';

const authStore = useAuthStore();
const centersStore = useCentersStore();
const editing = ref(false);

onMounted(async () => {
  if (authStore.user && authStore.user.centroId) {
    await centersStore.fetchCenterById(authStore.user.centroId);
  }
});

const stats = computed(() => {
  const c = centersStore.currentCenter || {};
  return [
    {icon:'medical_services',label:'Profesionales activos',val: c.professionals || '0',color:'#c58cf2'},
    {icon:'child_care',label:'Niños atendidos',val: c.children || '0',color:'#3b82f6'},
    {icon:'calendar_month',label:'Citas este mes',val:'156',color:'#059669'},
    {icon:'article',label:'Contenido publicado',val:'23',color:'#d97706'},
  ];
});

async function saveChanges() {
  if (centersStore.currentCenter) {
    const res = await centersStore.updateCenter(centersStore.currentCenter.id, centersStore.currentCenter);
    if (res.success) {
      editing.value = false;
    } else {
      alert(res.error || 'Error al guardar los cambios.');
    }
  }
}
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.centro-card{background:white;border-radius:1.25rem;padding:1.75rem;box-shadow:0 4px 20px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
.centro-top{display:flex;align-items:flex-start;gap:1.25rem;flex-wrap:wrap}
.centro-avatar{width:4rem;height:4rem;border-radius:1rem;background:rgba(197,140,242,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.centro-avatar .material-symbols-outlined{font-size:2.2rem;color:#c58cf2}
.centro-top h2{font-family:'Fredoka',sans-serif;font-size:1.35rem;font-weight:700;color:#1a5b82;margin:0 0 .2rem}
.centro-top p{font-size:.88rem;color:#7c8ba1;margin:.1rem 0}
.btn-primary{display:inline-flex;align-items:center;gap:.4rem;background:#c58cf2;color:white;border:none;border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;margin-left:auto}
.edit-form{display:grid;grid-template-columns:1fr 1fr;gap:.6rem .85rem;margin-top:1.25rem;padding-top:1.25rem;border-top:1px dashed rgba(26,91,130,.1)}
.edit-form label{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;align-self:end}
.edit-form input{font-family:'Fredoka',sans-serif;font-size:.95rem;padding:.6rem 1rem;border-radius:.75rem;border:1.5px solid rgba(26,91,130,.15);background:#fcfaff;color:#1a5b82;outline:none}
.edit-form input:focus{border-color:#c58cf2}
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1rem}
.stat{background:white;border-radius:1.1rem;padding:1.25rem;display:flex;align-items:center;gap:.85rem;box-shadow:0 4px 20px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
.stat .material-symbols-outlined{font-size:2rem}
.stat-val{display:block;font-family:'Fredoka',sans-serif;font-size:1.5rem;font-weight:700;color:#1a5b82;line-height:1.1}
.stat-lbl{display:block;font-size:.75rem;color:#94a3b8}
</style>
