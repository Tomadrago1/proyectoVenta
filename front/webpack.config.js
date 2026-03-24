const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed || {};
const apiHost = env.API_HOST || '192.168.100.5';

module.exports = {
  mode: 'development',
  entry: './src/index.tsx', // Asegúrate de que este archivo exista
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i, // Regla para procesar archivos CSS
        use: ['style-loader', 'css-loader'], // Usa style-loader y css-loader
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __API_HOST__: JSON.stringify(apiHost),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html', // Archivo base para el HTML
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Carpeta de archivos estáticos
    },
    port: 8080,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' },
      },
    ],
    hot: true,
    historyApiFallback: true, // Para manejar rutas en React
  },
};