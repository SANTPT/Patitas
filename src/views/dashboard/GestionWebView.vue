<template>
  <div class="dash-view">
    <div class="view-header">
      <h1><span class="material-symbols-outlined">settings_applications</span> Gestión Web</h1>
      <p>Administra el contenido y configuración general de la plataforma Patitas.</p>
    </div>
    <div class="cards-grid">
      <div class="info-card" v-for="card in cards" :key="card.title">
        <span class="material-symbols-outlined card-icon" :style="{color: card.color}">{{card.icon}}</span>
        <div>
          <h3>{{card.title}}</h3>
          <p>{{card.desc}}</p>
        </div>
        <span class="badge coming">Próximamente</span>
      </div>
    </div>
  </div>
</template>
<script setup>
const cards = [
  { icon:'home',title:'Página de inicio',desc:'Edita el hero, banners y secciones destacadas.',color:'#c58cf2' },
  { icon:'article',title:'Blog y recursos',desc:'Gestiona artículos, guías y recursos publicados.',color:'#3b82f6' },
  { icon:'storefront',title:'Tienda',desc:'Configura categorías, banners y promociones.',color:'#059669' },
  { icon:'campaign',title:'Comunicaciones',desc:'Envía notificaciones y emails a usuarios.',color:'#d97706' },
];
</script>
<style scoped>
.dash-view { display:flex;flex-direction:column;gap:1.5rem; }
.view-header h1 { font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem; }
.view-header p { color:#7c8ba1;font-size:.95rem; }
.view-header .material-symbols-outlined { font-size:2rem;color:#c58cf2; }
.cards-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:1rem; }
.info-card { background:white;border-radius:1.25rem;padding:1.5rem;display:flex;flex-direction:column;gap:.75rem;box-shadow:0 4px 20px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06);position:relative; }
.card-icon { font-size:2rem; }
.info-card h3 { font-family:'Fredoka',sans-serif;font-size:1.05rem;font-weight:700;color:#1a5b82;margin:0; }
.info-card p { font-size:.85rem;color:#7c8ba1;margin:0;line-height:1.4; }
.badge { display:inline-flex;align-items:center;padding:.2rem .65rem;border-radius:5rem;font-size:.72rem;font-weight:700; }
.coming { background:#fef3c7;color:#d97706; }
</style>
