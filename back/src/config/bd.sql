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
  cantidad DECIMAL(10, 3) NOT NULL,
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
INSERT INTO categoria (nombre)
VALUES ('Alimentos'),
  ('Bebidas'),
  ('Limpieza'),
  ('Snacks'),
  ('Productos Frescos');
-- Insertar productos con precios ajustados en pesos y códigos de barras secuenciales
INSERT INTO productos (
    id_categoria,
    nombre_producto,
    precio_compra,
    precio_venta,
    codigo_barras,
    stock
  )
VALUES -- Categoría: Alimentos
  (1, 'Arroz 1kg', 1180.00, 1770.00, '1', 300),
  (1, 'Harina 1kg', 944.00, 1416.00, '2', 250),
  (1, 'Azúcar 1kg', 1062.00, 1590.00, '3', 200),
  (1, 'Fideos 500g', 826.00, 1239.00, '4', 350),
  -- Categoría: Bebidas
  (2, 'Coca-Cola 2L', 1770.00, 2655.00, '5', 180),
  (2, 'Agua Mineral 1.5L', 590.00, 885.00, '6', 250),
  (
    2,
    'Jugo de Naranja 1L',
    1416.00,
    2124.00,
    '7',
    150
  ),
  -- Categoría: Limpieza
  (3, 'Detergente 1L', 1770.00, 2655.00, '8', 200),
  (
    3,
    'Jabón en Barra 200g',
    472.00,
    708.00,
    '9',
    250
  ),
  (
    3,
    'Desinfectante 1L',
    1416.00,
    2124.00,
    '10',
    180
  ),
  -- Categoría: Snacks
  (
    4,
    'Galletitas 400g',
    1180.00,
    1770.00,
    '11',
    200
  ),
  (
    4,
    'Chocolinas 300g',
    1416.00,
    2124.00,
    '12',
    150
  ),
  (
    4,
    'Papa Frita 200g',
    1180.00,
    1770.00,
    '13',
    300
  ),
  -- Categoría: Productos Frescos
  (5, 'Lechuga (unidad)', 590.00, 885.00, '14', 100),
  (5, 'Tomate (kg)', 1770.00, 2655.00, '15', 120),
  (
    5,
    'Pechuga de Pollo (kg)',
    4130.00,
    6195.00,
    '16',
    90
  ),
  (5, 'Pescado (kg)', 4720.00, 7080.00, '17', 60);