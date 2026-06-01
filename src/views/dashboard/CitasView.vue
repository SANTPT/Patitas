<template>
  <div class="dash-view">
    <div class="view-header">
      <div class="header-row">
        <div>
          <h1><span class="material-symbols-outlined">calendar_month</span> Gestión de Citas</h1>
          <p>Agenda y administra las citas terapéuticas del centro.</p>
        </div>
        <button class="btn-primary" @click="showForm=true">
          <span class="material-symbols-outlined">add</span> Nueva cita
        </button>
      </div>
    </div>
    <div class="filter-bar">
      <select v-model="filterStatus"><option value="">Todos los estados</option><option value="programada">Programadas</option><option value="completada">Completadas</option><option value="cancelada">Canceladas</option></select>
    </div>
    <div class="citas-list">
      <div class="cita-card" v-for="c in filtered" :key="c.id">
        <div class="cita-date">
          <span class="cita-day">{{c.day}}</span>
          <span class="cita-month">{{c.month}}</span>
          <span class="cita-time">{{c.time}}</span>
        </div>
        <div class="cita-info">
          <h3>{{c.child}} <span class="with-text">con</span> {{c.professional}}</h3>
          <p><span class="material-symbols-outlined">medical_services</span> {{c.type}}</p>
          <p><span class="material-symbols-outlined">schedule</span> {{c.duration}} min</p>
        </div>
        <div class="cita-actions">
          <span class="status-chip" :class="c.status">{{statusLabel(c.status)}}</span>
          <button v-if="c.status==='programada'" class="btn-icon" title="Editar"><span class="material-symbols-outlined">edit</span></button>
          <button v-if="c.status==='programada'" class="btn-icon danger" title="Cancelar" @click="citas=citas.filter(x=>x.id!==c.id)"><span class="material-symbols-outlined">cancel</span></button>
        </div>
      </div>
      <div v-if="!filtered.length" class="empty-state">
        <span class="material-symbols-outlined">event_busy</span>
        <p>No hay citas con ese filtro.</p>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal-box">
        <h2>Nueva Cita</h2>
        <div class="form-fields">
          <label>Niño</label><input v-model="form.child" placeholder="Nombre del niño" />
          <label>Profesional</label><input v-model="form.professional" placeholder="Nombre del profesional" />
          <label>Fecha</label><input v-model="form.date" type="date" />
          <label>Hora</label><input v-model="form.time" type="time" />
          <label>Tipo de terapia</label><input v-model="form.type" placeholder="Ej: Logopedia" />
          <label>Duración (min)</label><input v-model="form.duration" type="number" placeholder="45" />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showForm=false">Cancelar</button>
          <button class="btn-primary" @click="saveCita">Guardar cita</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
const showForm = ref(false);
const filterStatus = ref('');
const form = ref({child:'',professional:'',date:'',time:'',type:'',duration:45});
const citas = ref([
  {id:1,day:'28',month:'Jun',time:'09:00',child:'Lucas M.',professional:'Dra. Laura Sanz',type:'Logopedia',duration:45,status:'programada'},
  {id:2,day:'28',month:'Jun',time:'10:30',child:'Sofía R.',professional:'Pablo Moreno',type:'Psicomotricidad',duration:60,status:'programada'},
  {id:3,day:'27',month:'Jun',time:'11:00',child:'Marcos T.',professional:'Ana Gutiérrez',type:'ABA',duration:45,status:'completada'},
  {id:4,day:'26',month:'Jun',time:'09:30',child:'Emma V.',professional:'Dra. Laura Sanz',type:'Logopedia',duration:45,status:'cancelada'},
]);
const filtered = computed(()=>filterStatus.value?citas.value.filter(c=>c.status===filterStatus.value):citas.value);
function statusLabel(s){return {programada:'Programada',completada:'Completada',cancelada:'Cancelada'}[s]||s}
function saveCita(){
  if(!form.value.child) return;
  const d = new Date(form.value.date);
  citas.value.unshift({id:Date.now(),day:d.getDate().toString(),month:d.toLocaleString('es',{month:'short'}),time:form.value.time,child:form.value.child,professional:form.value.professional,type:form.value.type,duration:form.value.duration,status:'programada'});
  form.value={child:'',professional:'',date:'',time:'',type:'',duration:45};
  showForm.value=false;
}
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.header-row{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem}
.filter-bar select{font-family:'Fredoka',sans-serif;font-size:.9rem;padding:.5rem 1rem;border-radius:.75rem;border:1.5px solid rgba(26,91,130,.15);background:white;color:#1a5b82;outline:none}
.citas-list{display:flex;flex-direction:column;gap:.75rem}
.cita-card{background:white;border-radius:1.1rem;padding:1.1rem 1.25rem;display:flex;align-items:center;gap:1.25rem;box-shadow:0 4px 16px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
.cita-date{display:flex;flex-direction:column;align-items:center;min-width:3rem;text-align:center}
.cita-day{font-family:'Fredoka',sans-serif;font-size:1.6rem;font-weight:700;color:#1a5b82;line-height:1}
.cita-month{font-size:.7rem;text-transform:uppercase;color:#94a3b8;font-weight:700}
.cita-time{font-size:.8rem;font-weight:600;color:#c58cf2;margin-top:.2rem}
.cita-info{flex:1}
.cita-info h3{font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;color:#1a5b82;margin:0 0 .3rem}
.with-text{font-weight:400;color:#94a3b8}
.cita-info p{font-size:.8rem;color:#7c8ba1;margin:.1rem 0;display:flex;align-items:center;gap:.3rem}
.cita-info .material-symbols-outlined{font-size:.9rem;color:#c58cf2}
.cita-actions{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;justify-content:flex-end}
.status-chip{display:inline-flex;padding:.2rem .65rem;border-radius:5rem;font-size:.72rem;font-weight:700}
.programada{background:rgba(59,130,246,.1);color:#1d4ed8}
.completada{background:rgba(52,211,153,.1);color:#059669}
.cancelada{background:rgba(148,163,184,.1);color:#64748b}
.btn-icon{background:none;border:1px solid rgba(26,91,130,.12);border-radius:.5rem;padding:.3rem;cursor:pointer;display:flex;align-items:center;color:#1a5b82;transition:all .2s}
.btn-icon:hover{background:rgba(197,140,242,.1);border-color:#c58cf2}
.btn-icon.danger:hover{background:rgba(229,62,62,.08);border-color:#e53e3e;color:#e53e3e}
.btn-icon .material-symbols-outlined{font-size:.95rem}
.btn-primary{display:inline-flex;align-items:center;gap:.4rem;background:#c58cf2;color:white;border:none;border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer}
.btn-secondary{display:inline-flex;align-items:center;gap:.4rem;background:white;color:#1a5b82;border:1.5px solid rgba(26,91,130,.15);border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:3rem;background:white;border-radius:1.1rem;border:1.5px solid rgba(26,91,130,.06);color:#94a3b8;text-align:center}
.empty-state .material-symbols-outlined{font-size:3rem}
.modal-overlay{position:fixed;inset:0;background:rgba(26,91,130,.45);backdrop-filter:blur(4px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-box{background:white;border-radius:1.5rem;padding:2rem;width:100%;max-width:26rem;box-shadow:0 20px 60px rgba(26,91,130,.18);max-height:90vh;overflow-y:auto}
.modal-box h2{font-family:'Fredoka',sans-serif;font-size:1.35rem;font-weight:700;color:#1a5b82;margin-bottom:1.25rem}
.form-fields{display:grid;grid-template-columns:1fr 1fr;gap:.55rem .85rem;margin-bottom:1.5rem}
.form-fields label{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;align-self:end}
.form-fields input{font-family:'Fredoka',sans-serif;font-size:.9rem;padding:.6rem 1rem;border-radius:.75rem;border:1.5px solid rgba(26,91,130,.15);background:#fcfaff;color:#1a5b82;outline:none}
.form-fields input:focus{border-color:#c58cf2}
.modal-actions{display:flex;gap:.75rem;justify-content:flex-end}
</style>
