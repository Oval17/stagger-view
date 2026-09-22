const path = require('path');

module.exports = {
  // Single source: TypeScript SW. ServiceWorker.js (duplicate) was removed.
  entry: './src/serviceWorker/ServiceWorker.ts',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'service-worker.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript']
          }
        }
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'webworker',
}; 