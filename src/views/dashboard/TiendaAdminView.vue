<template>
  <div class="dash-view">
    <div class="view-header">
      <div class="header-row">
        <div>
          <h1><span class="material-symbols-outlined">storefront</span> Gestión de Tienda</h1>
          <p>Administra productos, categorías y pedidos de la tienda Patitas.</p>
        </div>
        <RouterLink to="/tienda" class="btn-secondary" target="_blank">
          <span class="material-symbols-outlined">open_in_new</span> Ver tienda
        </RouterLink>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat" v-for="s in stats" :key="s.label">
        <span class="material-symbols-outlined" :style="{color:s.color}">{{s.icon}}</span>
        <div><span class="stat-val">{{s.val}}</span><span class="stat-lbl">{{s.label}}</span></div>
      </div>
    </div>
    <div class="section-title-row"><h2>Productos recientes</h2><span class="coming-badge">Gestión completa próximamente</span></div>
    <div class="table-card">
      <table>
        <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td><strong>{{p.name}}</strong></td>
            <td>{{p.cat}}</td>
            <td>{{p.price}}€</td>
            <td>{{p.stock}}</td>
            <td><span class="status-chip" :class="p.status">{{p.status==='active'?'Publicado':'Oculto'}}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { RouterLink } from 'vue-router';
const stats = [
  {icon:'shopping_bag',label:'Pedidos este mes',val:'128',color:'#c58cf2'},
  {icon:'payments',label:'Ventas',val:'€4.320',color:'#059669'},
  {icon:'inventory_2',label:'Productos activos',val:'47',color:'#3b82f6'},
  {icon:'assignment_return',label:'Devoluciones',val:'3',color:'#d97706'},
];
const products = [
  {id:1,name:'Puzzle Sensorial 48 piezas',cat:'Cognitivo',price:'24.99',stock:18,status:'active'},
  {id:2,name:'Balancín Montessori',cat:'Motor',price:'89.99',stock:5,status:'active'},
  {id:3,name:'Kit de Pictogramas',cat:'Comunicación',price:'34.99',stock:22,status:'active'},
  {id:4,name:'Tarjetas de Emociones',cat:'Social',price:'19.99',stock:0,status:'hidden'},
];
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.header-row{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem}
.btn-secondary{display:inline-flex;align-items:center;gap:.4rem;background:white;color:#1a5b82;border:1.5px solid rgba(26,91,130,.15);border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;text-decoration:none}
.btn-secondary:hover{border-color:#c58cf2}
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1rem}
.stat{background:white;border-radius:1.1rem;padding:1.25rem;display:flex;align-items:center;gap:.85rem;box-shadow:0 4px 20px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
.stat .material-symbols-outlined{font-size:2rem}
.stat-val{display:block;font-family:'Fredoka',sans-serif;font-size:1.5rem;font-weight:700;color:#1a5b82;line-height:1.1}
.stat-lbl{display:block;font-size:.75rem;color:#94a3b8}
.section-title-row{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.section-title-row h2{font-family:'Fredoka',sans-serif;font-size:1.15rem;font-weight:700;color:#1a5b82}
.coming-badge{background:#fef3c7;color:#d97706;font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:5rem}
.table-card{background:white;border-radius:1.25rem;overflow:hidden;box-shadow:0 4px 20px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
table{width:100%;border-collapse:collapse}
th{background:#f8fafc;font-family:'Fredoka',sans-serif;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;padding:.75rem 1rem;text-align:left}
td{padding:.85rem 1rem;border-top:1px solid rgba(26,91,130,.05);font-size:.9rem;color:#1a5b82}
.status-chip{display:inline-flex;padding:.2rem .65rem;border-radius:5rem;font-size:.75rem;font-weight:700}
.active{background:rgba(52,211,153,.1);color:#059669}
.hidden{background:rgba(148,163,184,.1);color:#64748b}
</style>
