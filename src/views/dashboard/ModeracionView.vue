<template>
  <div class="dash-view">
    <div class="view-header">
      <h1><span class="material-symbols-outlined">gavel</span> Moderación de Contenidos</h1>
      <p>Gestiona solicitudes de eliminación del foro, historias pendientes y contenido reportado.</p>
    </div>
    <div class="tabs-row">
      <button v-for="t in tabs" :key="t.id" class="tab-btn" :class="{active:activeTab===t.id}" @click="activeTab=t.id">
        {{t.label}} <span v-if="t.count" class="tab-badge">{{t.count}}</span>
      </button>
    </div>

    <!-- Solicitudes de eliminación -->
    <div v-if="activeTab==='requests'" class="items-list">
      <div class="mod-card" v-for="r in deleteRequests" :key="r.id">
        <div class="mod-card-info">
          <span class="mod-type">📝 Post del foro</span>
          <h3>{{r.title}}</h3>
          <p>Autor: <strong>{{r.author}}</strong> · {{r.comments}} comentarios · Solicitado {{r.date}}</p>
        </div>
        <div class="mod-actions">
          <button class="btn-approve" @click="deleteRequests=deleteRequests.filter(x=>x.id!==r.id)">
            <span class="material-symbols-outlined">check</span> Aprobar eliminación
          </button>
          <button class="btn-reject" @click="deleteRequests=deleteRequests.filter(x=>x.id!==r.id)">
            <span class="material-symbols-outlined">close</span> Rechazar
          </button>
        </div>
      </div>
      <div v-if="!deleteRequests.length" class="empty-state">
        <span class="material-symbols-outlined">check_circle</span>
        <p>No hay solicitudes pendientes.</p>
      </div>
    </div>

    <!-- Historias pendientes -->
    <div v-if="activeTab==='stories'" class="items-list">
      <div class="mod-card" v-for="s in pendingStories" :key="s.id">
        <div class="mod-card-info">
          <span class="mod-type">⭐ Historia de éxito</span>
          <h3>{{s.title}}</h3>
          <p>Por: <strong>{{s.author}}</strong> · Enviada {{s.date}}</p>
          <p class="story-excerpt">{{s.excerpt}}</p>
        </div>
        <div class="mod-actions">
          <button class="btn-approve" @click="pendingStories=pendingStories.filter(x=>x.id!==s.id)">
            <span class="material-symbols-outlined">check</span> Aprobar
          </button>
          <button class="btn-reject" @click="pendingStories=pendingStories.filter(x=>x.id!==s.id)">
            <span class="material-symbols-outlined">close</span> Rechazar
          </button>
        </div>
      </div>
      <div v-if="!pendingStories.length" class="empty-state">
        <span class="material-symbols-outlined">check_circle</span>
        <p>No hay historias pendientes de aprobación.</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const activeTab = ref('requests');
const tabs = [
  {id:'requests',label:'Solicitudes de eliminación',count:2},
  {id:'stories',label:'Historias pendientes',count:1},
];
const deleteRequests = ref([
  {id:1,title:'¿Cómo hablar con el cole sobre el diagnóstico?',author:'María G.',comments:5,date:'hace 2 días'},
  {id:2,title:'Recursos gratuitos de logopedia online',author:'Carlos M.',comments:3,date:'hace 4 días'},
]);
const pendingStories = ref([
  {id:1,title:'Lucas aprendió a leer con pictogramas',author:'Ana Fernández',date:'hace 1 día',excerpt:'Cuando nos dijeron el diagnóstico, sentí que el mundo se me caía encima. Pero con paciencia y los recursos adecuados…'},
]);
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.tabs-row{display:flex;gap:.5rem;flex-wrap:wrap}
.tab-btn{display:inline-flex;align-items:center;gap:.4rem;background:white;border:1.5px solid rgba(26,91,130,.12);border-radius:5rem;padding:.55rem 1.1rem;font-family:'Fredoka',sans-serif;font-size:.9rem;font-weight:600;color:#1a5b82;cursor:pointer;transition:all .2s}
.tab-btn.active{background:#c58cf2;color:white;border-color:#c58cf2}
.tab-badge{background:rgba(229,62,62,.15);color:#e53e3e;border-radius:5rem;padding:.1rem .5rem;font-size:.75rem;font-weight:700}
.tab-btn.active .tab-badge{background:rgba(255,255,255,.25);color:white}
.items-list{display:flex;flex-direction:column;gap:.85rem}
.mod-card{background:white;border-radius:1.1rem;padding:1.25rem 1.5rem;border:1.5px solid rgba(26,91,130,.07);box-shadow:0 4px 16px rgba(26,91,130,.04);display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap}
.mod-type{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8}
.mod-card-info h3{font-family:'Fredoka',sans-serif;font-size:1.05rem;font-weight:700;color:#1a5b82;margin:.3rem 0 .2rem}
.mod-card-info p{font-size:.82rem;color:#7c8ba1;margin:.1rem 0}
.story-excerpt{font-style:italic;color:#94a3b8!important}
.mod-actions{display:flex;gap:.5rem;flex-shrink:0;align-items:flex-start;flex-wrap:wrap}
.btn-approve{display:inline-flex;align-items:center;gap:.35rem;background:rgba(52,211,153,.1);color:#059669;border:1.5px solid rgba(52,211,153,.3);border-radius:5rem;padding:.5rem .9rem;font-family:'Fredoka',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;transition:all .2s}
.btn-approve:hover{background:#059669;color:white}
.btn-reject{display:inline-flex;align-items:center;gap:.35rem;background:rgba(229,62,62,.06);color:#e53e3e;border:1.5px solid rgba(229,62,62,.2);border-radius:5rem;padding:.5rem .9rem;font-family:'Fredoka',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;transition:all .2s}
.btn-reject:hover{background:#e53e3e;color:white}
.btn-approve .material-symbols-outlined,.btn-reject .material-symbols-outlined{font-size:.95rem}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:3rem 1rem;background:white;border-radius:1.1rem;border:1.5px solid rgba(26,91,130,.06);color:#94a3b8;text-align:center}
.empty-state .material-symbols-outlined{font-size:3rem;color:#34d399}
</style>
