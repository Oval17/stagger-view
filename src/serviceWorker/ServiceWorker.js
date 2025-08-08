const CACHE_NAME = 'staggered-image-cache-v1';
const IMAGE_CACHE_NAME = 'image-cache-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker cache opened');
      return cache.addAll([
        '/',
        '/index.html',
        '/bundle.js'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle image requests
  if (url.pathname.includes('picsum.photos') || event.request.destination === 'image') {
    event.respondWith(handleImageRequest(event.request));
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

async function handleImageRequest(request) {
  const imageCache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await imageCache.match(request);
  
  if (cachedResponse) {
    console.log('Serving cached image:', request.url);
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      imageCache.put(request, responseClone);
      console.log('Cached new image:', request.url);
    }
    return response;
  } catch (error) {
    console.error('Failed to fetch image:', request.url, error);
    throw error;
  }
}

self.addEventListener('message', (event) => {
  const message = event.data;
  
  switch (message.type) {
    case 'CACHE_IMAGE':
      if (message.url) {
        cacheImage(message.url);
      }
      break;
      
    case 'PRELOAD_IMAGES':
      if (message.urls) {
        preloadImages(message.urls);
      }
      break;
      
    case 'CLEANUP_CACHE':
      if (message.currentIndex !== undefined && message.totalImages !== undefined) {
        cleanupCache(message.currentIndex, message.totalImages);
      }
      break;
  }
});

async function cacheImage(url) {
  try {
    const imageCache = await caches.open(IMAGE_CACHE_NAME);
    const response = await fetch(url);
    
    if (response.ok) {
      await imageCache.put(url, response.clone());
      console.log('Service Worker cached image:', url);
    }
  } catch (error) {
    console.error('Service Worker failed to cache image:', url, error);
  }
}

async function preloadImages(urls) {
  console.log('Service Worker preloading images:', urls.length);
  const promises = urls.map(url => cacheImage(url));
  await Promise.allSettled(promises);
}

async function cleanupCache(currentIndex, totalImages) {
  try {
    const imageCache = await caches.open(IMAGE_CACHE_NAME);
    const keys = await imageCache.keys();
    
    // Calculate which images to keep (current ± 5)
    const keepStart = Math.max(0, currentIndex - 5);
    const keepEnd = Math.min(totalImages - 1, currentIndex + 5);
    
    const urlsToKeep = new Set();
    for (let i = keepStart; i <= keepEnd; i++) {
      urlsToKeep.add(`https://picsum.photos/800/600?random=${i}`);
    }

    // Remove images that are not in the keep range
    for (const request of keys) {
      if (!urlsToKeep.has(request.url)) {
        await imageCache.delete(request);
        console.log('Service Worker removed from cache:', request.url);
      }
    }
  } catch (error) {
    console.error('Service Worker failed to cleanup cache:', error);
  }
} 