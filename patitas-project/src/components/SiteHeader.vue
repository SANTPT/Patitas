<template>
  <header class="site-header">
    <div class="header-content container">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="Patitas Logo" class="logo" />
      </div>
      <nav class="main-nav">
        <ul>
          <li><a href="#" class="active">inicio</a></li>
          <li><a href="#">recursos</a></li>
          <li><a href="#">tienda</a></li>
          <li><a href="#">nosotros</a></li>
          <li><a href="#">contacto</a></li>
        </ul>
      </nav>
      <div class="nav-icons">
        <button class="icon-btn"><span class="material-symbols-outlined">search</span></button>
        <button class="icon-btn"><span class="material-symbols-outlined">shopping_cart</span></button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background-color: var(--primary-bg);
  padding: 10px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
  object-fit: cover;
}

.logo-text {
  font-size: 1.5rem;
  color: var(--text-blue);
  font-weight: 600;
  margin-top: 5px;
  text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
}

.main-nav {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  background: white;
  margin: 0 20px;
  border-radius: 30px;
  padding: 10px 20px;
}

.main-nav ul {
  display: flex;
  gap: 20px;
  align-items: center;
}

.main-nav a {
  color: var(--text-blue);
  font-weight: 500;
  font-size: 1.2rem;
  padding: 5px 15px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.main-nav a.active {
  background-color: var(--button-purple);
  color: white;
}

.main-nav a:hover:not(.active) {
  background-color: rgba(197, 140, 242, 0.2);
}

.nav-icons {
  display: flex;
  gap: 15px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.icon-btn:hover {
  background-color: rgba(255,255,255,0.5);
}

.icon-btn span {
  font-size: 28px;
}

header {
  background-image: url('../assets/fondo_morado.png');   
  
  background-size: cover; 
  background-position: center;
  background-repeat: no-repeat;
  
  border-bottom: 40px solid white; 
  
  padding: 20px 0 0 0; 
  
  position: relative;
  z-index: 10;
}
</style>
