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
let mockPosts = [
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

if (isMockEnabled) {
  api.interceptors.request.use(
    async (config) => {
      const url = config.url || '';

      // Interceptamos recursos
      if (url.includes('/recursos')) {
        await new Promise((resolve) => setTimeout(resolve, 800));

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
        await new Promise((resolve) => setTimeout(resolve, 800));

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

      // Interceptamos posts de la comunidad
      if (url.includes('/posts')) {
        await new Promise((resolve) => setTimeout(resolve, 600));

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
            const { content } = JSON.parse(config.data || '{}');
            let savedUser = null;
            try {
              savedUser = JSON.parse(localStorage.getItem('patitas_user') || 'null');
            } catch (_) {}

            const newComment = {
              id: post.comments.length + 1,
              author: savedUser || {
                name: 'Padre Demo',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                role: 'Padre Demo'
              },
              content: content || '',
              createdAt: new Date().toISOString()
            };

            post.comments.push(newComment);
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
          const { title, content, category } = JSON.parse(config.data || '{}');
          let savedUser = null;
          try {
            savedUser = JSON.parse(localStorage.getItem('patitas_user') || 'null');
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
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              role: 'Padre Demo'
            },
            comments: []
          };

          mockPosts.unshift(newPost);
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

      // Interceptamos rutas de autenticación
      if (url.includes('/auth/')) {
        // Retraso de red simulado para una UX realista (spinners, loaders, etc.)
        await new Promise((resolve) => setTimeout(resolve, 800));

        let mockData = {};

        if (url.endsWith('/login')) {
          const { email } = JSON.parse(config.data || '{}');
          mockData = {
            token: `mock-jwt-token-login-${Date.now()}`,
            user: {
              id: 1,
              name: 'Padre Demo',
              email: email || 'demo@example.com',
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          };
        } else if (url.endsWith('/register')) {
          const { name, email } = JSON.parse(config.data || '{}');
          mockData = {
            token: `mock-jwt-token-register-${Date.now()}`,
            user: {
              id: Math.floor(Math.random() * 1000) + 10,
              name: name || 'Usuario Registrado',
              email: email || 'nuevo@example.com',
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          };
        } else if (url.includes('/oauth')) {
          const { provider, email } = JSON.parse(config.data || '{}');
          const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Social';
          mockData = {
            token: `mock-jwt-token-oauth-${provider}-${Date.now()}`,
            user: {
              id: Math.floor(Math.random() * 1000) + 10,
              name: `${providerName} Demo`,
              email: email || `${provider}-user@example.com`,
              role: 'user',
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
            savedUser = JSON.parse(localStorage.getItem('patitas_user') || 'null');
          } catch (_) {}

          mockData = {
            user: savedUser || {
              id: 1,
              name: 'Padre Demo',
              email: 'demo@example.com',
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          };
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
        if (error.response.status === 200) {
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