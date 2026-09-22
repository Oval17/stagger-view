export interface CachedImage {
  url: string;
  data: ArrayBuffer;
  timestamp: number;
}

export class ImageCache {
  private readonly cacheName: string = 'image-cache-v1';

  constructor() {
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const keys = await cache.keys();
        console.log(`Initialized cache with ${keys.length} items`);
      } catch (error) {
        console.error('Failed to initialize cache:', error);
      }
    }
  }

  public async cacheImage(url: string): Promise<void> {
    if (!('caches' in window)) {
      console.warn('Cache API not supported');
      return;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const response = await fetch(url);
      
      if (response.ok) {
        await cache.put(url, response.clone());
        console.log(`Cached image: ${url}`);
      }
    } catch (error) {
      console.error(`Failed to cache image ${url}:`, error);
    }
  }

  public async getCachedImage(url: string): Promise<Response | null> {
    if (!('caches' in window)) {
      return null;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      return response || null;
    } catch (error) {
      console.error(`Failed to get cached image ${url}:`, error);
      return null;
    }
  }

  public async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.cacheImage(url));
    await Promise.allSettled(promises);
  }

  public async cleanupUrls(keepUrls: string[]): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      const keep = new Set(keepUrls);

      for (const request of keys) {
        if (!keep.has(request.url)) {
          await cache.delete(request);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  public async cleanupCache(currentIndex: number, totalImages: number): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      
      // Calculate which images to keep (current ± 5)
      const keepStart = Math.max(0, currentIndex - 5);
      const keepEnd = Math.min(totalImages - 1, currentIndex + 5);
      
      const urlsToKeep = new Set<string>();
      for (let i = keepStart; i <= keepEnd; i++) {
        // This would need to be adapted based on your image URL pattern
        urlsToKeep.add(`https://picsum.photos/800/600?random=${i}`);
      }

      // Remove images that are not in the keep range
      for (const request of keys) {
        if (!urlsToKeep.has(request.url)) {
          await cache.delete(request);
          console.log(`Removed from cache: ${request.url}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  public async getCacheSize(): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      return keys.length;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  public async clearCache(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      await caches.delete(this.cacheName);
      console.log('Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
} 