export class ImageService {
  private readonly baseUrl = 'https://picsum.photos';
  private readonly imageCount = 20; // Total number of images
  private readonly imageSize = '800/600';

  constructor() {}

  getImageUrl(index: number): string {
    if (index < 0 || index >= this.imageCount) {
      throw new Error(`Invalid image index: ${index}`);
    }
    return `${this.baseUrl}/${this.imageSize}?random=${index}`;
  }

  getTotalImageCount(): number {
    return this.imageCount;
  }

  getImageUrlsForRange(startIndex: number, endIndex: number): string[] {
    const urls: string[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < this.imageCount) {
        urls.push(this.getImageUrl(i));
      }
    }
    return urls;
  }

  getPreloadUrls(currentIndex: number): string[] {
    const startIndex = Math.max(0, currentIndex - 5);
    const endIndex = Math.min(this.imageCount - 1, currentIndex + 5);
    return this.getImageUrlsForRange(startIndex, endIndex);
  }

  getCleanupUrls(currentIndex: number): string[] {
    const keepStart = Math.max(0, currentIndex - 5);
    const keepEnd = Math.min(this.imageCount - 1, currentIndex + 5);
    
    const urlsToRemove: string[] = [];
    for (let i = 0; i < this.imageCount; i++) {
      if (i < keepStart || i > keepEnd) {
        urlsToRemove.push(this.getImageUrl(i));
      }
    }
    return urlsToRemove;
  }

  isValidIndex(index: number): boolean {
    return index >= 0 && index < this.imageCount;
  }
} 