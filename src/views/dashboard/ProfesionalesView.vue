<template>
  <div class="dash-view">
    <div class="view-header">
      <div class="header-row">
        <div>
          <h1><span class="material-symbols-outlined">medical_services</span> Equipo de Profesionales</h1>
          <p>Gestiona los terapeutas y especialistas de tu centro.</p>
        </div>
        <button class="btn-primary" @click="showForm=true">
          <span class="material-symbols-outlined">person_add</span> Añadir profesional
        </button>
      </div>
    </div>
    <div class="prof-grid">
      <div class="prof-card" v-for="p in professionals" :key="p.id">
        <div class="prof-avatar">{{p.initials}}</div>
        <div class="prof-info">
          <h3>{{p.name}}</h3>
          <span class="prof-specialty">{{p.specialty}}</span>
          <p>{{p.children}} niños asignados</p>
          <p>{{p.email}}</p>
        </div>
        <div class="prof-actions">
          <span class="status-chip" :class="p.status">{{p.status==='active'?'Activo':'Suspendido'}}</span>
          <button class="btn-icon" title="Editar"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn-icon danger" title="Suspender"><span class="material-symbols-outlined">block</span></button>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal-box">
        <h2>Nuevo Profesional</h2>
        <div class="form-fields">
          <label>Nombre completo</label><input v-model="form.name" placeholder="Nombre del terapeuta" />
          <label>Email</label><input v-model="form.email" type="email" placeholder="terapeuta@centro.com" />
          <label>Especialidad</label>
          <select v-model="form.specialty">
            <option v-for="s in specialties" :key="s">{{s}}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showForm=false">Cancelar</button>
          <button class="btn-primary" @click="addProfessional">Añadir</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const showForm = ref(false);
const form = ref({name:'',email:'',specialty:'Logopedia'});
const specialties = ['Logopedia','Psicomotricidad','ABA','Psicología','Terapia Ocupacional','Otro'];
const professionals = ref([
  {id:1,name:'Dra. Laura Sanz',initials:'LS',specialty:'Logopedia',children:12,email:'l.sanz@centro.com',status:'active'},
  {id:2,name:'Pablo Moreno',initials:'PM',specialty:'Psicomotricidad',children:9,email:'p.moreno@centro.com',status:'active'},
  {id:3,name:'Ana Gutiérrez',initials:'AG',specialty:'ABA',children:11,email:'a.gutierrez@centro.com',status:'active'},
  {id:4,name:'Marcos Vidal',initials:'MV',specialty:'Terapia Ocupacional',children:7,email:'m.vidal@centro.com',status:'suspended'},
]);
function addProfessional() {
  if (!form.value.name) return;
  const initials = form.value.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  professionals.value.push({id:Date.now(),name:form.value.name,initials,specialty:form.value.specialty,children:0,email:form.value.email,status:'active'});
  form.value={name:'',email:'',specialty:'Logopedia'};
  showForm.value=false;
}
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.header-row{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem}
.prof-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(20rem,1fr));gap:1rem}
.prof-card{background:white;border-radius:1.1rem;padding:1.25rem;display:flex;align-items:flex-start;gap:1rem;box-shadow:0 4px 16px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
.prof-avatar{width:2.8rem;height:2.8rem;border-radius:50%;background:#c58cf2;color:white;font-family:'Fredoka',sans-serif;font-size:1rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.prof-info{flex:1}
.prof-info h3{font-family:'Fredoka',sans-serif;font-size:1rem;font-weight:700;color:#1a5b82;margin:0 0 .25rem}
.prof-specialty{display:inline-block;background:rgba(197,140,242,.1);color:#7c3aed;font-size:.72rem;font-weight:700;padding:.15rem .55rem;border-radius:5rem;margin-bottom:.25rem}
.prof-info p{font-size:.78rem;color:#7c8ba1;margin:.1rem 0}
.prof-actions{display:flex;flex-direction:column;gap:.4rem;align-items:flex-end;flex-shrink:0}
.status-chip{display:inline-flex;padding:.2rem .6rem;border-radius:5rem;font-size:.72rem;font-weight:700}
.active{background:rgba(52,211,153,.1);color:#059669}
.suspended{background:rgba(229,62,62,.08);color:#e53e3e}
.btn-icon{background:none;border:1px solid rgba(26,91,130,.12);border-radius:.5rem;padding:.3rem;cursor:pointer;display:flex;align-items:center;color:#1a5b82;transition:all .2s}
.btn-icon:hover{background:rgba(197,140,242,.1);border-color:#c58cf2;color:#c58cf2}
.btn-icon.danger:hover{background:rgba(229,62,62,.08);border-color:#e53e3e;color:#e53e3e}
.btn-icon .material-symbols-outlined{font-size:.95rem}
.btn-primary{display:inline-flex;align-items:center;gap:.4rem;background:#c58cf2;color:white;border:none;border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer}
.btn-secondary{display:inline-flex;align-items:center;gap:.4rem;background:white;color:#1a5b82;border:1.5px solid rgba(26,91,130,.15);border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer}
.modal-overlay{position:fixed;inset:0;background:rgba(26,91,130,.45);backdrop-filter:blur(4px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-box{background:white;border-radius:1.5rem;padding:2rem;width:100%;max-width:24rem;box-shadow:0 20px 60px rgba(26,91,130,.18)}
.modal-box h2{font-family:'Fredoka',sans-serif;font-size:1.35rem;font-weight:700;color:#1a5b82;margin-bottom:1.25rem}
.form-fields{display:flex;flex-direction:column;gap:.55rem;margin-bottom:1.5rem}
.form-fields label{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8}
.form-fields input,.form-fields select{font-family:'Fredoka',sans-serif;font-size:.95rem;padding:.6rem 1rem;border-radius:.75rem;border:1.5px solid rgba(26,91,130,.15);background:#fcfaff;color:#1a5b82;outline:none}
.form-fields input:focus,.form-fields select:focus{border-color:#c58cf2}
.modal-actions{display:flex;gap:.75rem;justify-content:flex-end}
</style>
