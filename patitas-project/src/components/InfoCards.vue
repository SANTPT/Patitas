<template>
  <section class="info-cards">
    <div class="cards-container container">
      <div class="card" v-for="(card, index) in cards" :key="index">
        <div class="card-image-placeholder"></div>
        <h3 class="card-title">{{ card.title }}</h3>
        <button class="card-btn">Leer mas</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const cards = ref([
  { title: 'QUÉ ES EL AUTISMO' },
  { title: 'GUÍA DE ATENCIÓN TEMPRANA' },
  { title: 'COMUNIDAD PATITAS' }
]);
</script>

<style scoped>
.info-cards {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover; 
  background-repeat: no-repeat;
  background-position: center;
  padding: 40px 0;
  position: relative;
  z-index: 1;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-image-placeholder {
  width: 120px;
  height: 90px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.1rem;
  color: var(--text-blue);
  margin-bottom: 20px;
  font-weight: 600;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.card-btn {
  background-color: var(--button-purple);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 2px 5px rgba(197, 140, 242, 0.4);
}

.card-btn:hover {
  background-color: #b373e6;
  transform: translateY(-2px);
}
</style>
