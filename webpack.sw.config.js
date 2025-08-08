const path = require('path');

module.exports = {
  entry: './src/serviceWorker/ServiceWorker.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'service-worker.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  target: 'webworker',
}; 