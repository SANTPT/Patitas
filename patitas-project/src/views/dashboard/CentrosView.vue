<template>
  <div class="dash-view">
    <div class="view-header">
      <div class="header-row">
        <div>
          <h1><span class="material-symbols-outlined">home_work</span> Centros de Atención</h1>
          <p>Gestiona los centros registrados en la plataforma Patitas.</p>
        </div>
        <button class="btn-primary" @click="openCreate">
          <span class="material-symbols-outlined">add</span> Nuevo centro
        </button>
      </div>
    </div>

    <div class="search-bar">
      <span class="material-symbols-outlined">search</span>
      <input v-model="search" placeholder="Buscar centro por nombre o ciudad…" />
    </div>

    <div class="table-card">
      <div v-if="centersStore.isLoading" class="loading-state">
        <p>Cargando centros...</p>
      </div>
      <table v-else>
        <thead><tr><th>Centro</th><th>Ciudad</th><th>Profesionales</th><th>Niños</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id">
            <td><strong>{{c.name}}</strong></td>
            <td>{{c.city}}</td>
            <td>{{c.professionals || 0}}</td>
            <td>{{c.children || 0}}</td>
            <td><span class="status-chip" :class="c.status">{{c.status==='active'?'Activo':'Suspendido'}}</span></td>
            <td class="actions-cell">
              <button class="btn-icon" title="Editar" @click="openEdit(c)"><span class="material-symbols-outlined">edit</span></button>
              <button 
                class="btn-icon" 
                :class="{ danger: c.status === 'active' }"
                :title="c.status === 'active' ? 'Suspender' : 'Reactivar'" 
                @click="toggleStatus(c)"
              >
                <span class="material-symbols-outlined">{{ c.status === 'active' ? 'block' : 'check_circle' }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!centersStore.isLoading && filtered.length===0" class="empty-table">No se encontraron centros.</p>
    </div>

    <!-- Modal nuevo/editar centro -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal-box">
        <h2>{{ isEditing ? 'Editar Centro' : 'Nuevo Centro' }}</h2>
        <div class="form-fields">
          <label>Nombre del centro</label><input v-model="form.name" placeholder="Ej: Centro Patitas Madrid" />
          <label>Ciudad</label><input v-model="form.city" placeholder="Ej: Madrid" />
          <label>Email de contacto</label><input v-model="form.email" type="email" placeholder="centro@email.com" />
          <label v-if="!isEditing">Admin del centro (email)</label>
          <input v-if="!isEditing" v-model="form.adminEmail" type="email" placeholder="admin@email.com" />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showForm=false">Cancelar</button>
          <button class="btn-primary" @click="saveCenter">{{ isEditing ? 'Guardar cambios' : 'Guardar centro' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCentersStore } from '../../stores/centers';

const centersStore = useCentersStore();
const search = ref('');
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const form = ref({ name:'', city:'', email:'', adminEmail:'' });

onMounted(async () => {
  await centersStore.fetchCenters();
});

const filtered = computed(() =>
  centersStore.centers.filter(c =>
    (c.name || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.value.toLowerCase())
  )
);

function openCreate() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name:'', city:'', email:'', adminEmail:'' };
  showForm.value = true;
}

function openEdit(c) {
  isEditing.value = true;
  editingId.value = c.id;
  form.value = {
    name: c.name || '',
    city: c.city || '',
    email: c.email || '',
    adminEmail: c.adminEmail || ''
  };
  showForm.value = true;
}

async function saveCenter() {
  if (!form.value.name) return;
  
  if (isEditing.value) {
    const res = await centersStore.updateCenter(editingId.value, form.value);
    if (res.success) {
      showForm.value = false;
    } else {
      alert(res.error || 'Error al actualizar el centro.');
    }
  } else {
    const res = await centersStore.createCenter(form.value);
    if (res.success) {
      showForm.value = false;
    } else {
      alert(res.error || 'Error al crear el centro.');
    }
  }
}

async function toggleStatus(c) {
  const newStatus = c.status === 'active' ? 'suspended' : 'active';
  const confirmation = confirm(`¿Estás seguro de que deseas ${newStatus === 'active' ? 'suspender' : 'activar'} el centro "${c.name}"?`);
  if (confirmation) {
    const res = await centersStore.toggleCenterStatus(c.id, newStatus);
    if (!res.success) {
      alert(res.error || 'Error al cambiar estado.');
    }
  }
}
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.header-row{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem}
.search-bar{display:flex;align-items:center;gap:.75rem;background:white;border:1.5px solid rgba(26,91,130,.1);border-radius:.85rem;padding:.6rem 1rem}
.search-bar input{border:none;outline:none;font-family:'Fredoka',sans-serif;font-size:.95rem;color:#1a5b82;flex:1;background:transparent}
.search-bar .material-symbols-outlined{color:#94a3b8}
.table-card{background:white;border-radius:1.25rem;overflow:hidden;box-shadow:0 4px 20px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
table{width:100%;border-collapse:collapse}
th{background:#f8fafc;font-family:'Fredoka',sans-serif;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;padding:.75rem 1rem;text-align:left}
td{padding:.85rem 1rem;border-top:1px solid rgba(26,91,130,.05);font-size:.9rem;color:#1a5b82}
td strong{font-weight:700}
.status-chip{display:inline-flex;padding:.2rem .65rem;border-radius:5rem;font-size:.75rem;font-weight:700}
.active{background:rgba(52,211,153,.1);color:#059669}
.suspended{background:rgba(229,62,62,.08);color:#e53e3e}
.actions-cell{display:flex;gap:.4rem}
.btn-icon{background:none;border:1px solid rgba(26,91,130,.12);border-radius:.5rem;padding:.35rem;cursor:pointer;display:flex;align-items:center;color:#1a5b82;transition:all .2s}
.btn-icon:hover{background:rgba(197,140,242,.1);border-color:#c58cf2;color:#c58cf2}
.btn-icon.danger:hover{background:rgba(229,62,62,.08);border-color:#e53e3e;color:#e53e3e}
.btn-icon .material-symbols-outlined{font-size:1rem}
.empty-table{text-align:center;padding:2rem;color:#94a3b8}
.btn-primary{display:inline-flex;align-items:center;gap:.4rem;background:#c58cf2;color:white;border:none;border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 15px rgba(197,140,242,.25)}
.btn-primary:hover{background:#b373e6;transform:translateY(-1px)}
.btn-secondary{display:inline-flex;align-items:center;gap:.4rem;background:white;color:#1a5b82;border:1.5px solid rgba(26,91,130,.15);border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s}
.btn-secondary:hover{border-color:#c58cf2}
.modal-overlay{position:fixed;inset:0;background:rgba(26,91,130,.45);backdrop-filter:blur(4px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-box{background:white;border-radius:1.5rem;padding:2rem;width:100%;max-width:26rem;box-shadow:0 20px 60px rgba(26,91,130,.18)}
.modal-box h2{font-family:'Fredoka',sans-serif;font-size:1.35rem;font-weight:700;color:#1a5b82;margin-bottom:1.25rem}
.form-fields{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.5rem}
.form-fields label{font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:#94a3b8}
.form-fields input{font-family:'Fredoka',sans-serif;font-size:.95rem;padding:.65rem 1rem;border-radius:.75rem;border:1.5px solid rgba(26,91,130,.15);background:#fcfaff;color:#1a5b82;outline:none}
.form-fields input:focus{border-color:#c58cf2;box-shadow:0 0 0 3px rgba(197,140,242,.12)}
.modal-actions{display:flex;gap:.75rem;justify-content:flex-end}
</style>
