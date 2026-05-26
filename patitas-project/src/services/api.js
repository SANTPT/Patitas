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
            image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80",
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
            image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
            author: "Lic. Marcos Rivas",
            readTime: "7 min",
            content: "Identificar las señales de alerta de manera temprana marca una gran diferencia. En este artículo detallamos qué conductas observar en áreas como la comunicación social (ausencia de contacto visual directo, no responder al nombre), la flexibilidad conductual (patrones de interés muy específicos) y el procesamiento sensorial (reacciones inusuales a sonidos o texturas)."
          },
          {
            id: 3,
            title: "Importancia de la rutina diaria",
            category: "articulos",
            description: "Cómo estructurar el día a día para brindar seguridad y previsibilidad a los más pequeños mediante apoyos visuales.",
            image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
            author: "Terapeuta Sofía Vega",
            readTime: "4 min",
            content: "Para un niño con autismo, el mundo puede parecer un lugar caótico y difícil de predecir. Las rutinas estructuradas reducen la ansiedad proporcionando un marco seguro y predecible. Explicamos cómo utilizar agendas visuales con pictogramas para transiciones diarias como levantarse, ir al colegio, comer y la hora de dormir."
          },
          {
            id: 4,
            title: "Mitos y realidades sobre el TEA",
            category: "articulos",
            description: "Desmitificando conceptos erróneos comunes en la sociedad para promover una verdadera inclusión y respeto.",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
            author: "Dr. Alberto Sanz",
            readTime: "6 min",
            content: "Existen numerosas falsas creencias sobre el autismo que dificultan la inclusión de los niños. Desmentimos los mitos más dañinos (como que no sienten empatía o que viven en su propio mundo) y exponemos realidades basadas en la neurodiversidad y en la evidencia científica actual."
          },
          {
            id: 5,
            title: "Guía de Atención Temprana: Primeros pasos tras el diagnóstico",
            category: "guias",
            description: "Pasos concretos tras el diagnóstico: terapias, centros de apoyo, derechos de tu hijo y cómo comenzar hoy mismo.",
            image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80",
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
            image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80",
            author: "Lic. Laura Benítez",
            readTime: "Guía PDF (18 pág.)",
            content: "Muchos retos conductuales en niños autistas tienen su origen en una sobrecarga sensorial. Esta guía te enseña a identificar si tu hijo presenta hiper o hiporreactividad sensorial en el tacto, oído, vista, propiocepción o sistema vestibular, proporcionando adaptaciones domésticas de bajo costo."
          },
          {
            id: 7,
            title: "Guía de derechos y escolarización inclusiva",
            category: "guias",
            description: "Información legal y administrativa clara sobre el marco legal y apoyos escolares para niños con necesidades especiales.",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
            author: "Red de Abogados por la Inclusión",
            readTime: "Guía PDF (15 pág.)",
            content: "Navegar el sistema educativo puede resultar abrumador. En este documento se compilan los pasos administrativos para solicitar adaptaciones curriculares, personal de apoyo (como auxiliares) y los derechos legales fundamentales que asisten a tu hijo en centros educativos públicos y concertados."
          },
          {
            id: 8,
            title: "Guía de juego adaptado por etapas",
            category: "guias",
            description: "Ideas de juguetes, adaptaciones sencillas y dinámicas estructuradas que favorecen el desarrollo cognitivo y social.",
            image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
            author: "Terapeuta Ocupacional Andrea Caro",
            readTime: "Guía PDF (10 pág.)",
            content: "El juego es el trabajo del niño. Sin embargo, los niños dentro del espectro pueden jugar de formas diferentes o repetitivas. Esta guía ofrece metodologías prácticas para introducir la reciprocidad en el juego, estructurar turnos y elegir los juguetes más idóneos según la etapa evolutiva del niño."
          },
          {
            id: 9,
            title: "Video: Técnicas de regulación emocional y sensorial",
            category: "videos",
            description: "Aprende estrategias visuales y ejercicios prácticos explicados en video por terapeutas ocupacionales.",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
            author: "Patitas TV",
            readTime: "Duración: 15 min",
            content: "En este video demostrativo de 15 minutos, nuestra terapeuta ocupacional comparte tres dinámicas corporales y el uso de la 'caja de la calma' para gestionar las crisis de sobrecarga sensorial o desregulación emocional de manera respetuosa y efectiva en el hogar."
          },
          {
            id: 10,
            title: "Video: Historias sociales en formato animado",
            category: "videos",
            description: "Una útil herramienta audiovisual animada para ayudar a los niños a comprender y transitar situaciones cotidianas.",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
            author: "Canal Inclusivo",
            readTime: "Duración: 8 min",
            content: "Las historias sociales son relatos cortos diseñados para enseñar comportamientos y normas sociales en situaciones específicas. Este video animado contiene tres historias sociales diseñadas para facilitar las visitas al dentista, los cortes de cabello y el compartir juguetes en el parque."
          },
          {
            id: 11,
            title: "Video: Testimonios de familias que inspiran",
            category: "videos",
            description: "Entrevistas emotivas donde madres y padres comparten sus caminos, aprendizajes y momentos de orgullo.",
            image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
            author: "Fundación Familias TEA",
            readTime: "Duración: 25 min",
            content: "Un espacio de conversación honesta y empática. Tres familias nos abren sus puertas para narrar sus experiencias tras el diagnóstico inicial, cómo se adaptaron a las nuevas dinámicas del hogar y cuáles son sus mayores alegrías en el desarrollo diario de sus hijos."
          },
          {
            id: 12,
            title: "Centro de Terapia Integral Patitas",
            category: "centros",
            description: "Servicios especializados en psicología infantil, fonoaudiología, psicomotricidad y terapia ocupacional enfocada en la familia.",
            image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
            author: "Madrid, España",
            readTime: "Centro de Apoyo",
            content: "Ubicado en el corazón de la ciudad, el Centro Patitas es una institución líder dedicada al acompañamiento interdisciplinario de niños y adolescentes con condiciones del neurodesarrollo. Contamos con salas de integración sensorial equipadas y un equipo altamente especializado."
          },
          {
            id: 13,
            title: "Clínica de Neurodesarrollo y Aprendizaje",
            category: "centros",
            description: "Centro médico especializado en evaluaciones diagnósticas tempranas y programas individualizados de intervención.",
            image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80",
            author: "Barcelona, España",
            readTime: "Centro Médico",
            content: "Nuestra clínica ofrece un enfoque médico y neuropsicológico de primer nivel. Nos especializamos en la aplicación de herramientas diagnósticas estandarizadas (como ADOS-2 y ADIR) y en el diseño de planes terapéuticos personalizados basados en la evidencia científica."
          },
          {
            id: 14,
            title: "Centro Educativo Especial Arcoiris",
            category: "centros",
            description: "Espacio de escolarización inclusiva y educación especial enfocado en potenciar autonomía y destrezas adaptativas.",
            image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80",
            author: "Sevilla, España",
            readTime: "Centro Educativo",
            content: "Arcoiris es un colegio de educación especial que trabaja codo a codo con las escuelas ordinarias. Nuestro modelo pedagógico prioriza la comunicación alternativa y aumentativa (SAAC), la autorregulación sensorial y el desarrollo de habilidades sociolaborales básicas."
          },
          {
            id: 15,
            title: "Asociación de Apoyo Familiar Tejiendo Redes",
            category: "centros",
            description: "Grupos de ayuda mutua, talleres de capacitación para padres y actividades de ocio inclusivo de fin de semana.",
            image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
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
