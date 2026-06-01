<template>
  <div class="dash-view">
    <div class="view-header">
      <h1><span class="material-symbols-outlined">trending_up</span> Seguimiento de Progreso</h1>
      <p>Visualiza el avance de tus niños asignados en cada área de desarrollo.</p>
    </div>
    <div class="children-list">
      <div class="child-progress-card" v-for="child in children" :key="child.id">
        <div class="child-header">
          <div class="child-avatar">{{child.initials}}</div>
          <div><h3>{{child.name}}</h3><p>{{child.age}} años · {{child.diagnosis}}</p></div>
          <span class="trend-badge" :class="child.trend">
            <span class="material-symbols-outlined">{{child.trend==='up'?'trending_up':'trending_flat'}}</span>
            {{child.trend==='up'?'Mejorando':'Estable'}}
          </span>
        </div>
        <div class="progress-bars">
          <div class="prog-bar-row" v-for="area in child.areas" :key="area.name">
            <span class="area-label">{{area.name}}</span>
            <div class="bar-track"><div class="bar-fill" :style="{width:area.value+'%',background:area.color}"></div></div>
            <span class="area-val">{{area.value}}%</span>
          </div>
        </div>
        <div class="child-footer">
          <span>Última sesión: {{child.lastSession}}</span>
          <RouterLink :to="'/dashboard/admin-profesional/mis-ninos/'+child.id" class="btn-link">Ver perfil completo →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { RouterLink } from 'vue-router';
const children = [
  {id:1,initials:'LM',name:'Lucas M.',age:6,diagnosis:'TEA Nivel 1',trend:'up',lastSession:'Hoy',areas:[
    {name:'Comunicación',value:72,color:'#c58cf2'},{name:'Social',value:58,color:'#3b82f6'},
    {name:'Cognitivo',value:80,color:'#059669'},{name:'Motor',value:65,color:'#d97706'}
  ]},
  {id:2,initials:'SR',name:'Sofía R.',age:4,diagnosis:'TEA Nivel 2',trend:'flat',lastSession:'Ayer',areas:[
    {name:'Comunicación',value:45,color:'#c58cf2'},{name:'Social',value:38,color:'#3b82f6'},
    {name:'Cognitivo',value:62,color:'#059669'},{name:'Motor',value:70,color:'#d97706'}
  ]},
];
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.children-list{display:flex;flex-direction:column;gap:1rem}
.child-progress-card{background:white;border-radius:1.25rem;padding:1.5rem;box-shadow:0 4px 20px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
.child-header{display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap}
.child-avatar{width:2.8rem;height:2.8rem;border-radius:50%;background:#c58cf2;color:white;font-family:'Fredoka',sans-serif;font-size:1rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.child-header h3{font-family:'Fredoka',sans-serif;font-size:1.05rem;font-weight:700;color:#1a5b82;margin:0 0 .2rem}
.child-header p{font-size:.8rem;color:#7c8ba1;margin:0}
.trend-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .75rem;border-radius:5rem;font-size:.78rem;font-weight:700;margin-left:auto}
.trend-badge.up{background:rgba(52,211,153,.1);color:#059669}
.trend-badge.flat{background:rgba(148,163,184,.1);color:#64748b}
.trend-badge .material-symbols-outlined{font-size:.9rem}
.progress-bars{display:flex;flex-direction:column;gap:.65rem;margin-bottom:1rem}
.prog-bar-row{display:flex;align-items:center;gap:.75rem}
.area-label{font-size:.8rem;font-weight:600;color:#7c8ba1;width:7rem;flex-shrink:0}
.bar-track{flex:1;height:.55rem;background:#f1f5f9;border-radius:5rem;overflow:hidden}
.bar-fill{height:100%;border-radius:5rem;transition:width .8s ease}
.area-val{font-size:.8rem;font-weight:700;color:#1a5b82;width:2.5rem;text-align:right}
.child-footer{display:flex;justify-content:space-between;align-items:center;font-size:.82rem;color:#94a3b8;padding-top:.85rem;border-top:1px dashed rgba(26,91,130,.08)}
.btn-link{color:#c58cf2;font-weight:600;text-decoration:none}
.btn-link:hover{text-decoration:underline}
</style>
