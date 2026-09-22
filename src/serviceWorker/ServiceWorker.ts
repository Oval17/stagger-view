/// <reference lib="webworker" />

const CACHE_NAME = 'staggered-image-cache-v1';
const IMAGE_CACHE_NAME = 'image-cache-v1';

interface CacheMessage {
  type: 'CACHE_IMAGE' | 'GET_CACHED_IMAGE' | 'PRELOAD_IMAGES' | 'CLEANUP_CACHE';
  url?: string;
  urls?: string[];
  keepUrls?: string[];
}

(self as any).addEventListener('install', (event: any) => {
  (self as any).skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // NB: bundle filename may be hashed — precache only the stable
      // app-shell entries; hashed JS is cached on first fetch.
      .then((cache: any) =>
        cache.addAll([
          '/',
          '/index.html',
          '/bundle.js',
          '/manifest.json',
          '/icons/icon-192.png',
          '/icons/icon-512.png',
        ])
      )
      .catch((err: unknown) => console.warn('SW install: app-shell pre-cache failed (offline?)', err))
  );
});

(self as any).addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames: string[]) =>
        Promise.all(
          cacheNames.map((cacheName: string) => {
            if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => (self as any).clients?.claim())
  );
});

(self as any).addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  // Handle image requests (Picsum thumbs + generic images)
  if (url.hostname.includes('picsum.photos') || event.request.destination === 'image') {
    event.respondWith(handleImageRequest(event.request));
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request).then((response: any) => {
      return response || fetch(event.request);
    })
  );
});

async function handleImageRequest(request: Request): Promise<Response> {
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

(self as any).addEventListener('message', (event: any) => {
  const message: CacheMessage = event.data;

  switch (message.type) {
    case 'CACHE_IMAGE':
      if (message.url) {
        event.waitUntil(cacheImage(message.url));
      }
      break;

    case 'PRELOAD_IMAGES':
      if (message.urls) {
        event.waitUntil(preloadImages(message.urls));
      }
      break;

    case 'CLEANUP_CACHE':
      // Guard: old pages (pre keepUrls protocol) send no list — never wipe on undefined.
      if (!Array.isArray(message.keepUrls)) return;
      event.waitUntil(cleanupCache(message.keepUrls));
      break;
  }
});

async function cacheImage(url: string): Promise<void> {
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

async function preloadImages(urls: string[]): Promise<void> {
  console.log('Service Worker preloading images:', urls.length);
  const promises = urls.map(url => cacheImage(url));
  await Promise.allSettled(promises);
}

async function cleanupCache(keepUrls: string[]): Promise<void> {
  try {
    const imageCache = await caches.open(IMAGE_CACHE_NAME);
    const keys = await imageCache.keys();
    const keep = new Set<string>(keepUrls);

    for (const request of keys) {
      // Exact match: keepUrls come from the same ImageService generator,
      // so Cache API URLs and keep-list URLs share the same form.
      if (!keep.has(request.url)) {
        await imageCache.delete(request);
      }
    }
  } catch (error) {
    console.error('Service Worker failed to cleanup cache:', error);
  }
} 