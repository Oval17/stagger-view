import { Component } from 'react';
import { ImageService } from '../services/ImageService';
import { ServiceWorkerManager } from '../serviceWorker/register';
import { ImageCache } from '../cache/ImageCache';
import './ImageViewer.css';

interface ImageViewerState {
  currentIndex: number;
  currentImageUrl: string;
  isLoading: boolean;
  error: string | null;
  cacheSize: number;
}

export class ImageViewer extends Component<{}, ImageViewerState> {
  private imageService: ImageService;
  private swManager: ServiceWorkerManager;
  private imageCache: ImageCache;

  constructor(props: {}) {
    super(props);
    
    this.imageService = new ImageService();
    this.swManager = new ServiceWorkerManager();
    this.imageCache = new ImageCache();

    this.state = {
      currentIndex: 0,
      currentImageUrl: '',
      isLoading: true,
      error: null,
      cacheSize: 0
    };
  }

  async componentDidMount(): Promise<void> {
    await this.initializeServiceWorker();
    await this.loadImage(0);
    this.updateCacheSize();
  }

  private async initializeServiceWorker(): Promise<void> {
    const success = await this.swManager.register();
    if (success) {
      console.log('Service Worker initialized successfully');
    }
  }

  private async loadImage(index: number): Promise<void> {
    if (!this.imageService.isValidIndex(index)) {
      this.setState({ error: 'Invalid image index' });
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const imageUrl = this.imageService.getImageUrl(index);
      
      // Try to get from cache first
      const cachedResponse = await this.imageCache.getCachedImage(imageUrl);
      
      if (cachedResponse) {
        console.log('Image loaded from cache');
        this.setState({
          currentIndex: index,
          currentImageUrl: imageUrl,
          isLoading: false
        });
      } else {
        // Load from network
        console.log('Loading image from network');
        this.setState({
          currentIndex: index,
          currentImageUrl: imageUrl,
          isLoading: false
        });
      }

      // Preload next images
      await this.preloadImages(index);
      
      // Cleanup old images
      await this.cleanupCache(index);

    } catch (error) {
      console.error('Failed to load image:', error);
      this.setState({ 
        error: 'Failed to load image',
        isLoading: false 
      });
    }
  }

  private async preloadImages(currentIndex: number): Promise<void> {
    const preloadUrls = this.imageService.getPreloadUrls(currentIndex);
    
    // Preload in service worker
    if (this.swManager.isReady()) {
      await this.swManager.preloadImages(preloadUrls);
    }
    
    // Also preload in main thread cache
    await this.imageCache.preloadImages(preloadUrls);
  }

  private async cleanupCache(currentIndex: number): Promise<void> {
    const totalImages = this.imageService.getTotalImageCount();
    
    // Cleanup in service worker
    if (this.swManager.isReady()) {
      await this.swManager.cleanupCache(currentIndex, totalImages);
    }
    
    // Cleanup in main thread cache
    await this.imageCache.cleanupCache(currentIndex, totalImages);
    
    this.updateCacheSize();
  }

  private async updateCacheSize(): Promise<void> {
    const size = await this.imageCache.getCacheSize();
    this.setState({ cacheSize: size });
  }

  private handlePrevious = async (): Promise<void> => {
    const newIndex = Math.max(0, this.state.currentIndex - 1);
    if (newIndex !== this.state.currentIndex) {
      await this.loadImage(newIndex);
    }
  };

  private handleNext = async (): Promise<void> => {
    const newIndex = Math.min(
      this.imageService.getTotalImageCount() - 1,
      this.state.currentIndex + 1
    );
    if (newIndex !== this.state.currentIndex) {
      await this.loadImage(newIndex);
    }
  };

  private handleClearCache = async (): Promise<void> => {
    await this.imageCache.clearCache();
    this.updateCacheSize();
  };

  render(): JSX.Element {
    const { currentIndex, currentImageUrl, isLoading, error, cacheSize } = this.state;
    const totalImages = this.imageService.getTotalImageCount();

    return (
      <div className="image-viewer">
        <div className="image-viewer-header">
          <h1>Staggered Image Loader</h1>
          <div className="image-info">
            <span>Image {currentIndex + 1} of {totalImages}</span>
            <span>Cache: {cacheSize} images</span>
          </div>
        </div>

        <div className="image-container">
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading image...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && currentImageUrl && (
            <img
              src={currentImageUrl}
              alt={`Image ${currentIndex + 1}`}
              className="current-image"
              onLoad={() => this.setState({ isLoading: false })}
              onError={() => this.setState({ 
                error: 'Failed to load image',
                isLoading: false 
              })}
            />
          )}
        </div>

        <div className="controls">
          <button
            onClick={this.handlePrevious}
            disabled={currentIndex === 0 || isLoading}
            className="nav-button prev-button"
          >
            ← Previous
          </button>

          <button
            onClick={this.handleNext}
            disabled={currentIndex === totalImages - 1 || isLoading}
            className="nav-button next-button"
          >
            Next →
          </button>
        </div>

        <div className="cache-controls">
          <button
            onClick={this.handleClearCache}
            className="clear-cache-button"
          >
            Clear Cache
          </button>
        </div>

        <div className="status">
          <p>Service Worker: {this.swManager.isReady() ? 'Ready' : 'Not Ready'}</p>
          <p>Current Index: {currentIndex}</p>
          <p>Cache Size: {cacheSize} images</p>
        </div>
      </div>
    );
  }
}
