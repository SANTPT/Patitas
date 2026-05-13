<template>
  <section class="hero-banner">
    <div class="hero-container container">
      <div class="hero-image-wrapper">
        <img src="../assets/hero.png" alt="Acompañando el desarrollo" class="hero-image" />
        
        <div class="hero-overlay-text">
          <h2>Acompañando el desarrollo de los más pequeños</h2>
        </div>
        
        <div class="hero-badge">
          <video 
            autoplay 
            muted 
            loop 
            playsinline 
            class="video-badge"
          >
            <source :src="videoUrl" type="video/mp4">
            Tu navegador no soporta video.
          </video>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import videoUrl from '../assets/vido_patitas.mp4';
</script>

<style scoped>
.hero-banner {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover; 
  background-repeat: no-repeat;
}

.hero-container {
  display: flex;
  justify-content: center;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 650px;
  border-radius: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}

.hero-overlay-text {
  position: absolute;
  top: 10%;
  right: 40px;
  width: 40%;
  max-width: 500px;
  text-align: right;
  z-index: 5;
}

.hero-overlay-text h2 {
  font-size: clamp(1.2rem, 4vw, 2.5rem);
  color: #2c3e50;
  line-height: 1.2;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  color: white;
  text-shadow: -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
}

.hero-badge {
  position: absolute;
  bottom: 20px;
  right: 50px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 8px solid white;
  background-color: white;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-badge {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsivo para tablets y móviles */
@media (max-width: 768px) {
  .hero-overlay-text {
    width: 70%;
    top: 20px;
    right: 20px;
  }
  
  .hero-badge {
    width: 100px;
    height: 100px;
    bottom: -30px;
    right: 20px;
    border-width: 4px;
  }
}

@media (max-width: 480px) {
  .hero-image {
    border-radius: 20px;
    max-height: 300px;
  }
  .hero-overlay-text h2 {
    font-size: 1.1rem;
  }
}
</style>