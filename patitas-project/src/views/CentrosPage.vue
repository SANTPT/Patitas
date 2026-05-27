<template>
  <div class="centros-page">
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">Centros de Atención Temprana</h1>
        <p class="page-subtitle">
          Encuentra centros de rehabilitación, integración sensorial y diagnóstico recomendados.
        </p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <div class="container main-layout-wrap">
      <div class="layout-container">
      <!-- Panel Lateral -->
      <aside class="side-panel">
        <div class="location-control">
          <button 
            @click="toggleGeolocation" 
            class="geo-btn" 
            :class="{ 'active': isGeoActive }"
            :disabled="isLocating"
          >
            <span class="material-symbols-outlined icon-spin-container" :class="{ 'spinning': isLocating }">
              {{ isLocating ? 'progress_activity' : 'my_location' }}
            </span>
            <span>{{ isLocating ? 'Obteniendo ubicación...' : (isGeoActive ? 'Ver todos los centros' : 'Usar mi ubicación') }}</span>
          </button>
          
          <div v-if="geoError" class="geo-error">
            <span class="material-symbols-outlined">warning</span>
            <span>{{ geoError }}</span>
          </div>
        </div>

        <!-- Barra de búsqueda por lugar/nombre -->
        <div class="search-box-container">
          <span class="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            v-model="searchQuery" 
            @keyup.enter="handleSearchSubmit"
            placeholder="Escribe una ciudad o centro..." 
            class="search-input"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="clear-search-btn"
            aria-label="Limpiar búsqueda"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <button 
            @click="handleSearchSubmit" 
            class="search-submit-btn"
            :disabled="isSearchingLocation"
          >
            {{ isSearchingLocation ? '...' : 'Buscar' }}
          </button>
        </div>

        <div class="centers-list-container">
          <div class="list-header">
            <h3>{{ filteredCenters.length }} {{ filteredCenters.length === 1 ? 'Centro encontrado' : 'Centros encontrados' }}</h3>
            <span v-if="isGeoActive" class="geo-badge">Mi Ubicación</span>
            <span v-else-if="searchQuery" class="geo-badge">Búsqueda</span>
          </div>

          <div v-if="filteredCenters.length === 0" class="no-centers-card">
            <span class="material-symbols-outlined empty-icon">distance</span>
            <p>No se encontraron centros visibles en esta zona.</p>
            <button @click="resetFilters" class="btn-text">Ver todos los centros</button>
          </div>

          <div v-else class="centers-list scrollable">
            <div 
              v-for="center in filteredCenters" 
              :key="center.id" 
              :id="'center-card-' + center.id"
              class="center-card"
              :class="{ 'selected': selectedCenterId === center.id }"
              @click="selectCenter(center)"
            >
              <div class="card-header">
                <h4 class="center-name">{{ center.name }}</h4>
                <div class="rating">
                  <span class="material-symbols-outlined star-icon">star</span>
                  <span>{{ center.rating }}</span>
                </div>
              </div>
              <p class="center-address">
                <span class="material-symbols-outlined inline-icon">location_on</span>
                {{ center.address }}
              </p>
              <div class="therapies-wrap">
                <span v-for="t in center.therapies.slice(0, 3)" :key="t" class="therapy-badge">{{ t }}</span>
                <span v-if="center.therapies.length > 3" class="therapy-badge more">+{{ center.therapies.length - 3 }}</span>
              </div>
              
              <div class="card-footer">
                <div v-if="center.distance !== undefined" class="distance-badge">
                  <span class="material-symbols-outlined inline-icon">near_me</span>
                  <span>A {{ formatDistance(center.distance) }}</span>
                </div>
                <button class="card-action-btn" @click.stop="showCenterDetails(center)">
                  Saber más
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Mapa interactivo -->
      <main class="map-wrapper">
        <div id="map" class="map-container"></div>
      </main>
    </div>

    <!-- Modal de detalle de centro -->
    <Transition name="modal-fade">
      <div v-if="detailedCenter" class="modal-overlay" @click.self="detailedCenter = null" role="dialog" aria-modal="true">
        <div class="detail-modal">
          <button class="close-modal-btn" @click="detailedCenter = null" aria-label="Cerrar modal">
            <span class="material-symbols-outlined">close</span>
          </button>
          
          <div class="modal-cover">
            <img :src="placeholderCenterImage" :alt="detailedCenter.name" />
            <div class="modal-title-overlay">
              <span class="modal-badge">Centro de Apoyo</span>
              <h2>{{ detailedCenter.name }}</h2>
            </div>
          </div>
          
          <div class="modal-body-content">
            <div class="rating-box">
              <span class="material-symbols-outlined star-fill">star</span>
              <strong>{{ detailedCenter.rating }}</strong>
              <span class="reviews-count">/ 5.0 (Valoración promedio)</span>
            </div>
            
            <p class="modal-desc">{{ detailedCenter.description }}</p>
            
            <div class="info-section">
              <h4>Terapias y Especialidades</h4>
              <div class="modal-therapies">
                <span v-for="t in detailedCenter.therapies" :key="t" class="modal-therapy-pill">{{ t }}</span>
              </div>
            </div>

            <div class="info-section contact-info">
              <h4>Información de Contacto</h4>
              <div class="contact-grid">
                <div class="contact-item">
                  <span class="material-symbols-outlined text-purple">pin_drop</span>
                  <div>
                    <strong>Dirección:</strong>
                    <p>{{ detailedCenter.address }}</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="material-symbols-outlined text-purple">call</span>
                  <div>
                    <strong>Teléfono:</strong>
                    <p><a :href="formatTelLink(detailedCenter.phone)" class="phone-link">{{ detailedCenter.phone }}</a></p>
                  </div>
                </div>
                <div v-if="detailedCenter.website" class="contact-item">
                  <span class="material-symbols-outlined text-purple">language</span>
                  <div>
                    <strong>Sitio Web:</strong>
                    <p><a :href="detailedCenter.website" target="_blank" rel="noopener noreferrer" class="website-link">{{ detailedCenter.website }}</a></p>
                  </div>
                </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <a :href="formatTelLink(detailedCenter.phone)" class="btn-primary-call">
            <span class="material-symbols-outlined">call</span>
            Llamar al Centro
          </a>
          <button @click="detailedCenter = null" class="btn-secondary-close">Cerrar</button>
        </div>
          </div>
        </div>
      </div>
    </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Variables reactivas
const centers = ref([]);
const dynamicCenters = ref([]);
const selectedCenterId = ref(null);
const detailedCenter = ref(null);
const searchQuery = ref('');
const mapCenterCoords = ref({ lat: 40.416775, lng: -3.703790 });
const isSearchingLocation = ref(false);

const userCoords = ref(null);
const isLocating = ref(false);
const isGeoActive = ref(false);
const geoError = ref('');
const mapBounds = ref(null);

// Configuración de imagen placeholder
const placeholderCenterImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23e6fffa'/><circle cx='200' cy='120' r='50' fill='%230d9488' opacity='0.3'/><rect x='80' y='200' width='240' height='16' rx='8' fill='%230d9488'/><rect x='120' y='230' width='160' height='12' rx='6' fill='%230d9488' opacity='0.7'/></svg>";

// Variables globales del mapa (no reactivas para evitar proxies conflictivos en Leaflet)
let mapInstance = null;
let markersGroup = null;
let userMarkerInstance = null;

// Obtener distancia en km utilizando la fórmula de Haversine
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Formatear distancia
function formatDistance(dist) {
  if (dist < 1) {
    return `${Math.round(dist * 1000)} m`;
  }
  return `${dist.toFixed(1)} km`;
}

// Formatear enlace de teléfono (remueve espacios y caracteres no válidos para el estándar tel:)
function formatTelLink(phone) {
  if (!phone) return '';
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}

// Cargar centros de la API
async function fetchCenters() {
  try {
    const res = await api.get('/centros');
    centers.value = res.data;
    renderMarkers();
  } catch (err) {
    console.error("Error al cargar centros:", err);
  }
}

// Centros filtrados por geolocalización, búsqueda y límites del mapa
const filteredCenters = computed(() => {
  let list = [...centers.value, ...dynamicCenters.value];
  
  // 1. Filtrar por búsqueda de texto de centro/terapias si hay coincidencia directa en el listado
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    const textMatches = list.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) || 
      (c.address && c.address.toLowerCase().includes(query)) ||
      (c.therapies && c.therapies.some(t => t.toLowerCase().includes(query)))
    );
    
    if (textMatches.length > 0) {
      const matchedIds = new Set(textMatches.map(c => c.id));
      const resultList = [...textMatches];
      
      // Asegurar que siempre se muestren los de 5km de diámetro alrededor de la coincidencia
      list.forEach(c => {
        if (!matchedIds.has(c.id)) {
          const isClose = textMatches.some(tm => getDistance(tm.lat, tm.lng, c.lat, c.lng) <= 5);
          if (isClose) {
            resultList.push(c);
            matchedIds.add(c.id);
          }
        }
      });
      list = resultList;
    }
  }
  
  // 2. Ordenar por distancia (respecto a ubicación del usuario si está geolocalizado, o respecto al centro actual del mapa)
  const refCoords = (isGeoActive.value && userCoords.value) ? userCoords.value : mapCenterCoords.value;
  if (refCoords) {
    list = list.map(c => {
      const d = getDistance(refCoords.lat, refCoords.lng, c.lat, c.lng);
      return { ...c, distance: d };
    });
    list.sort((a, b) => a.distance - b.distance);
  } else {
    list = list.map(c => {
      const { distance, ...rest } = c;
      return rest;
    });
  }

  // 3. Filtrar para mostrar únicamente los centros que están visibles dentro del viewport actual del mapa
  if (mapBounds.value) {
    list = list.filter(c => {
      return mapBounds.value.contains([c.lat, c.lng]);
    });
  }
  
  return list;
});

// Generar centros de prueba dinámicos para garantizar que siempre haya abundancia de centros (mínimo 6) incluyendo Bizirik
function handleDynamicCenters(lat, lng) {
  // Verificamos si ya existe algún centro real con "Bizirik" a menos de 30km de la ubicación del usuario
  const hasRealBizirikNear = centers.value.some(c => c.name && c.name.includes("Bizirik") && getDistance(lat, lng, c.lat, c.lng) <= 30);
  
  const pool = [];
  
  // Si no hay un Bizirik real cerca, lo creamos dinámicamente muy cerca del usuario
  if (!hasRealBizirikNear) {
    pool.push({
      id: 101,
      name: "Centro de Atención Temprana Bizirik",
      address: "Calle de Iparraguirre, 24",
      lat: lat + 0.003,
      lng: lng + 0.004,
      phone: "+34 944 123 456",
      therapies: ["Fisioterapia", "Psicomotricidad", "Logopedia", "Integración Sensorial"],
      rating: 4.9,
      description: "Centro especializado en atención temprana, logopedia, fisioterapia y terapia ocupacional para potenciar la autonomía infantil."
    });
  }

  // Generamos los otros centros dinámicos de prueba para completar un listado abundante de al menos 6 centros
  const additionalCenters = [
    {
      id: 102,
      name: "Gabinete de Apoyo Infantil Gure Txokoa",
      address: "Avenida del Neurodesarrollo, 8",
      lat: lat - 0.008,
      lng: lng - 0.012,
      phone: "+34 944 654 321",
      therapies: ["Psicología Infantil", "Terapia de Juego", "Logopedia"],
      rating: 4.8,
      description: "Acompañamiento psicopedagógico integral centrado en la familia y el desarrollo socioemocional."
    },
    {
      id: 103,
      name: "CDIAT Alai",
      address: "Calle de la Integración, 14",
      lat: lat + 0.012,
      lng: lng - 0.009,
      phone: "+34 944 777 888",
      therapies: ["Terapia Ocupacional", "Integración Sensorial"],
      rating: 4.7,
      description: "Espacio adaptado con salas de integración sensorial de última generación."
    },
    {
      id: 104,
      name: "Asociación Inclusiva Bizkaia",
      address: "Calle de la Cooperación, 3",
      lat: lat - 0.005,
      lng: lng + 0.015,
      phone: "+34 944 999 000",
      therapies: ["Terapia Familiar", "Apoyo Escolar", "Grupos de Encuentro"],
      rating: 4.6,
      description: "Talleres familiares, escuela de padres y actividades de ocio inclusivo de fin de semana."
    },
    {
      id: 105,
      name: "Gabinete Psicopedagógico Senda",
      address: "Plaza del Crecimiento, 5",
      lat: lat + 0.018,
      lng: lng + 0.007,
      phone: "+34 944 555 111",
      therapies: ["Apoyo Pedagógico", "Estimulación Cognitiva"],
      rating: 4.8,
      description: "Evaluaciones e intervenciones personalizadas para el éxito académico y emocional."
    },
    {
      id: 106,
      name: "Centro de Estimulación Precoz Kimu",
      address: "Avenida de los Pasos, 22",
      lat: lat - 0.015,
      lng: lng - 0.015,
      phone: "+34 944 888 222",
      therapies: ["Estimulación Temprana", "Psicomotricidad Fina"],
      rating: 4.7,
      description: "Programas de intervención para niños de 0 a 6 años enfocados en el desarrollo psicomotor."
    }
  ];

  dynamicCenters.value = [...pool, ...additionalCenters];
}

// Activar o desactivar geolocalización
async function toggleGeolocation() {
  if (isGeoActive.value) {
    resetFilters();
  } else {
    isLocating.value = true;
    geoError.value = '';
    
    if (!navigator.geolocation) {
      geoError.value = "Tu navegador no soporta geolocalización.";
      isLocating.value = false;
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        userCoords.value = { lat: latitude, lng: longitude };
        
        // Generar centros dinámicos si estamos lejos de Madrid
        handleDynamicCenters(latitude, longitude);
        
        isLocating.value = false;
        isGeoActive.value = true;
        
        // Refrescar marcadores
        renderMarkers();
        
        // Dibujar marcador de posición del usuario
        if (mapInstance) {
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="
                  position: absolute;
                  width: 16px;
                  height: 16px;
                  background-color: #5bbfd6;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 0 5px rgba(0,0,0,0.3);
                  top: 3px;
                  left: 3px;
                  z-index: 2;
                "></div>
                <div style="
                  position: absolute;
                  width: 22px;
                  height: 22px;
                  background-color: #5bbfd6;
                  border-radius: 50%;
                  animation: pulse 1.8s infinite;
                  opacity: 0.5;
                  z-index: 1;
                "></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          
          if (userMarkerInstance) {
            userMarkerInstance.setLatLng([latitude, longitude]);
          } else {
            userMarkerInstance = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstance);
          }
          
          // Mover mapa a la ubicación del usuario
          mapInstance.setView([latitude, longitude], 12);
        }
      },
      (error) => {
        console.warn("Error de geolocalización:", error);
        isLocating.value = false;
        if (error.code === error.PERMISSION_DENIED) {
          geoError.value = "Permiso de geolocalización denegado.";
        } else {
          geoError.value = "No se pudo obtener tu ubicación.";
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
}

// Resetear filtros y volver al estado por defecto
function resetFilters() {
  searchQuery.value = '';
  isGeoActive.value = false;
  userCoords.value = null;
  dynamicCenters.value = [];
  geoError.value = '';
  
  if (userMarkerInstance) {
    userMarkerInstance.remove();
    userMarkerInstance = null;
  }
  
  renderMarkers();
  
  if (mapInstance) {
    mapInstance.setView([40.416775, -3.703790], 6);
  }
}

// Dibujar los marcadores en el mapa Leaflet
function renderMarkers() {
  if (!mapInstance) return;
  
  if (markersGroup) {
    markersGroup.clearLayers();
  } else {
    markersGroup = L.layerGroup().addTo(mapInstance);
  }
  
  // Icono lila personalizado
  const lilaIcon = L.divIcon({
    className: 'custom-lila-marker',
    html: `
      <div style="
        background-color: #c58cf2;
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0px 2px 6px rgba(0,0,0,0.3);
        position: relative;
        cursor: pointer;
      ">
        <div style="
          background-color: #ffffff;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
  
  // Usamos todos los centros cargados en memoria
  const listToRender = [...centers.value, ...dynamicCenters.value];
  
  listToRender.forEach(center => {
    const marker = L.marker([center.lat, center.lng], { icon: lilaIcon });
    
    const therapiesHtml = center.therapies.map(t => `<span class="popup-therapy-badge">${t}</span>`).join('');
    
    const popupContent = `
      <div class="map-popup-card">
        <h4 class="popup-title">${center.name}</h4>
        <p class="popup-address"><span class="material-symbols-outlined">location_on</span> ${center.address}</p>
        <p class="popup-phone"><span class="material-symbols-outlined">call</span> ${center.phone}</p>
        <div class="popup-therapies">${therapiesHtml}</div>
        <button class="popup-more-btn" id="popup-btn-${center.id}">Ver más información</button>
      </div>
    `;
    
    marker.bindPopup(popupContent, {
      maxWidth: 280,
      className: 'custom-leaflet-popup'
    });
    
    marker.on('popupopen', () => {
      selectedCenterId.value = center.id;
      // Esperar a que el DOM del popup se monte en Leaflet para atar el evento click
      setTimeout(() => {
        const btn = document.getElementById(`popup-btn-${center.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            showCenterDetails(center);
          });
        }
      }, 50);
    });
    
    marker.on('popupclose', () => {
      if (selectedCenterId.value === center.id) {
        selectedCenterId.value = null;
      }
    });
    
    // Almacenar marcador para apertura controlada desde el panel lateral
    center._marker = marker;
    
    markersGroup.addLayer(marker);
  });
}

// Centrar mapa en un centro seleccionado y abrir su popup
function selectCenter(center) {
  selectedCenterId.value = center.id;
  if (mapInstance && center._marker) {
    mapInstance.setView([center.lat, center.lng], 14);
    center._marker.openPopup();
  }
}

// Abrir modal de detalles
function showCenterDetails(center) {
  detailedCenter.value = center;
}

// Observar cambios en los centros o centros dinámicos para redibujar marcadores
watch([centers, dynamicCenters], () => {
  renderMarkers();
});

// Geocodificar ubicación utilizando OpenStreetMap Nominatim API
async function searchLocationGeocode(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=es&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'PatitasEarlyInterventionApp/1.0'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        return { lat, lng };
      }
    }
  } catch (err) {
    console.error("Error geocoding place:", err);
  }
  return null;
}

// Enviar búsqueda
async function handleSearchSubmit() {
  const query = searchQuery.value.trim();
  if (!query) return;
  
  isSearchingLocation.value = true;
  geoError.value = '';
  
  // 1. Primero, verificar coincidencia directa con algún centro cargado
  const list = [...centers.value, ...dynamicCenters.value];
  const localMatch = list.find(c => 
    (c.name && c.name.toLowerCase().includes(query.toLowerCase())) || 
    (c.address && c.address.toLowerCase().includes(query.toLowerCase()))
  );
  
  if (localMatch) {
    if (mapInstance) {
      mapInstance.setView([localMatch.lat, localMatch.lng], 13);
    }
    isSearchingLocation.value = false;
    return;
  }
  
  // 2. Si no es un centro local, geocodificamos el nombre de la ciudad
  const geocoded = await searchLocationGeocode(query);
  if (geocoded) {
    // Generar centros dinámicos alrededor del lugar buscado
    handleDynamicCenters(geocoded.lat, geocoded.lng);
    
    // Centrar el mapa en la ubicación geocodificada con zoom 13
    if (mapInstance) {
      mapInstance.setView([geocoded.lat, geocoded.lng], 13);
    }
  } else {
    geoError.value = `No se encontró la ubicación "${query}".`;
    setTimeout(() => {
      geoError.value = '';
    }, 4000);
  }
  
  isSearchingLocation.value = false;
}

// Limpiar búsqueda
function clearSearch() {
  searchQuery.value = '';
  dynamicCenters.value = [];
  geoError.value = '';
  if (mapInstance) {
    if (isGeoActive.value && userCoords.value) {
      mapInstance.setView([userCoords.value.lat, userCoords.value.lng], 12);
    } else {
      mapInstance.setView([40.416775, -3.703790], 6);
    }
  }
}

// Inicializar el mapa
onMounted(() => {
  // Coordenadas iniciales por defecto: Madrid (Centro de España)
  const defaultLat = 40.416775;
  const defaultLng = -3.703790;
  
  // Instanciar mapa con zoom inicial 6 para ver toda la península y todos los centros
  mapInstance = L.map('map', {
    center: [defaultLat, defaultLng],
    zoom: 6,
    zoomControl: true
  });
  
  // Capa de mosaicos CartoDB Voyager (aesthetics pastel premium)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20
  }).addTo(mapInstance);

  // Escuchar eventos de movimiento/zoom para actualizar dinámicamente los centros visibles en la lista y reordenar por cercanía
  mapInstance.on('moveend', () => {
    mapBounds.value = mapInstance.getBounds();
    const center = mapInstance.getCenter();
    mapCenterCoords.value = { lat: center.lat, lng: center.lng };
  });
  
  // Establecer límites iniciales después de cargar
  mapBounds.value = mapInstance.getBounds();
  const initialCenter = mapInstance.getCenter();
  mapCenterCoords.value = { lat: initialCenter.lat, lng: initialCenter.lng };
  
  // Cargar centros de la API mock
  fetchCenters();
});

// Limpieza al desmontar
onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style>
/* Estilos globales y anulaciones de Leaflet */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.custom-leaflet-popup .leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  font-family: 'Fredoka', sans-serif;
}

.custom-leaflet-popup .leaflet-popup-content {
  margin: 12px 14px;
}

.map-popup-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.popup-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
  line-height: 1.3;
}

.popup-address, .popup-phone {
  font-size: 0.78rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
}

.popup-address span, .popup-phone span {
  font-size: 0.95rem;
  color: var(--button-purple);
}

.popup-therapies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.popup-therapy-badge {
  font-size: 0.7rem;
  background-color: #f3e8ff;
  color: #7e22ce;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  font-weight: 500;
}

.popup-more-btn {
  width: 100%;
  background-color: var(--button-purple);
  color: white;
  border: none;
  padding: 0.45rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.4rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
  font-family: 'Fredoka', sans-serif;
  text-align: center;
}

.popup-more-btn:hover {
  background-color: #b57be0;
  transform: translateY(-1px);
}

.popup-more-btn:active {
  transform: translateY(0);
}
</style>

<style scoped>
/* Estilos locales de la página */
.centros-page {
  background-color: var(--page-bg, #f0f8ff);
  min-height: 90vh;
  padding-bottom: 5rem;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-blue);
  opacity: 0.8;
  margin-bottom: 1rem;
}

.breadcrumbs a {
  transition: color 0.2s;
}

.breadcrumbs a:hover {
  color: var(--button-purple);
}

.breadcrumbs .separator {
  color: rgba(26, 91, 130, 0.3);
}

.breadcrumbs .current {
  color: var(--text-blue);
  font-weight: 500;
}

/* Cabecera */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 4.5rem 0 5.5rem;
  text-align: center;
  margin-bottom: 3rem;
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

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.75rem;
}

.page-subtitle {
  font-size: 1.05rem;
  color: var(--text-blue);
  opacity: 0.85;
  max-width: 38rem;
  margin: 0 auto;
  line-height: 1.6;
}

/* Layout */
.layout-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  background-color: white;
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

@media (max-width: 900px) {
  .layout-container {
    grid-template-columns: 1fr;
  }
}

/* Panel Lateral */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 650px;
}

/* Control de ubicación */
.location-control {
  background-color: #fafafa;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #eaeaea;
}

.geo-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--button-purple);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Fredoka', sans-serif;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
}

.geo-btn:hover {
  background-color: #b57be0;
  box-shadow: 0 4px 12px rgba(197, 140, 242, 0.35);
  transform: translateY(-1px);
}

.geo-btn:active {
  transform: translateY(0);
}

.geo-btn.active {
  background-color: #5bbfd6;
}

.geo-btn.active:hover {
  background-color: #4aa7bd;
  box-shadow: 0 4px 12px rgba(91, 191, 214, 0.35);
}

.icon-spin-container {
  display: inline-block;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.geo-error {
  margin-top: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #e53e3e;
  font-size: 0.82rem;
  background-color: #fff5f5;
  padding: 0.5rem;
  border-radius: 6px;
}

.geo-error span {
  font-size: 1.1rem;
}

/* Lista de Centros */
.centers-list-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
  min-height: 0; /* Permite scroll correcto */
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
}

.list-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
}

.geo-badge {
  font-size: 0.75rem;
  background-color: #e0f7fa;
  color: #00838f;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
}

.no-centers-card {
  text-align: center;
  padding: 2.5rem 1rem;
  background-color: #fcfcfc;
  border-radius: 12px;
  border: 1px dashed #ddd;
}

.empty-icon {
  font-size: 2.5rem;
  color: #bbb;
  margin-bottom: 0.5rem;
}

.no-centers-card p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.8rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--button-purple);
  font-weight: 600;
  cursor: pointer;
  font-family: 'Fredoka', sans-serif;
  text-decoration: underline;
}

.centers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.centers-list.scrollable {
  max-height: 480px;
}

/* Tarjeta de Centro */
.center-card {
  background-color: #fbfbfb;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.center-card:hover {
  background-color: white;
  border-color: var(--button-purple);
  box-shadow: 0 5px 15px rgba(197, 140, 242, 0.08);
  transform: translateY(-2px);
}

.center-card.selected {
  background-color: white;
  border-color: var(--button-purple);
  border-width: 2px;
  box-shadow: 0 6px 20px rgba(197, 140, 242, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.center-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-blue);
  line-height: 1.3;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  background-color: #fff9db;
  color: #f59f00;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.star-icon {
  font-size: 0.95rem;
  font-variation-settings: 'FILL' 1;
}

.center-address {
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.6rem;
  line-height: 1.3;
}

.inline-icon {
  font-size: 1rem;
  color: #bbb;
}

.therapies-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.therapy-badge {
  font-size: 0.72rem;
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  font-weight: 500;
}

.therapy-badge.more {
  background-color: #f3e8ff;
  color: #7e22ce;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f3f3f3;
  padding-top: 0.6rem;
  margin-top: 0.25rem;
}

.distance-badge {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #00838f;
  background-color: #e0f7fa;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.distance-badge .inline-icon {
  color: #00838f;
  font-size: 0.85rem;
}

.card-action-btn {
  background: none;
  border: none;
  color: var(--button-purple);
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Fredoka', sans-serif;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 0.15rem 0;
}

.card-action-btn:hover {
  opacity: 0.8;
}

/* Contenedor del Mapa */
.map-wrapper {
  border-radius: 16px;
  overflow: hidden;
  height: 600px;
  border: 1px solid #eaeaea;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1; /* Mantener por debajo de modales */
}

/* Modal de Detalle */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.detail-modal {
  background-color: white;
  width: 90%;
  max-width: 550px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  animation: modal-slide-in 0.3s ease-out;
}

@keyframes modal-slide-in {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-modal-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.2s, background-color 0.2s;
}

.close-modal-btn:hover {
  transform: scale(1.05);
  background-color: white;
}

.modal-cover {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.modal-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.modal-title-overlay h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.modal-badge {
  align-self: flex-start;
  background-color: var(--button-purple);
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
}

.modal-body-content {
  padding: 1.5rem;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.rating-box .star-fill {
  color: #f59f00;
  font-variation-settings: 'FILL' 1;
}

.reviews-count {
  font-size: 0.85rem;
  color: #777;
}

.modal-desc {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.info-section {
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.info-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.info-section h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.6rem;
}

.modal-therapies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.modal-therapy-pill {
  font-size: 0.8rem;
  background-color: #f3e8ff;
  color: #7e22ce;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-weight: 600;
}

.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.contact-item span {
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

.text-purple {
  color: var(--button-purple);
}

.contact-item strong {
  font-size: 0.85rem;
  color: #555;
  display: block;
}

.contact-item p, .phone-link {
  font-size: 0.9rem;
  color: #333;
}

.phone-link, .website-link {
  color: var(--button-purple);
  font-weight: 600;
  text-decoration: underline;
  word-break: break-all;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-primary-call {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background-color: var(--button-purple);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Fredoka', sans-serif;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-primary-call:hover {
  background-color: #b57be0;
}

.btn-secondary-close {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Fredoka', sans-serif;
  transition: background-color 0.2s;
}

.btn-secondary-close:hover {
  background-color: #e5e7eb;
}

/* Transiciones del Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Estilos de la barra de búsqueda */
.search-box-container {
  display: flex;
  align-items: center;
  position: relative;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0.2rem 0.6rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box-container:focus-within {
  border-color: var(--button-purple);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.25);
}

.search-icon {
  color: #adb5bd;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.6rem 0;
  font-size: 0.95rem;
  color: #495057;
  font-family: 'Fredoka', sans-serif;
  background: transparent;
}

.clear-search-btn {
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}

.clear-search-btn:hover {
  background-color: #f1f3f5;
  color: #495057;
}

.search-submit-btn {
  background-color: var(--button-purple);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.search-submit-btn:hover {
  background-color: #b57be0;
}

.search-submit-btn:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}
</style>
