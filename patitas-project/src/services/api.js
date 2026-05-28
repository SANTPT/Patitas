import axios from 'axios';

/**
 * Cliente de Axios centralizado para Patitas — FE-13 / Opción 3
 * Configura las peticiones HTTP y maneja la expiración de sesión (401).
 * Incluye un sistema de simulación (mocking) transparente cuando no hay backend activo.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generar Avatar SVG estético de forma dinámica a partir de las iniciales de un nombre
function generateAvatarSvg(name) {
  const colors = [
    '#c58cf2', // Morado patitas
    '#5bbfd6', // Azul patitas
    '#f6ad55', // Naranja
    '#fc8181', // Rosa
    '#4fd1c5', // Cerceta
    '#68d391', // Verde
    '#63b3ed'  // Celeste
  ];
  
  const parts = (name || 'P').trim().split(/\s+/);
  const initials = parts.length > 1 
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <circle cx='50' cy='50' r='50' fill='${color.replace('#', '%23')}'/>
    <text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${svg}`;
}

// Funciones auxiliares para persistir usuarios simulados en localStorage
function getMockUsers() {
  const defaultUsers = [
    {
      id: 1,
      name: 'Padre Demo',
      email: 'demo@example.com',
      password: '123456',
      role: 'user',
      avatar: generateAvatarSvg('Padre Demo'),
      createdAt: '2026-05-26T08:00:00Z',
      savedResources: [1, 3],
      status: 'active'
    },
    {
      id: 2,
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'password',
      role: 'superadmin',
      avatar: generateAvatarSvg('Super Admin'),
      createdAt: '2026-05-26T08:00:00Z',
      savedResources: [],
      status: 'active'
    },
    {
      id: 3,
      name: 'Centro Admin',
      email: 'centro@example.com',
      password: 'password',
      role: 'admin_centro',
      centroId: 1,
      status: 'active',
      avatar: generateAvatarSvg('Centro Admin'),
      createdAt: '2026-05-26T08:00:00Z',
      savedResources: [],
    },
    {
      id: 4,
      name: 'Profesional Admin',
      email: 'profesional@example.com',
      password: 'password',
      role: 'admin_profesional',
      centroId: 1,
      status: 'active',
      avatar: generateAvatarSvg('Profesional Admin'),
      createdAt: '2026-05-26T08:00:00Z',
      savedResources: [],
    }
  ];
  try {
    const saved = localStorage.getItem('patitas_mock_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      const emails = parsed.map(u => u && u.email ? u.email.toLowerCase() : '');
      let modified = false;
      
      // Asegurar que los usuarios de control tengan centroId y status
      parsed.forEach(u => {
        if (u && u.email) {
          const emailLower = u.email.toLowerCase();
          if (['centro@example.com', 'profesional@example.com'].includes(emailLower)) {
            if (!u.centroId) {
              u.centroId = 1;
              modified = true;
            }
          }
          if (!u.status) {
            u.status = 'active';
            modified = true;
          }
        }
      });

      defaultUsers.forEach(du => {
        if (!emails.includes(du.email.toLowerCase())) {
          parsed.push(du);
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem('patitas_mock_users', JSON.stringify(parsed));
      }
      return parsed;
    }
    localStorage.setItem('patitas_mock_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (_) {
    return defaultUsers;
  }
}

function saveMockUsers(users) {
  try {
    localStorage.setItem('patitas_mock_users', JSON.stringify(users));
  } catch (_) {}
}

const defaultChildren = [
  {
    id: 1,
    name: "Sofía Delgado",
    birthDate: "2020-04-12",
    diagnostico: "Trastorno del Espectro Autista (TEA)",
    avatar: generateAvatarSvg("Sofía Delgado"),
    centroId: 1,
    profesionalId: 2,
    parentIds: [3],
    inviteCode: "SOF-5678",
    createdAt: "2024-01-15T10:00:00Z",
    progress: {
      comunicacion: 6,
      social: 4,
      cognitivo: 7,
      motor: 8,
      autonomia: 5
    },
    progressHistory: [
      {
        date: "2024-01-15T10:00:00Z",
        comunicacion: 4,
        social: 3,
        cognitivo: 5,
        motor: 6,
        autonomia: 3
      },
      {
        date: "2024-04-20T11:30:00Z",
        comunicacion: 6,
        social: 4,
        cognitivo: 7,
        motor: 8,
        autonomia: 5
      }
    ]
  },
  {
    id: 2,
    name: "Mateo Ruiz",
    birthDate: "2021-09-05",
    diagnostico: "Retraso Generalizado del Desarrollo (RGD)",
    avatar: generateAvatarSvg("Mateo Ruiz"),
    centroId: 1,
    profesionalId: 2,
    parentIds: [],
    inviteCode: "MAT-1234",
    createdAt: "2024-02-10T09:00:00Z",
    progress: {
      comunicacion: 5,
      social: 6,
      cognitivo: 5,
      motor: 5,
      autonomia: 4
    },
    progressHistory: [
      {
        date: "2024-02-10T09:00:00Z",
        comunicacion: 3,
        social: 4,
        cognitivo: 3,
        motor: 4,
        autonomia: 2
      },
      {
        date: "2024-05-15T10:00:00Z",
        comunicacion: 5,
        social: 6,
        cognitivo: 5,
        motor: 5,
        autonomia: 4
      }
    ]
  }
];

const defaultSessions = [
  {
    id: 1,
    ninoId: 1,
    profesionalId: 2,
    profesionalName: "Profesional de Apoyo",
    fecha: "2024-05-20",
    duracion: 45,
    tipo: "Terapia de Lenguaje",
    objetivos: [
      { nombre: "Contacto visual prolongado", score: 4 },
      { nombre: "Producción de fonemas simples", score: 3 }
    ],
    observaciones: "Sofía estuvo alegre y colaboradora. Responde bien a los estímulos visuales."
  },
  {
    id: 2,
    ninoId: 1,
    profesionalId: 2,
    profesionalName: "Profesional de Apoyo",
    fecha: "2024-05-24",
    duracion: 45,
    tipo: "Terapia Ocupacional",
    objetivos: [
      { nombre: "Pinza digital para tomar lápiz", score: 3 },
      { nombre: "Coordinación ojo-mano", score: 4 }
    ],
    observaciones: "Logró apilar cubos y ensartar cuentas con menor frustración."
  },
  {
    id: 3,
    ninoId: 2,
    profesionalId: 2,
    profesionalName: "Profesional de Apoyo",
    fecha: "2024-05-22",
    duracion: 50,
    tipo: "Terapia de Psicomotricidad",
    objetivos: [
      { nombre: "Salto bipedal con obstáculo", score: 3 },
      { nombre: "Mantener equilibrio a un pie", score: 2 }
    ],
    observaciones: "Mateo requiere apoyo verbal continuo para mantenerse en la tarea."
  }
];

function getMockChildren() {
  try {
    const saved = localStorage.getItem('patitas_mock_children');
    if (!saved) {
      localStorage.setItem('patitas_mock_children', JSON.stringify(defaultChildren));
      return defaultChildren;
    }
    return JSON.parse(saved);
  } catch (_) {
    return defaultChildren;
  }
}

function saveMockChildren(children) {
  try {
    localStorage.setItem('patitas_mock_children', JSON.stringify(children));
  } catch (_) {}
}

function getMockSessions() {
  try {
    const saved = localStorage.getItem('patitas_mock_sessions');
    if (!saved) {
      localStorage.setItem('patitas_mock_sessions', JSON.stringify(defaultSessions));
      return defaultSessions;
    }
    return JSON.parse(saved);
  } catch (_) {
    return defaultSessions;
  }
}

function saveMockSessions(sessions) {
  try {
    localStorage.setItem('patitas_mock_sessions', JSON.stringify(sessions));
  } catch (_) {}
}

function getRequestData(config) {
  if (!config || !config.data) return {};
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data);
    } catch (_) {
      return {};
    }
  }
  return config.data;
}

// 1. Interceptor de Request: Añadir cabecera Authorization (Bearer Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patitas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor de Response: Manejo global de errores (como 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar datos locales si la sesión ha expirado o el token es inválido
      localStorage.removeItem('patitas_token');
      localStorage.removeItem('patitas_user');
      // Redirigir al inicio e instruir la apertura del modal de login
      window.location.href = '/?auth=login';
    }
    return Promise.reject(error);
  }
);

// 3. Sistema de Simulación (Mock Fallback)
// Se activa automáticamente en desarrollo si no se especifica una URL de API real
const isMockEnabled = !import.meta.env.VITE_API_BASE_URL;

// Placeholders SVG locales para evitar dependencias externas (Unsplash)
const placeholderResourceImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23ebf8ff'/><circle cx='200' cy='120' r='50' fill='%235bbfd6' opacity='0.3'/><rect x='80' y='200' width='240' height='16' rx='8' fill='%235bbfd6'/><rect x='120' y='230' width='160' height='12' rx='6' fill='%235bbfd6' opacity='0.7'/></svg>";
const placeholderCenterImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23e6fffa'/><circle cx='200' cy='120' r='50' fill='%230d9488' opacity='0.3'/><rect x='80' y='200' width='240' height='16' rx='8' fill='%230d9488'/><rect x='120' y='230' width='160' height='12' rx='6' fill='%230d9488' opacity='0.7'/></svg>";
const placeholderProductImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23faf5ff'/><rect x='150' y='80' width='100' height='100' rx='8' fill='%23c58cf2' opacity='0.5'/><rect x='80' y='210' width='240' height='16' rx='8' fill='%23c58cf2'/><rect x='130' y='240' width='140' height='12' rx='6' fill='%23c58cf2' opacity='0.7'/></svg>";

const avatarLaura = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23c58cf2'/><text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>L</text></svg>";
const avatarCarlos = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%235bbfd6'/><text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>C</text></svg>";
const avatarMarta = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23f6ad55'/><text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>M</text></svg>";
const avatarSofia = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fc8181'/><text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>S</text></svg>";
const avatarGeneric = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e0'/><text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>P</text></svg>";

// Base de datos simulada en memoria para posts de Comunidad (Foro)
const defaultPosts = [
  {
    id: 1,
    title: "Rutinas visuales en casa: ¿Qué les funciona mejor?",
    content: "<p>Hola a todos. Llevamos dos semanas implementando una agenda visual con pictogramas para las rutinas de la mañana. Mateo ha respondido súper bien, pero a la hora de vestirle se distrae mucho. ¿Algún consejo para estructurar ese paso en particular?</p>",
    category: "Consejos",
    createdAt: "2026-05-26T08:00:00Z",
    likes: 12,
    likedBy: [],
    author: {
      name: "Laura M.",
      avatar: avatarLaura,
      role: "Madre de Mateo (4 años)"
    },
    comments: [
      {
        id: 1,
        author: {
          name: "Sofía Vega",
          avatar: avatarSofia,
          role: "Terapeuta Ocupacional"
        },
        content: "¡Hola Laura! Qué gran paso. Para vestirse, te recomiendo desglosar la acción en tareas aún más pequeñas. Coloca los pictogramas de cada prenda en orden (calzoncillo, calcetines, pantalón, camiseta) y hazlo como un juego de estación.",
        createdAt: "2026-05-26T08:30:00Z"
      },
      {
        id: 2,
        author: {
          name: "Carlos T.",
          avatar: avatarCarlos,
          role: "Padre de Lucas (6 años)"
        },
        content: "Nosotros usamos cestas numeradas para cada prenda. En la cesta 1 los calcetines, en la 2 el pantalón... Lucas sabe que tiene que ir abriéndolas en orden y le da mucha autonomía.",
        createdAt: "2026-05-26T09:15:00Z"
      }
    ]
  },
  {
    id: 2,
    title: "Dificultad con la transición al colegio por las mañanas",
    content: "<p>Últimamente las transiciones para salir de casa hacia el colegio son muy difíciles. Lucas se bloquea en la puerta y empieza a llorar. Hemos intentado anticipar el cambio con alarmas, pero sigue costándole mucho.</p>",
    category: "Dudas",
    createdAt: "2026-05-26T06:45:00Z",
    likes: 8,
    likedBy: [],
    author: {
      name: "Carlos T.",
      avatar: avatarCarlos,
      role: "Padre de Lucas (6 años)"
    },
    comments: []
  },
  {
    id: 3,
    title: "¡Logro de la semana! Primera sesión de peluquería sin lágrimas",
    content: "<p>¡Quería compartir una pequeña gran victoria! Daniela siempre ha tenido hipersensibilidad al corte de pelo. Esta vez fuimos a una peluquería adaptada, llevamos sus auriculares canceladores de ruido y su juguete favorito. ¡No lloró nada y hasta sonrió! No pierdan la esperanza, pequeños pasos hacen la diferencia.</p>",
    category: "General",
    createdAt: "2026-05-25T15:30:00Z",
    likes: 25,
    likedBy: [],
    author: {
      name: "Marta S.",
      avatar: avatarMarta,
      role: "Madre de Daniela (5 años)"
    },
    comments: [
      {
        id: 1,
        author: {
          name: "Laura M.",
          avatar: avatarLaura,
          role: "Madre de Mateo (4 años)"
        },
        content: "¡Qué felicidad Marta! Me alegro muchísimo por Daniela. Estos logros nos llenan de energía.",
        createdAt: "2025-05-25T17:40:00Z"
      }
    ]
  }
];

function getMockPosts() {
  try {
    const saved = localStorage.getItem('patitas_mock_posts');
    let posts = saved ? JSON.parse(saved) : defaultPosts;
    
    // Eliminar de forma automática cualquier comentario del usuario de prueba "tu"
    let hasChanged = false;
    posts.forEach(post => {
      if (post.comments) {
        const originalLength = post.comments.length;
        post.comments = post.comments.filter(c => c.author && c.author.name !== 'tu');
        if (post.comments.length !== originalLength) {
          hasChanged = true;
        }
      }
    });

    if (hasChanged) {
      try {
        localStorage.setItem('patitas_mock_posts', JSON.stringify(posts));
      } catch (_) {}
    }
    
    return posts;
  } catch (_) {
    return defaultPosts;
  }
}

function saveMockPosts(posts) {
  try {
    localStorage.setItem('patitas_mock_posts', JSON.stringify(posts));
  } catch (_) {}
}

const defaultCenters = [
  {
    id: 1,
    name: "Centro de Desarrollo Infantil y Atención Temprana (CDIAT) Patitas",
    address: "Calle de Serrano, 142, 28006 Madrid",
    lat: 40.435,
    lng: -3.688,
    phone: "+34 915 678 901",
    website: "https://www.patitasatenciontemprana.es",
    therapies: ["Terapia Ocupacional", "Integración Sensorial", "Psicología", "Logopedia"],
    rating: 4.9,
    description: "Especialistas en estimulación precoz e integración sensorial en un entorno lúdico y adaptado."
  },
  {
    id: 2,
    name: "Gabinete de Logopedia y Neurodesarrollo Madrid",
    address: "Calle de Alberto Aguilera, 23, 28015 Madrid",
    lat: 40.430,
    lng: -3.712,
    phone: "+34 914 567 890",
    therapies: ["Logopedia", "Psicomotricidad", "Fisioterapia"],
    rating: 4.7,
    description: "Programas personalizados de comunicación verbal y no verbal para la primera infancia."
  },
  {
    id: 3,
    name: "Clínica Psicopedagógica Avanza",
    address: "Paseo de la Castellana, 85, 28046 Madrid",
    lat: 40.448,
    lng: -3.692,
    phone: "+34 913 222 111",
    therapies: ["Apoyo Pedagógico", "Psicología Infantil", "Terapia de Juego"],
    rating: 4.8,
    description: "Evaluaciones diagnósticas y soporte continuo para niños con sospechas de neurodiversidad."
  },
  {
    id: 4,
    name: "Asociación Española de Atención Temprana Inclusiva",
    address: "Calle de Atocha, 64, 28012 Madrid",
    lat: 40.412,
    lng: -3.699,
    phone: "+34 912 999 888",
    therapies: ["Terapia Familiar", "Grupos de Apoyo", "Fisioterapia"],
    rating: 4.6,
    description: "Talleres familiares gratuitos, asesoría legal escolar y grupos de encuentro entre padres."
  },
  {
    id: 5,
    name: "CDIAT Arcoiris Tetuán",
    address: "Calle de Bravo Murillo, 244, 28020 Madrid",
    lat: 40.457,
    lng: -3.704,
    phone: "+34 916 444 333",
    therapies: ["Psicomotricidad", "Integración Sensorial", "Terapia Ocupacional"],
    rating: 4.8,
    description: "Acompañamiento especializado en el desarrollo psicomotor y sensorial de niños de 0 a 6 años."
  },
  {
    id: 6,
    name: "Centro de Atención Temprana Bizirik",
    address: "Alameda de Mazarredo, 15, 48009 Bilbao",
    lat: 43.268,
    lng: -2.934,
    phone: "+34 944 123 456",
    website: "https://www.bizirik.eus",
    therapies: ["Fisioterapia", "Psicomotricidad", "Logopedia", "Integración Sensorial"],
    rating: 4.9,
    description: "Centro especializado en atención temprana, logopedia, fisioterapia y terapia ocupacional para potenciar la autonomía infantil."
  },
  {
    id: 7,
    name: "Gabinete de Apoyo Infantil Gure Txokoa",
    address: "Gran Vía de Don Diego López de Haro, 45, 48011 Bilbao",
    lat: 43.263,
    lng: -2.935,
    phone: "+34 944 654 321",
    website: "https://www.guretxokoainfantil.org",
    therapies: ["Psicología Infantil", "Terapia de Juego", "Logopedia"],
    rating: 4.8,
    description: "Acompañamiento psicopedagógico integral centrado en la familia y el desarrollo socioemocional."
  },
  {
    id: 8,
    name: "CDIAT Alai Bilbao",
    address: "Calle Licenciado Poza, 12, 48008 Bilbao",
    lat: 43.261,
    lng: -2.939,
    phone: "+34 944 777 888",
    website: "https://www.alaibilbao.com",
    therapies: ["Terapia Ocupacional", "Integración Sensorial"],
    rating: 4.7,
    description: "Espacio adaptado con salas de integración sensorial de última generación para niños con dificultades del desarrollo."
  },
  {
    id: 9,
    name: "Asociación Inclusiva Bizkaia",
    address: "Calle Autonomía, 26, 48012 Bilbao",
    lat: 43.257,
    lng: -2.941,
    phone: "+34 944 999 000",
    therapies: ["Terapia Familiar", "Apoyo Escolar", "Grupos de Encuentro"],
    rating: 4.6,
    description: "Talleres familiares, escuela de padres y actividades de ocio inclusivo de fin de semana en Vizcaya."
  },
  {
    id: 10,
    name: "Centro de Terapia Sensorial Infantil Delicias",
    address: "Paseo de las Delicias, 32, 28045 Madrid",
    lat: 40.402,
    lng: -3.693,
    phone: "+34 911 234 567",
    therapies: ["Integración Sensorial", "Terapia Ocupacional", "Fisioterapia"],
    rating: 4.8,
    description: "Sala de integración sensorial totalmente equipada y profesionales dedicados al desarrollo psicomotor."
  },
  {
    id: 11,
    name: "Gabinete de Logopedia y Aprendizaje Retiro",
    address: "Calle de Ibiza, 14, 28009 Madrid",
    lat: 40.418,
    lng: -3.678,
    phone: "+34 911 345 678",
    therapies: ["Logopedia", "Apoyo Pedagógico", "Psicología"],
    rating: 4.9,
    description: "Especializados en trastornos del lenguaje, lectura, escritura y logopedia de atención temprana."
  },
  {
    id: 12,
    name: "Centro de Neurodesarrollo Infantil Chamberí",
    address: "Calle de Santa Engracia, 54, 28010 Madrid",
    lat: 40.437,
    lng: -3.702,
    phone: "+34 911 456 789",
    therapies: ["Estimulación Cognitiva", "Neuropsicología", "Psicomotricidad"],
    rating: 4.7,
    description: "Evaluación y tratamiento del neurodesarrollo infantil desde enfoques neuropsicológicos."
  },
  {
    id: 13,
    name: "CDIAT Las Rozas",
    address: "Calle Real, 18, 28231 Las Rozas, Madrid",
    lat: 40.545,
    lng: -3.875,
    phone: "+34 911 567 890",
    therapies: ["Psicomotricidad", "Logopedia", "Terapia Familiar"],
    rating: 4.6,
    description: "Centro concertado de atención temprana en la zona noroeste de Madrid para niños de 0 a 6 años."
  },
  {
    id: 14,
    name: "Gabinete de Atención Temprana Alcalá",
    address: "Calle Mayor, 78, 28801 Alcalá de Henares, Madrid",
    lat: 40.482,
    lng: -3.364,
    phone: "+34 911 678 901",
    therapies: ["Logopedia", "Fisioterapia", "Psicología Infantil"],
    rating: 4.8,
    description: "Intervención de estimulación temprana integral para familias de Alcalá de Henares y alrededores."
  },
  {
    id: 15,
    name: "Gabinete de Neurodesarrollo Infantil Barcelona",
    address: "Passeig de Gràcia, 92, 08008 Barcelona",
    lat: 41.395,
    lng: 2.162,
    phone: "+34 933 123 456",
    website: "https://www.neurobarcelona.cat",
    therapies: ["Neuropsicología", "Logopedia", "Terapia Ocupacional"],
    rating: 4.9,
    description: "Centro de referencia en Barcelona especializado en diagnóstico e intervención en autismo y TDAH."
  },
  {
    id: 16,
    name: "CDIAT Eixample",
    address: "Carrer d'Aragó, 285, 08009 Barcelona",
    lat: 41.392,
    lng: 2.167,
    phone: "+34 933 234 567",
    therapies: ["Integración Sensorial", "Psicología Infantil", "Psicomotricidad"],
    rating: 4.8,
    description: "Estimulación temprana integral con salas equipadas para psicomotricidad relacional."
  },
  {
    id: 17,
    name: "Centro de Estimulación Temprana Sarrià",
    address: "Carrer de Major de Sarrià, 42, 08017 Barcelona",
    lat: 41.401,
    lng: 2.122,
    phone: "+34 933 345 678",
    therapies: ["Estimulación Temprana", "Terapia Familiar", "Logopedia"],
    rating: 4.7,
    description: "Atención individualizada centrada en el modelo de competencias familiares y el desarrollo del bebé."
  },
  {
    id: 18,
    name: "Gabinete Psicopedagógico Valencia Centro",
    address: "Carrer de Colón, 15, 46004 Valencia",
    lat: 39.468,
    lng: -0.373,
    phone: "+34 963 123 456",
    therapies: ["Apoyo Pedagógico", "Psicología Infantil", "Terapia de Juego"],
    rating: 4.8,
    description: "Orientación educativa infantil, estimulación del lenguaje y terapia de conducta adaptada."
  },
  {
    id: 19,
    name: "CDIAT Ruzafa",
    address: "Carrer de Sueca, 32, 46006 Valencia",
    lat: 39.461,
    lng: -0.377,
    phone: "+34 963 234 567",
    therapies: ["Fisioterapia", "Psicomotricidad", "Logopedia"],
    rating: 4.7,
    description: "Servicio de estimulación precoz y fisioterapia respiratoria y motriz infantil en Valencia."
  },
  {
    id: 20,
    name: "Centro de Atención Infantil Giralda",
    address: "Calle Sierpes, 45, 41004 Sevilla",
    lat: 37.390,
    lng: -5.994,
    phone: "+34 954 123 456",
    website: "https://www.atencioninfantilgiralda.es",
    therapies: ["Psicología Infantil", "Terapia Familiar", "Terapia Ocupacional"],
    rating: 4.9,
    description: "Apoyo interdisciplinario en atención temprana y neurodesarrollo en el centro de Sevilla."
  },
  {
    id: 21,
    name: "CDIAT Triana",
    address: "Calle San Jacinto, 12, 41010 Sevilla",
    lat: 37.384,
    lng: -6.007,
    phone: "+34 954 234 567",
    therapies: ["Psicomotricidad", "Logopedia", "Integración Sensorial"],
    rating: 4.8,
    description: "Salas de psicomotricidad y logopedia clínica para el desarrollo del lenguaje en la infancia."
  },
  {
    id: 22,
    name: "CDIAT Gipuzkoa Donostia",
    address: "Calle de Urbieta, 18, 20006 Donostia-San Sebastián",
    lat: 43.317,
    lng: -1.981,
    phone: "+34 943 111 222",
    website: "https://www.cdiatdonostia.eus",
    therapies: ["Logopedia", "Terapia Ocupacional", "Psicomotricidad"],
    rating: 4.8,
    description: "Atención integral del desarrollo infantil en Donostia."
  },
  {
    id: 23,
    name: "Gabinete de Neurodesarrollo Ondarreta",
    address: "Paseo de Ondarreta, 10, 20008 Donostia-San Sebastián",
    lat: 43.313,
    lng: -2.004,
    phone: "+34 943 222 333",
    website: "https://www.ondarretaneuro.eus",
    therapies: ["Psicología Infantil", "Terapia Familiar", "Integración Sensorial"],
    rating: 4.9,
    description: "Especialistas en dificultades del aprendizaje e integración sensorial frente a la playa de Ondarreta."
  },
  {
    id: 24,
    name: "Centro de Atención Temprana Araba",
    address: "Calle de Francia, 24, 01002 Vitoria-Gasteiz",
    lat: 42.850,
    lng: -2.668,
    phone: "+34 945 333 444",
    website: "https://www.atenciontempranaraba.eus",
    therapies: ["Fisioterapia", "Psicomotricidad", "Logopedia"],
    rating: 4.7,
    description: "Servicio concertado de estimulación precoz para niños de Álava."
  },
  {
    id: 25,
    name: "Gabinete Psicopedagógico Zabalgana",
    address: "Avenida de la Ilustración, 12, 01015 Vitoria-Gasteiz",
    lat: 42.842,
    lng: -2.698,
    phone: "+34 945 444 555",
    website: "https://www.zabalganapsico.eus",
    therapies: ["Terapia Ocupacional", "Apoyo Pedagógico", "Terapia de Juego"],
    rating: 4.8,
    description: "Acompañamiento en el desarrollo infantil y orientación familiar en Zabalgana."
  },
  {
    id: 26,
    name: "CDIAT Barakaldo - Bizkaia",
    address: "Calle de los Fueros, 8, 48901 Barakaldo",
    lat: 43.297,
    lng: -2.986,
    phone: "+34 944 555 666",
    website: "https://www.barakaldocdiat.eus",
    therapies: ["Logopedia", "Integración Sensorial", "Terapia Ocupacional"],
    rating: 4.7,
    description: "Centro de estimulación infantil y logopedia en el centro de Barakaldo."
  },
  {
    id: 27,
    name: "Gabinete Infantil Getxo Las Arenas",
    address: "Calle Mayor, 15, 48930 Getxo",
    lat: 43.326,
    lng: -3.013,
    phone: "+34 944 666 777",
    website: "https://www.infantilgetxo.eus",
    therapies: ["Psicología Infantil", "Psicomotricidad", "Terapia Familiar"],
    rating: 4.9,
    description: "Especialistas en neurodesarrollo infantil y terapia familiar en Las Arenas."
  },
  {
    id: 28,
    name: "Centro de Terapia Temprana Bidasoa",
    address: "Paseo de Colón, 22, 20302 Irun",
    lat: 43.339,
    lng: -1.789,
    phone: "+34 943 777 888",
    website: "https://www.terapiabidasoa.eus",
    therapies: ["Fisioterapia", "Logopedia", "Integración Sensorial"],
    rating: 4.8,
    description: "Estimulación y rehabilitación infantil en la comarca del Bidasoa."
  },
  {
    id: 29,
    name: "CDIAT Durango",
    address: "Calle Askatasun Etorbidea, 4, 48200 Durango",
    lat: 43.168,
    lng: -2.631,
    phone: "+34 946 888 999",
    website: "https://www.durangocdiat.eus",
    therapies: ["Psicomotricidad", "Logopedia", "Terapia Ocupacional"],
    rating: 4.7,
    description: "Atención psicomotriz y del lenguaje en el Duranguesado."
  }
];

function getMockCenters() {
  try {
    const saved = localStorage.getItem('patitas_mock_centers');
    let centers = saved ? JSON.parse(saved) : defaultCenters;
    
    // Asegurar que Bizirik esté presente en la base de datos, que tenga los 29 centros y contenga la propiedad website
    if (centers.length < 29 || !centers.some(c => c.name && c.name.includes('Bizirik')) || !centers.some(c => c.website)) {
      centers = defaultCenters;
      localStorage.setItem('patitas_mock_centers', JSON.stringify(centers));
    }
    
    return centers;
  } catch (_) {
    return defaultCenters;
  }
}

function saveMockCenters(centers) {
  try {
    localStorage.setItem('patitas_mock_centers', JSON.stringify(centers));
  } catch (_) {}
}

let mockPosts = getMockPosts();

if (isMockEnabled) {
  api.interceptors.request.use(
    async (config) => {
      const url = config.url || '';

      // Interceptamos peticiones de devoluciones/cambios (/requests)
      if (url.includes('/requests') && config.method?.toLowerCase() === 'post') {
        const requestData = getRequestData(config);
        
        let requests = [];
        try {
          const saved = localStorage.getItem('patitas_mock_requests');
          if (saved) requests = JSON.parse(saved);
        } catch (_) {}
        
        const newRequest = {
          id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
          ...requestData,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        
        requests.push(newRequest);
        localStorage.setItem('patitas_mock_requests', JSON.stringify(requests));
        
        throw {
          __isMockResponse: true,
          response: {
            status: 201,
            data: {
              success: true,
              message: 'Solicitud de devolución registrada correctamente.',
              request: newRequest
            },
            statusText: 'Created',
            headers: {},
            config
          }
        };
      }

      // Interceptamos la eliminación de pedidos (DELETE /pedidos/:id y DELETE /pedidos/:id/items/:productId)
      if (url.includes('/pedidos/') && config.method?.toLowerCase() === 'delete') {
        const parts = url.split('/');
        const idIndex = parts.indexOf('pedidos') + 1;
        const orderId = parts[idIndex];
        const isItemDeletion = parts.includes('items');
        
        let orders = [];
        try {
          const saved = localStorage.getItem('patitas_orders');
          if (saved) orders = JSON.parse(saved);
        } catch (_) {}

        if (isItemDeletion) {
          const productId = parseInt(parts[parts.indexOf('items') + 1]);
          const order = orders.find(o => o.id === orderId);
          if (order) {
            order.items = order.items.filter(i => i.productId !== productId);
            if (order.items.length === 0) {
              orders = orders.filter(o => o.id !== orderId);
            } else {
              order.total = +order.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
            }
            localStorage.setItem('patitas_orders', JSON.stringify(orders));
          }
        } else {
          orders = orders.filter(o => o.id !== orderId);
          localStorage.setItem('patitas_orders', JSON.stringify(orders));
        }

        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: { success: true, message: 'Eliminación procesada con éxito.' },
            statusText: 'OK',
            headers: {},
            config
          }
        };
      }

      // Interceptamos centros de atención temprana
      if (url.includes('/centros') && !url.includes('/posts')) {
        const centers = getMockCenters();
        const method = config.method ? config.method.toLowerCase() : 'get';
        
        if (method === 'post') {
          const payload = getRequestData(config);
          const newCenter = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: payload.name,
            address: payload.address || 'Sin dirección',
            phone: payload.phone || '',
            website: payload.website || '',
            therapies: [],
            rating: 5.0,
            description: payload.description || ''
          };
          centers.push(newCenter);
          saveMockCenters(centers);
          
          throw {
            __isMockResponse: true,
            response: {
              status: 201,
              data: newCenter,
              statusText: 'Created',
              headers: {},
              config
            }
          };
        }

        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: centers,
            statusText: 'OK',
            headers: {},
            config
          }
        };
      }

      // Interceptamos recursos
      if (url.includes('/recursos')) {
        

        const mockResources = [
          {
            id: 1,
            title: "Comprendiendo el autismo infantil",
            category: "articulos",
            description: "Un artículo introductorio para familias que acaban de recibir un diagnóstico. Consejos de expertos y primeros pasos prácticos.",
            image: placeholderResourceImage,
            author: "Dra. Elisa Gómez",
            readTime: "5 min de lectura",
            updatedAt: "25 May 2026",
            intro: "Recibir un diagnóstico de autismo puede generar muchas preguntas. Es importante recordar que cada niño es único. En este artículo, abordamos las pautas clave para asimilar el diagnóstico, establecer los primeros apoyos terapéuticos y, sobre todo, aprender a comprender el lenguaje singular de tu hijo desde el amor y el respeto.",
            content: "Recibir un diagnóstico de autismo puede generar muchas preguntas. Es importante recordar que cada niño es único. En este artículo, abordamos las pautas clave para asimilar el diagnóstico, establecer los primeros apoyos terapéuticos y, sobre todo, aprender a comprender el lenguaje singular de tu hijo desde el amor y el respeto. La intervención temprana es fundamental, pero el bienestar emocional de la familia es el motor principal.",
            sections: [
              {
                id: "que-es-el-espectro-autista",
                title: "¿Qué es el espectro autista?",
                content: "El Trastorno del Espectro Autista (TEA) es una condición del neurodesarrollo que afecta la forma en que las personas interactúan con otros, se comunican, aprenden y se comportan. Se le llama 'espectro' porque existe una amplia variación en el tipo y la gravedad de los síntomas que experimentan las personas.",
                type: "text"
              },
              {
                type: "tips",
                title: "Señales clave",
                items: [
                  "01. Dificultades en la comunicación social y reciprocidad.",
                  "02. Intereses muy focalizados y conductas repetitivas.",
                  "03. Diferencias en el procesamiento de estímulos sensoriales."
                ]
              }
            ]
          },
          {
            id: 2,
            title: "Señales de alerta en el desarrollo temprano",
            category: "articulos",
            description: "Aprende a identificar las primeras manifestaciones de retos sensoriales y comunicativos en la infancia temprana.",
            image: placeholderResourceImage,
            author: "Lic. Marcos Rivas",
            readTime: "7 min",
            content: "Identificar las señales de alerta de manera temprana marca una gran diferencia. En este artículo detallamos qué conductas observar en áreas como la comunicación social (ausencia de contacto visual directo, no responder al nombre), la flexibilidad conductual (patrones de interés muy específicos) y el procesamiento sensorial (reacciones inusuales a sonidos o texturas)."
          },
          {
            id: 3,
            title: "Importancia de la rutina diaria",
            category: "articulos",
            description: "Cómo estructurar el día a día para brindar seguridad y previsibilidad a los más pequeños mediante apoyos visuales.",
            image: placeholderResourceImage,
            author: "Terapeuta Sofía Vega",
            readTime: "4 min",
            content: "Para un niño con autismo, el mundo puede parecer un lugar caótico y difícil de predecir. Las rutinas estructuradas reducen la ansiedad proporcionando un marco seguro y predecible. Explicamos cómo utilizar agendas visuales con pictogramas para transiciones diarias como levantarse, ir al colegio, comer y la hora de dormir."
          },
          {
            id: 4,
            title: "Mitos y realidades sobre el TEA",
            category: "articulos",
            description: "Desmitificando conceptos erróneos comunes en la sociedad para promover una verdadera inclusión y respeto.",
            image: placeholderResourceImage,
            author: "Dr. Alberto Sanz",
            readTime: "6 min",
            content: "Existen numerosas falsas creencias sobre el autismo que dificultan la inclusión de los niños. Desmentimos los mitos más dañinos (como que no sienten empatía o que viven en su propio mundo) y exponemos realidades basadas en la neurodiversidad y en la evidencia científica actual."
          },
          {
            id: 5,
            title: "Guía de Atención Temprana: Primeros pasos tras el diagnóstico",
            category: "guias",
            description: "Pasos concretos tras el diagnóstico: terapias, centros de apoyo, derechos de tu hijo y cómo comenzar hoy mismo.",
            image: placeholderResourceImage,
            author: "Asociación Patitas",
            readTime: "15 min de lectura",
            updatedAt: "28 May 2026",
            intro: "Recibir un diagnóstico de Trastorno del Espectro Autista (TEA) puede generar una mezcla de emociones. El inicio de un camino de comprensión y apoyo... La atención temprana es el pilar fundamental que marcará la diferencia en el desarrollo evolutivo de tu hijo o hija en sus primeros años.",
            content: "Recibir un diagnóstico de Trastorno del Espectro Autista (TEA) puede generar una mezcla de emociones. El inicio de un camino de comprensión y apoyo... La atención temprana es el pilar fundamental que marcará la diferencia en el desarrollo evolutivo de tu hijo o hija en sus primeros años.",
            sections: [
              {
                id: "que-es-la-atencion-temprana",
                title: "¿Qué es la atención temprana?",
                content: "Se define como el conjunto de intervenciones dirigidas a la población infantil de 0 a 6 años, a su familia y a su entorno. El objetivo es dar respuesta lo más pronto posible a las necesidades que presentan los niños con trastornos en su desarrollo o que tienen riesgo de padecerlos.",
                type: "text"
              },
              {
                type: "tips",
                title: "Tips y realidades",
                items: [
                  "01. No esperes. La plasticidad cerebral es máxima en los primeros años; cada mes cuenta.",
                  "02. Busca equipos multidisciplinares que incluyan logopedas, terapeutas ocupacionales y psicólogos.",
                  "03. Confía en tu instinto. Tú eres quien mejor conoce a tu pequeño."
                ]
              },
              {
                id: "el-proceso-de-atencion",
                title: "El proceso de atención",
                type: "list",
                items: [
                  { label: "1. Pediatra de referencia", text: "Es el primer filtro. Solicita una valoración si notas señales de alerta." },
                  { label: "2. Valoración en el CDIAT", text: "Los Centros de Desarrollo Infantil y Atención Temprana realizarán un estudio global." },
                  { label: "3. Plan de Intervención Personalizado (PIP)", text: "Se definirán los objetivos terapéuticos específicos." }
                ]
              },
              {
                type: "cards",
                items: [
                  { title: "Apoyo Psicológico", desc: "Sesiones enfocadas en la regulación emocional y habilidades sociales del niño.", theme: "purple" },
                  { title: "Logopedia Clínica", desc: "Intervención en la comunicación verbal y sistemas aumentativos (SAAC).", theme: "blue" }
                ]
              }
            ]
          },
          {
            id: 6,
            title: "Guía completa de integración sensorial",
            category: "guias",
            description: "Estrategias sencillas para adaptar el entorno doméstico ante la hipersensibilidad o hiposensibilidad táctil y auditiva.",
            image: placeholderResourceImage,
            author: "Lic. Laura Benítez",
            readTime: "Guía PDF (18 pág.)",
            content: "Muchos retos conductuales en niños autistas tienen su origen en una sobrecarga sensorial. Esta guía te enseña a identificar si tu hijo presenta hiper o hiporreactividad sensorial en el tacto, oído, vista, propiocepción o sistema vestibular, proporcionando adaptaciones domésticas de bajo costo."
          },
          {
            id: 7,
            title: "Guía de derechos y escolarización inclusiva",
            category: "guias",
            description: "Información legal and administrativa clara sobre el marco legal y apoyos escolares para niños con necesidades especiales.",
            image: placeholderResourceImage,
            author: "Red de Abogados por la Inclusión",
            readTime: "Guía PDF (15 pág.)",
            content: "Navegar el sistema educativo puede resultar abrumador. En este documento se compilan los pasos administrativos para solicitar adaptaciones curriculares, personal de apoyo (como auxiliares) y los derechos legales fundamentales que asisten a tu hijo en centros educativos públicos y concertados."
          },
          {
            id: 8,
            title: "Guía de juego adaptado por etapas",
            category: "guias",
            description: "Ideas de juguetes, adaptaciones sencillas y dinámicas estructuradas que favorecen el desarrollo cognitivo y social.",
            image: placeholderResourceImage,
            author: "Terapeuta Ocupacional Andrea Caro",
            readTime: "Guía PDF (10 pág.)",
            content: "El juego es el trabajo del niño. Sin embargo, los niños dentro del espectro pueden jugar de formas diferentes o repetitivas. Esta guía ofrece metodologías prácticas para introducir la reciprocidad en el juego, estructurar turnos y elegir los juguetes más idóneos según la etapa evolutiva del niño."
          },
          {
            id: 9,
            title: "Video: Técnicas de regulación emocional y sensorial",
            category: "videos",
            description: "Aprende estrategias visuales y ejercicios prácticos explicados en video por terapeutas ocupacionales.",
            image: placeholderResourceImage,
            author: "Patitas TV",
            readTime: "Duración: 15 min",
            content: "En este video demostrativo de 15 minutos, nuestra terapeuta ocupacional comparte tres dinámicas corporales y el uso de la 'caja de la calma' para gestionar las crisis de sobrecarga sensorial o desregulación emocional de manera respetuosa y efectiva en el hogar."
          },
          {
            id: 10,
            title: "Video: Historias sociales en formato animado",
            category: "videos",
            description: "Una útil herramienta audiovisual animada para ayudar a los niños a comprender y transitar situaciones cotidianas.",
            image: placeholderResourceImage,
            author: "Canal Inclusivo",
            readTime: "Duración: 8 min",
            content: "Las historias sociales son relatos cortos diseñados para enseñar comportamientos y normas sociales en situaciones específicas. Este video animado contiene tres historias sociales diseñadas para facilitar las visitas al dentista, los cortes de cabello y el compartir juguetes en el parque."
          },
          {
            id: 11,
            title: "Video: Testimonios de familias que inspiran",
            category: "videos",
            description: "Entrevistas emotivas donde madres y padres comparten sus caminos, aprendizajes y momentos de orgullo.",
            image: placeholderResourceImage,
            author: "Fundación Familias TEA",
            readTime: "Duración: 25 min",
            content: "Un espacio de conversación honesta y empática. Tres familias nos abren sus puertas para narrar sus experiencias tras el diagnóstico inicial, cómo se adaptaron a las nuevas dinámicas del hogar y cuáles son sus mayores alegrías en el desarrollo diario de sus hijos."
          },
          {
            id: 12,
            title: "Centro de Terapia Integral Patitas",
            category: "centros",
            description: "Servicios especializados en psicología infantil, fonoaudiología, psicomotricidad y terapia ocupacional enfocada en la familia.",
            image: placeholderCenterImage,
            author: "Madrid, España",
            readTime: "Centro de Apoyo",
            content: "Ubicado en el corazón de la ciudad, el Centro Patitas es una institución líder dedicada al acompañamiento interdisciplinario de niños y adolescentes con condiciones del neurodesarrollo. Contamos con salas de integración sensorial equipadas y un equipo altamente especializado."
          },
          {
            id: 13,
            title: "Clínica de Neurodesarrollo y Aprendizaje",
            category: "centros",
            description: "Centro médico especializado en evaluaciones diagnósticas tempranas y programas individualizados de intervención.",
            image: placeholderCenterImage,
            author: "Barcelona, España",
            readTime: "Centro Médico",
            content: "Nuestra clínica ofrece un enfoque médico y neuropsicológico de primer nivel. Nos especializamos en la aplicación de herramientas diagnósticas estandarizadas (como ADOS-2 y ADIR) y en el diseño de planes terapéuticos personalizados basados en la evidencia científica."
          },
          {
            id: 14,
            title: "Centro Educativo Especial Arcoiris",
            category: "centros",
            description: "Espacio de escolarización inclusiva y educación especial enfocado en potenciar autonomía y destrezas adaptativas.",
            image: placeholderCenterImage,
            author: "Sevilla, España",
            readTime: "Centro Educativo",
            content: "Arcoiris es un colegio de educación especial que trabaja codo a codo con las escuelas ordinarias. Nuestro modelo pedagógico prioriza la comunicación alternativa y aumentativa (SAAC), la autorregulación sensorial y el desarrollo de habilidades sociolaborales básicas."
          },
          {
            id: 15,
            title: "Asociación de Apoyo Familiar Tejiendo Redes",
            category: "centros",
            description: "Grupos de ayuda mutua, talleres de capacitación para padres y actividades de ocio inclusivo de fin de semana.",
            image: placeholderCenterImage,
            author: "Valencia, España",
            readTime: "Asociación Civil",
            content: "Fundada por padres y para padres. En Tejiendo Redes creemos firmemente que la familia es la base del éxito. Ofrecemos talleres formativos gratuitos de escuelas de padres, soporte terapéutico grupal para hermanos y planes de ocio y respiro familiar en entornos adaptados."
          }
        ];

        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: mockResources,
            statusText: 'OK',
            headers: {},
            config,
          },
        };
      }

      // Interceptamos productos de la tienda
      if (url.includes('/productos')) {
        

        const mockProducts = [
          {
            id: 1,
            name: "Puzle de Formas de Madera",
            category: "cognitivo",
            categoryLabel: "Cognitivo",
            price: 18.50,
            image: placeholderProductImage,
            ageRange: "3-6 años",
            developmentType: "Cognitivo",
            description: "Rompecabezas autocorrectivo diseñado para fortalecer la motricidad fina y el reconocimiento de patrones lógicos en edad preescolar.",
            longDescription: "Este rompecabezas de encaje de madera de alta calidad es ideal para acompañar el desarrollo cognitivo temprano. Presenta figuras geométricas coloridas con pomos de agarre ergonómicos que facilitan el agarre en niños con dificultades motrices finas. Ayuda a desarrollar la coordinación mano-ojo, el pensamiento espacial, y la resolución de problemas secuenciales mediante el juego libre o guiado por terapeutas.",
            inStock: true
          },
          {
            id: 2,
            name: "Set de Estimulación Sensorial",
            category: "sensorial",
            categoryLabel: "Sensorial",
            price: 34.00,
            image: placeholderProductImage,
            ageRange: "0-3 años",
            developmentType: "Sensorial",
            description: "Colección de bloques con diferentes texturas, cascabeles internos y filtros de colores para la exploración temprana y el desarrollo auditivo/táctil.",
            longDescription: "Un set multi-sensorial compuesto por 6 bloques blandos con variadas texturas superficiales y 4 bloques translúcidos de colores vibrantes. Diseñado especialmente para captar la atención de niños con hipo o hipersensibilidad sensorial. Ofrece estímulos controlados de sonido, luz y tacto, promoviendo la estimulación proprioceptiva inicial de forma segura.",
            inStock: true
          },
          {
            id: 3,
            name: "Manta Terapéutica Con Peso",
            category: "sensorial",
            categoryLabel: "Sensorial",
            price: 62.00,
            image: placeholderProductImage,
            ageRange: "7+ años",
            developmentType: "Sensorial",
            description: "Diseñada para proporcionar estimulación propioceptiva profunda, ideal para niños que experimentan sobrecarga sensorial o dificultades para dormir.",
            longDescription: "Nuestra manta pesada distribuye una presión suave y uniforme sobre el cuerpo (efecto Deep Touch Pressure). Esta estimulación imita un abrazo firme, ayudando a liberar serotonina y melatonina en el sistema nervioso. Altamente recomendada por terapeutas ocupacionales para momentos de transición, relajación en salas de calma o la hora del sueño.",
            inStock: true
          },
          {
            id: 4,
            name: "Kit de Pintura con Dedos Inclusivo",
            category: "motor",
            categoryLabel: "Motor",
            price: 22.00,
            image: placeholderProductImage,
            ageRange: "0-3 años",
            developmentType: "Motor",
            description: "Pinturas no tóxicas, lavables y con texturas gruesas para facilitar el agarre y estimular la destreza manual y coordinación bilateral.",
            longDescription: "Una experiencia artística sin barreras. Este kit contiene 4 tarros de pintura orgánica de consistencia densa y antideslizante, ideales para niños que recién inician la prensión palmar. Fomenta el juego creativo, el reconocimiento de colores y estimula los receptores táctiles mediante la pintura directa con manos y dedos.",
            inStock: true
          },
          {
            id: 5,
            name: "Juego de Pompas de Jabón Terapéuticas",
            category: "motor",
            categoryLabel: "Motor",
            price: 8.50,
            image: placeholderProductImage,
            ageRange: "3-6 años",
            developmentType: "Motor",
            description: "Herramienta de juego clásica utilizada para el entrenamiento del control del soplo oral y el desarrollo de habilidades motoras de logopedia.",
            longDescription: "Un recurso lúdico excelente para fonoaudiología y logopedia. Soplar pompas ayuda a regular el tono muscular de la boca, mejillas y labios, promoviendo una correcta articulación fonética. Además, el seguimiento visual de las pompas flotando estimula la atención conjunta y la fijación visual de una forma mágica y entretenida.",
            inStock: true
          },
          {
            id: 6,
            name: "Set de Fichas de Desarrollo Temprano",
            category: "cognitivo",
            categoryLabel: "Cognitivo",
            price: 27.00,
            image: placeholderProductImage,
            ageRange: "4-6 años",
            developmentType: "Cognitivo",
            description: "Fichas didácticas de apoyo visual para guiar rutinas, actividades de emparejamiento lógico y potenciar la comunicación aumentativa.",
            longDescription: "Conjunto de 30 tarjetas termolaminadas duraderas que representan actividades diarias comunes. Ideal para estructurar agendas visuales en casa o en el aula, reduciendo significativamente la ansiedad de anticipación. Permite realizar dinámicas de seriación temporal y categorización lógica junto a padres y educadores.",
            inStock: false
          }
        ];

        // Verificar si se busca un producto individual
        const match = url.match(/\/productos\/(\d+)/);
        let responseData = mockProducts;
        if (match) {
          const productId = parseInt(match[1]);
          const found = mockProducts.find(p => p.id === productId);
          if (found) {
            responseData = found;
          } else {
            throw {
              __isMockResponse: true,
              response: {
                status: 404,
                data: { message: "Producto no encontrado" },
                statusText: "Not Found",
                headers: {},
                config
              }
            };
          }
        }

        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: responseData,
            statusText: 'OK',
            headers: {},
            config,
          },
        };
      }

      // Interceptamos artículos del blog
      if (url.includes('/blog')) {
        const mockBlogArticles = [
          {
            id: 101,
            title: "El papel del juego en el neurodesarrollo infantil",
            slug: "juego-neurodesarrollo",
            category: "desarrollo",
            categoryLabel: "Desarrollo",
            description: "Descubre cómo el juego estructurado y libre fortalece las conexiones neuronales y la motricidad en la infancia temprana.",
            image: placeholderResourceImage,
            author: "Dra. Elena Ruiz",
            date: "2026-05-24T10:00:00Z",
            content: `
              <p>El juego no es simplemente una forma de pasar el tiempo para los niños; es el trabajo de la infancia. A través del juego, los niños exploran el mundo, entienden relaciones de causa y efecto y construyen habilidades cognitivas y motoras cruciales.</p>
              <h3>La neurobiología del juego</h3>
              <p>Diversos estudios demuestran que durante las actividades lúdicas, el cerebro del niño libera factores neurotróficos como el BDNF, que facilitan la plasticidad sináptica. Esto significa que jugar ayuda activamente a construir las autopistas de información en el cerebro en desarrollo.</p>
              <blockquote>"Un niño que juega aprende a resolver problemas complejos de forma natural, interactuando con su entorno."</blockquote>
              <h3>Tipos de juego recomendados</h3>
              <ul>
                <li><strong>Juego sensorio-motor:</strong> Estimula el cerebelo y la coordinación vestibular.</li>
                <li><strong>Juego simbólico:</strong> Fundamental para el desarrollo cognitivo y el lenguaje, ya que requiere representar realidades ausentes.</li>
                <li><strong>Juego estructurado con reglas:</strong> Fomenta las funciones ejecutivas, como el control inhibitorio y la memoria de trabajo.</li>
              </ul>
            `
          },
          {
            id: 102,
            title: "Estrategias de comunicación para niños con TEA",
            slug: "estrategias-comunicacion-tea",
            category: "tea",
            categoryLabel: "TEA",
            description: "Pautas prácticas y sistemas de comunicación aumentativa y alternativa (SAAC) para apoyar el habla y la reciprocidad social.",
            image: placeholderResourceImage,
            author: "Log. Marcos Sanz",
            date: "2026-05-18T09:00:00Z",
            content: `
              <p>Para muchos niños dentro del espectro autista, la comunicación verbal tradicional puede suponer un gran desafío. Sin embargo, la comunicación va mucho más allá de las palabras habladas.</p>
              <h3>Sistemas Aumentativos y Alternativos de Comunicación (SAAC)</h3>
              <p>El uso de agendas visuales, pictogramas y dispositivos electrónicos con salida de voz es esencial para empoderar a los niños no verbales y reducir la frustración que nace de no poder expresar sus necesidades.</p>
              <h3>Consejos prácticos para el día a día</h3>
              <ul>
                <li><strong>Usa un lenguaje claro y conciso:</strong> Evita frases hechas, dobles sentidos o metáforas complejas.</li>
                <li><strong>Apóyate en lo visual:</strong> Si dices "es hora de vestirse", señala la ropa o muestra un pictograma alusivo.</li>
                <li><strong>Espera pacientemente:</strong> Dales tiempo adicional para procesar la información y formular su respuesta.</li>
              </ul>
            `
          },
          {
            id: 103,
            title: "Gestión emocional en la crianza de niños atípicos",
            slug: "gestion-emocional-crianza",
            category: "crianza",
            categoryLabel: "Crianza",
            description: "Herramientas de autorregulación y autocuidado para padres y cuidadores que afrontan retos en el desarrollo infantil.",
            image: placeholderResourceImage,
            author: "Psic. Laura Gómez",
            date: "2026-05-10T08:30:00Z",
            content: `
              <p>La crianza de un niño con desafíos en el desarrollo o neurodivergencia es un camino lleno de amor y satisfacciones, pero también de demandas emocionales intensas.</p>
              <h3>La importancia de la autorregulación del cuidador</h3>
              <p>Un principio fundamental en psicología es que un adulto estresado difícilmente podrá calmar a un niño desregulado. El autocuidado no es un lujo, es una necesidad clínica para sostener una crianza consciente y respetuosa.</p>
              <blockquote>"Cuidar de ti mismo es la mejor manera de asegurar que tienes los recursos emocionales para cuidar de tu hijo."</blockquote>
              <h3>Estrategias cotidianas de regulación</h3>
              <p>Establecer pequeñas rutinas de desconexión, apoyarse en redes comunitarias y practicar la autocompasión frente a los momentos difíciles son prácticas esenciales para prevenir el burnout parental.</p>
            `
          },
          {
            id: 104,
            title: "Guía de integración sensorial en casa",
            slug: "integracion-sensorial-casa",
            category: "sensorial",
            categoryLabel: "Sensorial",
            description: "Cómo crear una dieta sensorial adaptada para niños con hipersensibilidad o hiposensibilidad en el hogar.",
            image: placeholderResourceImage,
            author: "TO. Sofía Vega",
            date: "2026-04-28T11:15:00Z",
            content: `
              <p>El procesamiento sensorial es la capacidad del cerebro para organizar y responder a la información que captamos a través de nuestros sentidos. Los niños con dificultades de procesamiento sensorial pueden reaccionar de forma exagerada (hipersensibilidad) o escasa (hiposensibilidad) a los estímulos.</p>
              <h3>¿Qué es una dieta sensorial?</h3>
              <p>Es un plan de actividades físicas personalizadas y diseñadas para proporcionar los estímulos táctiles, vestibulares y propioceptivos que el niño necesita para mantenerse enfocado, organizado y calmado durante el día.</p>
              <h3>Actividades recomendadas para el hogar</h3>
              <ul>
                <li><strong>Para la propiocepción (presión profunda):</strong> Saltar en trampolín, jugar a "hacer un sándwich" presionando suavemente con cojines, arrastrar cajas pesadas.</li>
                <li><strong>Para el sistema vestibular (movimiento):</strong> Columpiarse, rodar sobre una pelota terapéutica, balancearse.</li>
                <li><strong>Para el sistema táctil:</strong> Cajas de exploración sensorial con legumbres, arroz o espuma de afeitar.</li>
              </ul>
            `
          }
        ];

        // Verificar si se busca un artículo por slug
        const match = url.match(/\/blog\/([a-zA-Z0-9\-]+)/);
        if (match) {
          const articleSlug = match[1];
          const found = mockBlogArticles.find(a => a.slug === articleSlug);
          if (found) {
            throw {
              __isMockResponse: true,
              response: {
                status: 200,
                data: found,
                statusText: 'OK',
                headers: {},
                config
              }
            };
          } else {
            throw {
              __isMockResponse: true,
              response: {
                status: 404,
                data: { message: "Artículo no encontrado" },
                statusText: "Not Found",
                headers: {},
                config
              }
            };
          }
        }

        // De lo contrario, retornar toda la lista ordenada por fecha desc
        const sortedArticles = [...mockBlogArticles].sort((a, b) => new Date(b.date) - new Date(a.date));

        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: sortedArticles,
            statusText: 'OK',
            headers: {},
            config,
          },
        };
      }

      // Interceptamos posts de la comunidad
      if (url.includes('/posts')) {
        

        // 1. POST /posts/:id/likes
        const matchLike = url.match(/\/posts\/(\d+)\/likes/);
        if (matchLike && config.method === 'post') {
          const postId = parseInt(matchLike[1]);
          const post = mockPosts.find(p => p.id === postId);
          if (post) {
            const userToken = localStorage.getItem('patitas_token') || 'anonymous';
            const index = post.likedBy.indexOf(userToken);
            if (index > -1) {
              post.likedBy.splice(index, 1);
              post.likes = Math.max(0, post.likes - 1);
            } else {
              post.likedBy.push(userToken);
              post.likes += 1;
            }
            saveMockPosts(mockPosts);
            throw {
              __isMockResponse: true,
              response: {
                status: 200,
                data: { likes: post.likes, likedBy: post.likedBy },
                statusText: 'OK',
                headers: {},
                config
              }
            };
          } else {
            throw {
              __isMockResponse: true,
              response: { status: 404, data: { message: "Post no encontrado" }, config }
            };
          }
        }

        // 2. POST /posts/:id/comments
        const matchComment = url.match(/\/posts\/(\d+)\/comments/);
        if (matchComment && config.method === 'post') {
          const postId = parseInt(matchComment[1]);
          const post = mockPosts.find(p => p.id === postId);
          if (post) {
            const { content } = getRequestData(config);
            let savedUser = null;
            try {
              savedUser = JSON.parse(localStorage.getItem('patitas_user') || 'null');
              if (savedUser && !savedUser.avatar) {
                savedUser.avatar = generateAvatarSvg(savedUser.name);
              }
            } catch (_) {}

            const newComment = {
              id: post.comments.length + 1,
              author: savedUser || {
                name: 'Padre Demo',
                avatar: generateAvatarSvg('Padre Demo'),
                role: 'Padre Demo'
              },
              content: content || '',
              createdAt: new Date().toISOString()
            };

            post.comments.push(newComment);
            saveMockPosts(mockPosts);
            throw {
              __isMockResponse: true,
              response: {
                status: 200,
                data: newComment,
                statusText: 'OK',
                headers: {},
                config
              }
            };
          } else {
            throw {
              __isMockResponse: true,
              response: { status: 404, data: { message: "Post no encontrado" }, config }
            };
          }
        }

        // 2b. PUT /posts/:id/comments/:commentId (editar)
        const matchPutComment = url.match(/\/posts\/(\d+)\/comments\/(\d+)/);
        if (matchPutComment && config.method === 'put') {
          const postId = parseInt(matchPutComment[1]);
          const commentId = parseInt(matchPutComment[2]);
          const { content } = getRequestData(config);
          
          const post = mockPosts.find(p => p.id === postId);
          if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
              comment.content = content || '';
              comment.updatedAt = new Date().toISOString();
              saveMockPosts(mockPosts);
              
              throw {
                __isMockResponse: true,
                response: {
                  status: 200,
                  data: comment,
                  statusText: 'OK',
                  headers: {},
                  config,
                },
              };
            }
          }
          throw {
            __isMockResponse: true,
            response: {
              status: 404,
              data: { message: "Comentario no encontrado" },
              config,
            },
          };
        }

        // 2c. DELETE /posts/:id/comments/:commentId (borrar)
        if (matchPutComment && config.method === 'delete') {
          const postId = parseInt(matchPutComment[1]);
          const commentId = parseInt(matchPutComment[2]);
          
          const post = mockPosts.find(p => p.id === postId);
          if (post) {
            const commentIndex = post.comments.findIndex(c => c.id === commentId);
            if (commentIndex !== -1) {
              post.comments.splice(commentIndex, 1);
              saveMockPosts(mockPosts);
              
              throw {
                __isMockResponse: true,
                response: {
                  status: 200,
                  data: { message: "Comentario eliminado con éxito" },
                  statusText: 'OK',
                  headers: {},
                  config,
                },
              };
            }
          }
          throw {
            __isMockResponse: true,
            response: {
              status: 404,
              data: { message: "Comentario no encontrado" },
              config,
            },
          };
        }

        // 3. GET /posts/:id (detalle)
        const matchDetail = url.match(/\/posts\/(\d+)/);
        if (matchDetail && config.method === 'get') {
          const postId = parseInt(matchDetail[1]);
          const post = mockPosts.find(p => p.id === postId);
          if (post) {
            throw {
              __isMockResponse: true,
              response: {
                status: 200,
                data: post,
                statusText: 'OK',
                headers: {},
                config
              }
            };
          } else {
            throw {
              __isMockResponse: true,
              response: { status: 404, data: { message: "Post no encontrado" }, config }
            };
          }
        }

        // 4. POST /posts (crear)
        if (config.method === 'post') {
          const { title, content, category } = getRequestData(config);
          let savedUser = null;
          try {
            savedUser = JSON.parse(localStorage.getItem('patitas_user') || 'null');
            if (savedUser && !savedUser.avatar) {
              savedUser.avatar = generateAvatarSvg(savedUser.name);
            }
          } catch (_) {}

          const newPost = {
            id: mockPosts.length + 1,
            title: title || 'Sin título',
            content: content || '',
            category: category || 'General',
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            author: savedUser || {
              name: 'Padre Demo',
              avatar: generateAvatarSvg('Padre Demo'),
              role: 'Padre Demo'
            },
            comments: []
          };

          mockPosts.unshift(newPost);
          saveMockPosts(mockPosts);
          throw {
            __isMockResponse: true,
            response: {
              status: 201,
              data: newPost,
              statusText: 'Created',
              headers: {},
              config
            }
          };
        }

        // 5. GET /posts (listado)
        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: mockPosts,
            statusText: 'OK',
            headers: {},
            config
          }
        };
      }

      // Interceptamos actualizaciones de perfil (PATCH /usuarios/:id)
      if (url.includes('/usuarios/') && config.method === 'patch') {
        const userId = parseInt(url.split('/').pop());
        const requestData = getRequestData(config);
        const users = getMockUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw {
            __isMockResponse: true,
            response: {
              status: 404,
              data: { message: 'Usuario no encontrado.' },
              config
            }
          };
        }
        
        // Update user fields
        const updatedUser = {
          ...users[userIndex],
          ...requestData
        };
        
        users[userIndex] = updatedUser;
        saveMockUsers(users);
        
        // Update local session storage if it matches current user
        const currentUser = JSON.parse(localStorage.getItem('patitas_user') || '{}');
        if (currentUser.id === userId) {
          localStorage.setItem('patitas_user', JSON.stringify(updatedUser));
        }
        
        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: {
              message: 'Perfil actualizado',
              user: updatedUser
            },
            statusText: 'OK',
            headers: {},
            config
          }
        };
      }

      // Interceptamos rutas de autenticación
      if (url.includes('/auth/')) {
        // Retraso de red simulado para una UX realista (spinners, loaders, etc.)
        

        let mockData = {};

        if (url.endsWith('/login')) {
          const { email, password } = getRequestData(config);
          const users = getMockUsers();
          const foundUser = users.find(u => u && u.email && u.email.toLowerCase() === (email || '').toLowerCase());
          
          if (!foundUser || foundUser.password !== password) {
            throw {
              __isMockResponse: true,
              response: {
                status: 401,
                data: { message: 'El correo electrónico o la contraseña son incorrectos.' },
                config
              }
            };
          }

          if (foundUser.status === 'suspended') {
            throw {
              __isMockResponse: true,
              response: {
                status: 403,
                data: { message: 'Tu cuenta ha sido suspendida. Por favor, contacta con soporte.' },
                config
              }
            };
          }

          mockData = {
            token: `mock-jwt-token-login-${Date.now()}`,
            user: {
              id: foundUser.id,
              name: foundUser.name,
              email: foundUser.email,
              role: foundUser.role,
              avatar: foundUser.avatar || generateAvatarSvg(foundUser.name),
              createdAt: foundUser.createdAt,
              savedResources: foundUser.savedResources || []
            },
          };
        } else if (url.endsWith('/register')) {
          const { name, email, password, childName } = getRequestData(config);
          const users = getMockUsers();
          
          if (users.some(u => u && u.email && u.email.toLowerCase() === (email || '').toLowerCase())) {
            throw {
              __isMockResponse: true,
              response: {
                status: 400,
                data: { message: 'El correo electrónico ya está registrado.' },
                config
              }
            };
          }

          const newUser = {
            id: Math.floor(Math.random() * 1000) + 10,
            name: name || 'Usuario Registrado',
            email: email || 'nuevo@example.com',
            password: password || 'password',
            role: childName ? `padre(s) de: ${childName}` : 'user',
            avatar: generateAvatarSvg(name || 'Usuario Registrado'),
            createdAt: new Date().toISOString(),
            savedResources: []
          };

          users.push(newUser);
          saveMockUsers(users);

          mockData = {
            token: `mock-jwt-token-register-${Date.now()}`,
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              avatar: newUser.avatar,
              createdAt: newUser.createdAt,
              savedResources: []
            },
          };
        } else if (url.includes('/oauth')) {
          const { provider, email } = getRequestData(config);
          const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Social';
          mockData = {
            token: `mock-jwt-token-oauth-${provider}-${Date.now()}`,
            user: {
              id: Math.floor(Math.random() * 1000) + 10,
              name: `${providerName} Demo`,
              email: email || `${provider}-user@example.com`,
              role: 'user',
              avatar: generateAvatarSvg(`${providerName} Demo`),
              createdAt: new Date().toISOString(),
            },
          };
        } else if (url.endsWith('/me')) {
          const token = localStorage.getItem('patitas_token');
          if (!token) {
            // Provocar un error 401 si no hay sesión iniciada
            throw {
              __isMockResponse: true,
              response: {
                status: 401,
                data: { message: 'Token de sesión ausente o inválido.' },
              },
            };
          }

          let savedUser = null;
          try {
            const localUser = JSON.parse(localStorage.getItem('patitas_user') || 'null');
            if (localUser) {
              const users = getMockUsers();
              const found = users.find(u => u.id === localUser.id);
              if (found) {
                savedUser = {
                  id: found.id,
                  name: found.name,
                  email: found.email,
                  role: found.role,
                  avatar: found.avatar || generateAvatarSvg(found.name),
                  createdAt: found.createdAt,
                  savedResources: found.savedResources || []
                };
              }
            }
          } catch (_) {}

          mockData = {
            user: savedUser || {
              id: 1,
              name: 'Padre Demo',
              email: 'demo@example.com',
              role: 'user',
              avatar: generateAvatarSvg('Padre Demo'),
              createdAt: new Date().toISOString(),
              savedResources: [1, 3]
            },
          };
        } else if (url.endsWith('/change-password')) {
          const { userId, currentPassword, newPassword } = getRequestData(config);
          const users = getMockUsers();
          const userIndex = users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            throw {
              __isMockResponse: true,
              response: {
                status: 404,
                data: { message: 'Usuario no encontrado.' },
                config
              }
            };
          }
          
          const foundUser = users[userIndex];
          if (foundUser.password !== currentPassword) {
            throw {
              __isMockResponse: true,
              response: {
                status: 400,
                data: { message: 'La contraseña actual es incorrecta.' },
                config
              }
            };
          }
          
          foundUser.password = newPassword;
          users[userIndex] = foundUser;
          saveMockUsers(users);
          
          mockData = {
            message: 'Contraseña actualizada con éxito. Se han cerrado las sesiones en otros dispositivos.'
          };
        } else if (url.includes('/admin/users')) {
          const users = getMockUsers();
          const method = config.method ? config.method.toLowerCase() : 'get';
          
          if (method === 'get') {
            const adminUsers = users.filter(u => u && ['admin_centro', 'admin_profesional'].includes(u.role));
            mockData = adminUsers;
          } else if (method === 'post') {
            const payload = getRequestData(config);
            if (users.some(u => u && u.email && u.email.toLowerCase() === (payload.email || '').toLowerCase())) {
              throw {
                __isMockResponse: true,
                response: {
                  status: 400,
                  data: { message: 'El correo electrónico ya está registrado.' },
                  config
                }
              };
            }
            
            const newAdmin = {
              id: Math.floor(Math.random() * 1000) + 100,
              name: payload.name || 'Nuevo Administrador',
              email: payload.email,
              password: 'password',
              role: payload.role || 'admin_centro',
              centroId: payload.centroId ? parseInt(payload.centroId) : null,
              status: 'active',
              avatar: generateAvatarSvg(payload.name || 'Nuevo Administrador'),
              createdAt: new Date().toISOString(),
              savedResources: []
            };
            
            users.push(newAdmin);
            saveMockUsers(users);
            mockData = newAdmin;
          } else if (method === 'patch') {
            const parts = url.split('/');
            const idPart = parts.find(p => !isNaN(parseInt(p)));
            const id = idPart ? parseInt(idPart) : null;
            
            const userIdx = users.findIndex(u => u && u.id === id);
            if (userIdx === -1) {
              throw {
                __isMockResponse: true,
                response: {
                  status: 404,
                  data: { message: 'Usuario no encontrado.' },
                  config
                }
              };
            }
            
            const payload = getRequestData(config);
            const updated = {
              ...users[userIdx],
              ...payload
            };
            
            if (payload.centroId) updated.centroId = parseInt(payload.centroId);
            
            users[userIdx] = updated;
            saveMockUsers(users);
            mockData = updated;
          } else if (method === 'delete') {
            const parts = url.split('/');
            const idPart = parts.find(p => !isNaN(parseInt(p)));
            const id = idPart ? parseInt(idPart) : null;
            
            const userIdx = users.findIndex(u => u && u.id === id);
            if (userIdx === -1) {
              throw {
                __isMockResponse: true,
                response: {
                  status: 404,
                  data: { message: 'Usuario no encontrado.' },
                  config
                }
              };
            }
            
            users.splice(userIdx, 1);
            saveMockUsers(users);
            mockData = { success: true };
          }
        } else if (url.includes('/children')) {
          const children = getMockChildren();
          const method = config.method ? config.method.toLowerCase() : 'get';
          
          if (url.includes('/link')) {
            // POST /children/link
            const payload = getRequestData(config);
            const inviteCode = (payload.inviteCode || '').trim().toUpperCase();
            const parentId = parseInt(payload.parentId);
            
            const childIdx = children.findIndex(c => c.inviteCode.toUpperCase() === inviteCode);
            if (childIdx === -1) {
              throw {
                __isMockResponse: true,
                response: {
                  status: 404,
                  data: { message: 'Código de invitación no válido o inexistente.' },
                  config
                }
              };
            }
            
            const child = children[childIdx];
            if (!child.parentIds) child.parentIds = [];
            if (!child.parentIds.includes(parentId)) {
              child.parentIds.push(parentId);
              children[childIdx] = child;
              saveMockChildren(children);
            }
            mockData = { success: true, child };
          } else if (url.includes('/sessions')) {
            // GET /children/:id/sessions or POST /children/:id/sessions
            const parts = url.split('/');
            const childIdIdx = parts.indexOf('children') + 1;
            const childId = childIdIdx > 0 ? parseInt(parts[childIdIdx]) : null;
            
            if (method === 'get') {
              const sessions = getMockSessions();
              mockData = sessions.filter(s => s.ninoId === childId).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            } else if (method === 'post') {
              const payload = getRequestData(config);
              const sessions = getMockSessions();
              const newSession = {
                id: Math.floor(Math.random() * 1000) + 100,
                ninoId: childId,
                profesionalId: payload.profesionalId ? parseInt(payload.profesionalId) : null,
                profesionalName: payload.profesionalName || 'Profesional de Apoyo',
                fecha: payload.fecha || new Date().toISOString().split('T')[0],
                duracion: parseInt(payload.duracion) || 45,
                tipo: payload.tipo || 'Sesión terapéutica',
                objetivos: payload.objetivos || [],
                observaciones: payload.observaciones || ''
              };
              sessions.push(newSession);
              saveMockSessions(sessions);
              mockData = newSession;
            }
          } else if (url.includes('/progress')) {
            // PATCH /children/:id/progress
            const parts = url.split('/');
            const childIdIdx = parts.indexOf('children') + 1;
            const childId = childIdIdx > 0 ? parseInt(parts[childIdIdx]) : null;
            
            const childIdx = children.findIndex(c => c.id === childId);
            if (childIdx === -1) {
              throw {
                __isMockResponse: true,
                response: {
                  status: 404,
                  data: { message: 'Niño no encontrado.' },
                  config
                }
              };
            }
            
            const payload = getRequestData(config);
            const child = children[childIdx];
            
            const progressEntry = {
              date: new Date().toISOString(),
              comunicacion: parseInt(payload.comunicacion),
              social: parseInt(payload.social),
              cognitivo: parseInt(payload.cognitivo),
              motor: parseInt(payload.motor),
              autonomia: parseInt(payload.autonomia)
            };
            
            if (!child.progressHistory) child.progressHistory = [];
            child.progressHistory.push(progressEntry);
            child.progress = {
              comunicacion: progressEntry.comunicacion,
              social: progressEntry.social,
              cognitivo: progressEntry.cognitivo,
              motor: progressEntry.motor,
              autonomia: progressEntry.autonomia
            };
            
            children[childIdx] = child;
            saveMockChildren(children);
            mockData = child;
          } else {
            // GET /children or GET /children/:id or POST /children or PATCH /children/:id
            const parts = url.split('/');
            const lastPart = parts[parts.length - 1];
            const hasId = !isNaN(parseInt(lastPart));
            const childId = hasId ? parseInt(lastPart) : null;
            
            if (method === 'get') {
              if (hasId) {
                const child = children.find(c => c.id === childId);
                if (!child) {
                  throw {
                    __isMockResponse: true,
                    response: {
                      status: 404,
                      data: { message: 'Niño no encontrado.' },
                      config
                    }
                  };
                }
                mockData = child;
              } else {
                const params = config.params || {};
                let filtered = [...children];
                
                if (params.centroId) {
                  filtered = filtered.filter(c => c.centroId === parseInt(params.centroId));
                }
                if (params.profesionalId) {
                  filtered = filtered.filter(c => c.profesionalId === parseInt(params.profesionalId));
                }
                if (params.parentId) {
                  filtered = filtered.filter(c => c.parentIds && c.parentIds.includes(parseInt(params.parentId)));
                }
                mockData = filtered;
              }
            } else if (method === 'post') {
              const payload = getRequestData(config);
              const newChild = {
                id: Math.floor(Math.random() * 1000) + 100,
                name: payload.name,
                birthDate: payload.birthDate,
                diagnostico: payload.diagnostico || 'Sin diagnóstico',
                avatar: generateAvatarSvg(payload.name),
                centroId: parseInt(payload.centroId),
                profesionalId: payload.profesionalId ? parseInt(payload.profesionalId) : null,
                parentIds: [],
                inviteCode: `${payload.name.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
                createdAt: new Date().toISOString(),
                progress: {
                  comunicacion: 5,
                  social: 5,
                  cognitivo: 5,
                  motor: 5,
                  autonomia: 5
                },
                progressHistory: [
                  {
                    date: new Date().toISOString(),
                    comunicacion: 5,
                    social: 5,
                    cognitivo: 5,
                    motor: 5,
                    autonomia: 5
                  }
                ]
              };
              children.push(newChild);
              saveMockChildren(children);
              mockData = newChild;
            } else if (method === 'patch') {
              const childIdx = children.findIndex(c => c.id === childId);
              if (childIdx === -1) {
                throw {
                  __isMockResponse: true,
                  response: {
                    status: 404,
                    data: { message: 'Niño no encontrado.' },
                    config
                  }
                };
              }
              
              const payload = getRequestData(config);
              const updated = {
                ...children[childIdx],
                ...payload
              };
              if (payload.centroId) updated.centroId = parseInt(payload.centroId);
              if (payload.profesionalId !== undefined) {
                updated.profesionalId = payload.profesionalId ? parseInt(payload.profesionalId) : null;
              }
              
              children[childIdx] = updated;
              saveMockChildren(children);
              mockData = updated;
            }
          }
        }

        // Interrumpimos la llamada real lanzando la simulación
        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: mockData,
            statusText: 'OK',
            headers: {},
            config,
          },
        };
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Capturar la excepción de simulación y transformarla en una resolución de éxito (200)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.__isMockResponse) {
        if (error.response.status >= 200 && error.response.status < 300) {
          if (error.response.data) {
            error.response.data = JSON.parse(JSON.stringify(error.response.data));
          }
          return Promise.resolve(error.response);
        } else {
          return Promise.reject(error.response);
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
