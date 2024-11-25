const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx', // Asegurate de que este archivo exista
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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Archivo base para el HTML
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Carpeta de archivos estáticos
    },
    port: 8080,
    hot: true,
    historyApiFallback: true, // Para manejar rutas en React
  },
};
