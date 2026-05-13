<template>
  <footer class="site-footer">
    <div class="footer-container container">
      
      <div class="footer-col brand-col">
        <div class="footer-logo">
          <img src="../assets/logo.png" alt="Patitas Logo" class="main-logo" />
          <h2 class="brand-name">Patitas</h2>
        </div>
        <div class="social-icons">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">ig</a>
          <a href="#" aria-label="X">x</a>
          <a href="#" aria-label="YouTube">yt</a>
          <a href="#" aria-label="TikTok">tk</a>
        </div>
      </div>
      
      <div class="footer-col payment-col">
        <h4 class="stroke-text">Métodos de pago:</h4>
        <div class="payment-methods">
          <span class="payment-icon">Visa</span>
          <span class="payment-icon">MC</span>
          <span class="payment-icon">PayPal</span>
        </div>
      </div>

      <div class="footer-col newsletter-col">
        <h4 class="stroke-text">SUSCRÍBETE A NUESTRA NEWSLETTER</h4>
        <div class="newsletter-form">
          <input type="email" placeholder="Introduce tu email..." />
          <button type="submit">Ok</button>
        </div>
      </div>

      <div class="footer-col links-wrapper">
        <div class="links-sub-col">
          <h4 class="stroke-text">Condiciones:</h4>
          <ul>
            <li><a href="#">&gt; Aviso Legal</a></li>
            <li><a href="#">&gt; Privacidad</a></li>
            <li><a href="#">&gt; Términos</a></li>
            <li><a href="#">&gt; Cookies</a></li>
          </ul>
        </div>
        
        <div class="links-sub-col">
          <h4 class="stroke-text">Ayuda:</h4>
          <ul>
            <li><a href="#">&gt; Envíos</a></li>
            <li><a href="#">&gt; Cambios</a></li>
            <li><a href="#">&gt; FAQ</a></li>
          </ul>
        </div>
      </div>

    </div>

    <div class="copyright">
      <p>Copyright 2025 | patitas</p>
    </div>
  </footer>
</template>

<style scoped>
/* CONFIGURACIÓN GENERAL */
.site-footer {
  font-family: 'Fredoka', sans-serif;
  background-image: url('../assets/fondo_morado.png');  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-top: 30px solid white;
  padding: 60px 0 20px;
  
  /* Color blanco con borde negro para TODO el footer */
  color: white;
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap; /* Evita que los textos se encimen al bajar de línea */
  gap: 40px 20px;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-col {
  flex: 1 1 200px; /* Base de 200px para que se distribuyan bien */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* LOGO Y NOMBRE */
.brand-name {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 10px 0 0;
  text-transform: uppercase;
}

.main-logo {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  object-fit: cover;
}

/* REDES SOCIALES */
.social-icons {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border: 2px solid white;
  border-radius: 50%;
  color: white;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;
  transition: transform 0.2s;
}

.social-icons a:hover {
  transform: scale(1.1);
  background: rgba(255,255,255,0.2);
}

/* TÍTULOS H4 */
h4 {
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
}

/* MÉTODOS DE PAGO */
.payment-methods {
  display: flex;
  gap: 10px;
}

.payment-icon {
  background: white;
  color: #333;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-shadow: none; /* Texto limpio para logos de pago */
  border: 1px solid #000;
}

/* NEWSLETTER */
.newsletter-form {
  display: flex;
  background: white;
  border-radius: 30px;
  padding: 5px;
  width: 100%;
  max-width: 320px;
  border: 2px solid #000;
}

.newsletter-form input {
  border: none;
  padding: 10px 15px;
  flex: 1;
  background: transparent;
  outline: none;
  font-family: 'Fredoka', sans-serif;
  text-shadow: none; /* Texto limpio al escribir */
  min-width: 0; /* Evita que el input rompa el layout */
}

.newsletter-form button {
  background-color: #c58cf2;
  color: white;
  border: 2px solid #000;
  padding: 5px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 700;
  text-transform: lowercase;
}

/* ENLACES */
.links-wrapper {
  flex-direction: row; /* En escritorio van lado a lado */
  gap: 30px;
  flex: 1.5 1 300px; /* Espacio extra para las dos listas */
}

.links-sub-col ul {
  list-style: none;
  padding: 0;
}

.links-sub-col ul li {
  margin-bottom: 10px;
}

.links-sub-col a {
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.links-sub-col a:hover {
  opacity: 0.8;
}

/* COPYRIGHT */
.copyright {
  text-align: center;
  margin-top: 50px;
  padding-top: 25px;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
}

.copyright p {
  font-size: 0.9rem;
  margin: 0;
}

/* AJUSTES RESPONSIVOS */
@media (max-width: 900px) {
  .footer-container {
    justify-content: center;
  }
  .links-wrapper {
    justify-content: space-around;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .footer-col {
    flex: 1 1 100%;
    text-align: center;
  }
  .links-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }
}
</style>