// 🚀 Service Worker Optimizado para La Nueva 5:40
// Versión: Incrementa este número cuando hagas cambios importantes
const VERSION = '3.0.0';
const CACHE_NAME = `radio-540-v${VERSION}`;
const CACHE_ASSETS = `radio-540-assets-v${VERSION}`;
const CACHE_IMAGES = `radio-540-images-v${VERSION}`;

// Assets críticos para caché (se descargan en la instalación)
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
];

// Rutas que NO deben cachearse (APIs externas, streams de audio)
const NO_CACHE_URLS = [
  'stream.zeno.fm',
  'cloudinary.com',
  'youtube.com',
  'googlevideo.com',
  'googleapis.com',
  'google/genai'
];

// 📥 INSTALACIÓN - Cachear assets críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v' + VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando assets críticos');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// 🔄 ACTIVACIÓN - Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker v' + VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Eliminar cachés que no coincidan con la versión actual
            return cacheName.startsWith('radio-540-') &&
              cacheName !== CACHE_NAME &&
              cacheName !== CACHE_ASSETS &&
              cacheName !== CACHE_IMAGES;
          })
          .map((cacheName) => {
            console.log('[SW] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim()) // Tomar control inmediatamente
  );
});

// 🌐 FETCH - Estrategia de caché inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ❌ No cachear URLs externas sensibles (streams, APIs)
  if (NO_CACHE_URLS.some(domain => url.href.includes(domain))) {
    return event.respondWith(fetch(request));
  }

  // 📁 Estrategia para assets estáticos (JS, CSS, fonts)
  if (request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, CACHE_ASSETS));
    return;
  }

  // 🖼️ Estrategia para imágenes
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, CACHE_IMAGES));
    return;
  }

  // 📄 Estrategia para navegación y documentos
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
    return;
  }

  // 🔄 Default: Network first, cache fallback
  event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

// 🎯 ESTRATEGIA: Cache First (para assets estáticos)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Solo cachear respuestas exitosas
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en cache-first:', error);
    // Si falla, intentar devolver algo del caché
    return caches.match(request);
  }
}

// 🌍 ESTRATEGIA: Network First (para contenido dinámico)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cachear respuesta exitosa
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network falló, usando caché:', error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no hay caché, devolver página offline básica
    return new Response('Sin conexión. Por favor revisa tu internet.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}