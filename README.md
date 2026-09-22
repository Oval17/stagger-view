# Staggered Image Loader

A React TypeScript application that demonstrates advanced image loading with service worker caching and staggered loading techniques.

## PWA

Installable: `manifest.json` + icons (`public/icons/`) are copied to `dist/` by
`npm run copy-assets`, precached by the service worker, and an in-app
**Install app** button appears when the browser fires `beforeinstallprompt`.

## Lighthouse (local `dist` build, Lighthouse 13, 2026-09-22)

| Performance | Accessibility | Best practices | SEO |
|---|---|---|---|
| 80 | 96 | 96 | 100 |

LCP 4.8s / TBT 70ms / CLS 0.091 — LCP is the remote Picsum image itself
(first paint 0.6s, JS bundle 178KB); offline + caching behavior unchanged.

## Features

- **Service Worker Integration**: Handles image caching and preloading in the background
- **Staggered Loading**: Preloads current position ± 5 images for smooth navigation
- **Cache Management**: Automatically cleans up old images to maintain optimal performance
- **Class-based Architecture**: Uses React class components and TypeScript classes
- **Webpack Build System**: Custom webpack configuration for both React app and service worker
- **Modern UI**: Beautiful, responsive design with gradient backgrounds and smooth animations

## Technology Stack

- **React 18** with TypeScript
- **Service Worker** for background caching
- **Webpack 5** for building both app and service worker
- **CSS3** with modern animations and responsive design
- **Picsum Photos API** for high-quality test images

## Project Structure

```
src/
├── components/
│   ├── ImageViewer.tsx      # Main image viewer component
│   └── ImageViewer.css      # Component styles
├── cache/
│   └── ImageCache.ts        # Cache management class
├── serviceWorker/
│   ├── ServiceWorker.ts     # Service worker implementation
│   └── register.ts          # Service worker registration
├── services/
│   └── ImageService.ts      # Image URL management
├── App.tsx                  # Main app component
├── App.css                  # Global styles
└── main.tsx                 # Application entry point
```

## Key Features

### 1. Staggered Loading
- Preloads 5 images before and after the current position
- Maintains smooth navigation experience
- Automatically cleans up images outside the ±5 range

### 2. Service Worker Caching
- Intercepts image requests
- Caches images for offline access
- Handles cache cleanup and management

### 3. Class-based Architecture
- `ImageCache`: Manages browser cache operations
- `ServiceWorkerManager`: Handles service worker communication
- `ImageService`: Manages image URLs and ranges
- `ImageViewer`: Main React component using class lifecycle

### 4. Modern UI/UX
- Gradient backgrounds with glassmorphism effects
- Smooth animations and transitions
- Responsive design for mobile devices
- Loading states and error handling

## Installation & Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run dev
   ```
   This will start the development server at `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   ```
   This builds both the React app and service worker

4. **Build Service Worker Only**
   ```bash
   npm run build-sw
   ```

5. **Linting**
   ```bash
   npm run lint
   ```

## Build for Netlify

The project is configured for easy deployment to Netlify:

1. Build the project: `npm run build`
2. The `dist` folder contains the production build
3. Drag and drop the `dist` folder to Netlify for deployment

## How It Works

### Image Loading Flow
1. User navigates to an image
2. Component checks cache for the image
3. If cached, displays immediately
4. If not cached, loads from network and caches it
5. Preloads ±5 images in the background
6. Cleans up old cached images

### Service Worker Communication
- Main thread sends messages to service worker for caching operations
- Service worker intercepts image requests and serves from cache when available
- Automatic cache cleanup based on current position

### Cache Strategy
- **Current ± 5**: Keeps 11 images in cache (current + 5 before + 5 after)
- **Minimum**: Always keeps at least the first image (index 0)
- **Cleanup**: Removes images outside the ±5 range to save memory

## Performance Features

- **Lazy Loading**: Images are loaded only when needed
- **Preloading**: Next/previous images are cached in advance
- **Memory Management**: Automatic cleanup prevents memory bloat
- **Offline Support**: Cached images work without internet connection

## Browser Support

- Modern browsers with Service Worker support
- Chrome, Firefox, Safari, Edge
- Mobile browsers with PWA capabilities

## License

MIT License - see LICENSE file for details
