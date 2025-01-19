CREATE USER IF NOT EXISTS 'negocio' @'localhost' IDENTIFIED BY 'negocio';
GRANT ALL PRIVILEGES ON *.* TO 'negocio' @'localhost' WITH
GRANT OPTION;
FLUSH PRIVILEGES;
DROP DATABASE IF EXISTS negocio;
CREATE DATABASE IF NOT EXISTS negocio;
USE negocio;
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL
);
CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT,
  nombre_producto VARCHAR(100) NOT NULL,
  precio_compra DECIMAL(10, 2),
  precio_venta DECIMAL(10, 2),
  codigo_barras VARCHAR(20) UNIQUE,
  stock INT,
  FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);
CREATE TABLE ventas (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2) NOT NULL,
  monto_extra DECIMAL(10, 2),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
CREATE TABLE detalle_venta (
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad DECIMAL(10, 3) NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_venta, id_producto),
  FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
INSERT INTO usuarios (
    id_usuario,
    nombre,
    apellido,
    username,
    contrasena
  )
VALUES (
    1,
    'a',
    'a',
    'a',
    '$2b$10$EQX/UvNEf34aP.cPci9i6uYHDMbFV.AmocH5vl/kwIjft1phT24sS'
  );