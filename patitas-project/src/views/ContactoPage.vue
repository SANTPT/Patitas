<template>
  <div class="contacto-page">
    <!-- Encabezado distintivo de la página con fondo azul y ola -->
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">Sobre Nosotros y Contacto</h1>
        <p class="page-subtitle">
          Descubre el equipo detrás de Patitas y ponte en contacto con nosotros. Estamos aquí para acompañar el camino de tu familia.
        </p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <!-- Cuerpo principal de la página -->
    <div class="contacto-body container">
      <!-- SECCIÓN SOBRE NOSOTROS -->
      <section class="about-section">
        <div class="about-intro">
          <h2 class="section-title">Quiénes Somos</h2>
          <p class="section-desc">
            Patitas nace con el propósito de ser un refugio de conocimiento, apoyo y comunidad para familias que transitan por la crianza neurotípica y neuroatípica, con especial enfoque en el autismo (TEA). Creamos herramientas de valor basadas en evidencia clínica y calidez humana.
          </p>
        </div>

        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon-wrap violet">
              <span class="material-symbols-outlined">diversity_1</span>
            </div>
            <h3>Familias Primero</h3>
            <p>Empoderamos a padres y cuidadores brindando recursos comprensibles y aplicables en el hogar.</p>
          </div>

          <div class="value-card">
            <div class="value-icon-wrap teal">
              <span class="material-symbols-outlined">spa</span>
            </div>
            <h3>Apoyo Clínico</h3>
            <p>Todo nuestro contenido y recomendaciones están respaldados por terapeutas y psicólogos expertos.</p>
          </div>

          <div class="value-card">
            <div class="value-icon-wrap orange">
              <span class="material-symbols-outlined">child_care</span>
            </div>
            <h3>Desarrollo Lúdico</h3>
            <p>Creemos en el juego estructurado como motor principal para el neurodesarrollo infantil.</p>
          </div>

          <div class="value-card">
            <div class="value-icon-wrap blue">
              <span class="material-symbols-outlined">groups</span>
            </div>
            <h3>Comunidad Libre</h3>
            <p>Fomentamos espacios seguros libres de juicio para compartir vivencias y resolver dudas comunes.</p>
          </div>
        </div>
      </section>

      <!-- SECCIÓN DE CONTACTO -->
      <section class="contact-section">
        <h2 class="section-title">Ponte en Contacto</h2>
        <p class="section-desc">¿Tienes alguna pregunta, sugerencia o deseas colaborar con nosotros? Completa el formulario o contáctanos directamente.</p>

        <div class="contact-grid">
          <!-- Columna Información de contacto -->
          <div class="contact-info-col">
            <div class="info-card">
              <h3>Datos de Contacto</h3>
              
              <div class="info-items">
                <div class="info-item">
                  <span class="material-symbols-outlined icon blue-bubble">mail</span>
                  <div class="info-text">
                    <strong>Correo Electrónico</strong>
                    <a href="mailto:hola@patitas.org">hola@patitas.org</a>
                  </div>
                </div>

                <div class="info-item">
                  <span class="material-symbols-outlined icon purple-bubble">phone</span>
                  <div class="info-text">
                    <strong>Teléfono de Soporte</strong>
                    <a href="tel:+34944000000">+34 944 000 000</a>
                  </div>
                </div>

                <div class="info-item">
                  <span class="material-symbols-outlined icon pink-bubble">location_on</span>
                  <div class="info-text">
                    <strong>Oficina Central</strong>
                    <p>Gran Vía de Don Diego López de Haro, 48009 Bilbao, Bizkaia, España</p>
                  </div>
                </div>
              </div>

              <!-- MAPA REAL EMBEBIDO -->
              <div class="map-container">
                <iframe
                  src="https://maps.google.com/maps?q=Gran%20V%C3%ADa%20de%20Don%20Diego%20L%C3%B3pez%20de%20Haro,%2048009%20Bilbao,%20Espa%C3%B1a&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style="border:0;"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Ubicación Patitas Bilbao"
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Columna Formulario -->
          <div class="contact-form-col">
            <form @submit.prevent="handleSubmit" class="contact-form">
              <div class="form-group">
                <label for="name">Nombre Completo</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="form.name" 
                  placeholder="Tu nombre completo..." 
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="form.email" 
                  placeholder="tu@correo.com..." 
                  required
                />
              </div>

              <div class="form-group">
                <label for="subject">Asunto</label>
                <input 
                  type="text" 
                  id="subject" 
                  v-model="form.subject" 
                  placeholder="¿En qué podemos ayudarte?..." 
                  required
                />
              </div>

              <div class="form-group">
                <label for="message">Mensaje</label>
                <textarea 
                  id="message" 
                  v-model="form.message" 
                  rows="5" 
                  placeholder="Escribe tu mensaje aquí..." 
                  required
                ></textarea>
              </div>

              <button type="submit" class="submit-btn" :disabled="submitting">
                <span class="material-symbols-outlined">{{ submitting ? 'progress_activity' : 'send' }}</span>
                <span>{{ submitting ? 'Enviando...' : 'Enviar mensaje' }}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const submitting = ref(false);

const handleSubmit = () => {
  submitting.value = true;
  
  // Simular envío de formulario
  setTimeout(() => {
    submitting.value = false;
    
    // Disparar toast de éxito
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: '¡Mensaje enviado con éxito! Te responderemos muy pronto.', 
        type: 'success' 
      }
    }));

    // Resetear formulario
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }, 1200);
};
</script>

<style scoped>
.contacto-page {
  background-color: var(--page-bg, #f0f8ff);
  min-height: 100vh;
  padding-bottom: 5rem;
  color: var(--text-blue, #1a5b82);
  font-family: 'Fredoka', sans-serif;
}

/* Page Header */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 4.5rem 0 5.5rem;
  text-align: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.header-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(197, 140, 242, 0.35);
  color: var(--text-blue, #1a5b82);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 1rem;
  border-radius: 5rem;
}

.page-title {
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 700;
  margin: 0;
}

.page-subtitle {
  font-size: 1.05rem;
  opacity: 0.85;
  max-width: 38rem;
  line-height: 1.6;
  margin: 0;
}

.header-wave-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.11rem;
  z-index: 2;
}

.header-wave-bottom svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Cuerpo de la Página */
.contacto-body {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
}

.section-desc {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  line-height: 1.6;
  text-align: center;
  max-width: 42rem;
  margin: 0 auto 2.5rem;
  opacity: 0.8;
}

/* Valores Nosotros */
.values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 36rem) {
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 62rem) {
  .values-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.value-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 8px 25px rgba(26, 91, 130, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.value-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(197, 140, 242, 0.1);
}

.value-icon-wrap {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.value-icon-wrap span {
  font-size: 1.6rem;
}

.value-icon-wrap.violet { background: #f3e5f5; color: #7e22ce; }
.value-icon-wrap.teal { background: #e0f2f1; color: #00695c; }
.value-icon-wrap.orange { background: #fff3e0; color: #ef6c00; }
.value-icon-wrap.blue { background: #e3f2fd; color: #1565c0; }

.value-card h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.value-card p {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.75;
}

/* Sección de Contacto Grid */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

@media (min-width: 48rem) {
  .contact-grid {
    grid-template-columns: 1fr 1.2fr;
  }
}

.info-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px rgba(26, 91, 130, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(26, 91, 130, 0.08);
}

.info-card h3 {
  font-size: 1.35rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
}

.info-card h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 2rem;
  height: 3px;
  background: var(--button-purple, #c58cf2);
  border-radius: 5px;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-item .icon {
  font-size: 1.4rem;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-item .icon.blue-bubble {
  color: #5bbfd6;
  background: rgba(91, 191, 214, 0.1);
}

.info-item .icon.purple-bubble {
  color: #c58cf2;
  background: rgba(197, 140, 242, 0.1);
}

.info-item .icon.pink-bubble {
  color: #fc8181;
  background: rgba(252, 129, 129, 0.1);
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-text strong {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
}

.info-text a, .info-text p {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  line-height: 1.4;
}

.info-text a:hover {
  color: var(--button-purple, #c58cf2);
  text-decoration: underline;
}

/* Real Map Container */
.map-container {
  width: 100%;
  height: 20rem;
  border-radius: 1rem;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(26, 91, 130, 0.1);
  box-shadow: 0 4px 15px rgba(26, 91, 130, 0.05);
  transition: all 0.3s ease;
}

.map-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(26, 91, 130, 0.12);
  border-color: rgba(197, 140, 242, 0.3);
}

/* Formulario */
.contact-form {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px rgba(26, 91, 130, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.contact-form:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(26, 91, 130, 0.08);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
}

.form-group input, .form-group textarea {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid rgba(197, 140, 242, 0.2);
  color: var(--text-blue, #1a5b82);
  background: #fcf8ff;
  outline: none;
  transition: all 0.22s ease;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: var(--button-purple, #c58cf2);
  background: white;
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.12);
}

.submit-btn {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  background: var(--button-purple, #c58cf2);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.22s ease;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
  margin-top: 0.5rem;
}

.submit-btn:hover {
  background: var(--button-purple-hover, #b373e6);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(197, 140, 242, 0.35);
}

.submit-btn:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
