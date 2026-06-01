<template>
  <div class="dash-view">
    <div class="view-header">
      <div class="header-row">
        <div>
          <h1><span class="material-symbols-outlined">event_note</span> Mis Eventos</h1>
          <p>Talleres y actividades a los que te has inscrito en Patitas.</p>
        </div>
        <RouterLink to="/comunidad?tab=eventos" class="btn-primary">
          <span class="material-symbols-outlined">add</span> Explorar eventos
        </RouterLink>
      </div>
    </div>

    <!-- Próximos -->
    <div v-if="upcoming.length">
      <h2 class="section-h2">Próximos ({{upcoming.length}})</h2>
      <div class="events-list">
        <div class="event-card" v-for="e in upcoming" :key="e.id">
          <div class="event-date">
            <span class="ev-day">{{e.day}}</span>
            <span class="ev-month">{{e.month}}</span>
          </div>
          <div class="event-info">
            <h3>{{e.title}}</h3>
            <p><span class="material-symbols-outlined">schedule</span> {{e.time}} · {{e.duration}}</p>
            <p><span class="material-symbols-outlined">{{e.online?'videocam':'location_on'}}</span> {{e.online?'Online':'Presencial'}} — {{e.location}}</p>
          </div>
          <div class="event-actions">
            <span class="inscrito-badge"><span class="material-symbols-outlined">check_circle</span> Inscrito</span>
            <button class="btn-cancel" @click="upcoming=upcoming.filter(x=>x.id!==e.id)">
              <span class="material-symbols-outlined">cancel</span> Cancelar inscripción
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pasados -->
    <details v-if="past.length" class="past-section">
      <summary class="section-h2">Eventos pasados ({{past.length}})</summary>
      <div class="events-list mt">
        <div class="event-card past" v-for="e in past" :key="e.id">
          <div class="event-date past-date"><span class="ev-day">{{e.day}}</span><span class="ev-month">{{e.month}}</span></div>
          <div class="event-info"><h3>{{e.title}}</h3><p>{{e.location}}</p></div>
          <span class="past-badge">Asistido</span>
        </div>
      </div>
    </details>

    <div v-if="!upcoming.length && !past.length" class="empty-state">
      <span class="material-symbols-outlined">event_busy</span>
      <h2>Sin eventos inscritos</h2>
      <p>Explora los eventos de la comunidad Patitas y apúntate a los que te interesen.</p>
      <RouterLink to="/comunidad?tab=eventos" class="btn-primary">Ver eventos disponibles</RouterLink>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
const upcoming = ref([
  {id:1,day:'10',month:'Jul',time:'18:00',duration:'2h',title:'Taller: Comunicación con pictogramas',online:true,location:'Zoom'},
  {id:2,day:'20',month:'Jul',time:'10:00',duration:'3h',title:'Jornada familiar de ocio inclusivo',online:false,location:'Parque de Doña Casilda, Bilbao'},
]);
const past = ref([
  {id:3,day:'15',month:'Jun',title:'Charla: Diagnóstico temprano del TEA',location:'Centro Patitas Bilbao'},
]);
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.header-row{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem}
.section-h2{font-family:'Fredoka',sans-serif;font-size:1.1rem;font-weight:700;color:#1a5b82;margin-bottom:.75rem;cursor:pointer}
.events-list{display:flex;flex-direction:column;gap:.75rem}
.mt{margin-top:.75rem}
.event-card{background:white;border-radius:1.1rem;padding:1.1rem 1.25rem;display:flex;align-items:flex-start;gap:1.25rem;box-shadow:0 4px 16px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06);flex-wrap:wrap}
.event-card.past{opacity:.65}
.event-date{display:flex;flex-direction:column;align-items:center;min-width:3rem;text-align:center;flex-shrink:0}
.ev-day{font-family:'Fredoka',sans-serif;font-size:1.6rem;font-weight:700;color:#1a5b82;line-height:1}
.ev-month{font-size:.7rem;text-transform:uppercase;color:#94a3b8;font-weight:700}
.past-date .ev-day,.past-date .ev-month{color:#94a3b8}
.event-info{flex:1}
.event-info h3{font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;color:#1a5b82;margin:0 0 .3rem}
.event-info p{font-size:.8rem;color:#7c8ba1;margin:.15rem 0;display:flex;align-items:center;gap:.3rem}
.event-info .material-symbols-outlined{font-size:.9rem;color:#c58cf2}
.event-actions{display:flex;flex-direction:column;gap:.4rem;align-items:flex-end}
.inscrito-badge{display:inline-flex;align-items:center;gap:.3rem;background:rgba(52,211,153,.1);color:#059669;padding:.25rem .75rem;border-radius:5rem;font-size:.78rem;font-weight:700}
.inscrito-badge .material-symbols-outlined{font-size:.9rem}
.past-badge{display:inline-flex;align-items:center;background:rgba(148,163,184,.1);color:#64748b;padding:.25rem .75rem;border-radius:5rem;font-size:.78rem;font-weight:700}
.btn-cancel{display:inline-flex;align-items:center;gap:.3rem;background:rgba(229,62,62,.06);color:#e53e3e;border:1.5px solid rgba(229,62,62,.2);border-radius:5rem;padding:.4rem .85rem;font-family:'Fredoka',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .2s}
.btn-cancel:hover{background:#e53e3e;color:white}
.btn-cancel .material-symbols-outlined{font-size:.85rem}
.past-section{border:none;outline:none}
.btn-primary{display:inline-flex;align-items:center;gap:.4rem;background:#c58cf2;color:white;border:none;border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;text-decoration:none}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:.85rem;padding:3rem 1rem;background:white;border-radius:1.25rem;border:1.5px solid rgba(26,91,130,.06);color:#94a3b8;text-align:center}
.empty-state .material-symbols-outlined{font-size:3.5rem;color:#c58cf2;opacity:.4}
.empty-state h2{font-family:'Fredoka',sans-serif;font-size:1.25rem;color:#1a5b82}
.empty-state p{font-size:.9rem;max-width:24rem;line-height:1.5}
</style>
