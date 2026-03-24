-- 1. CONFIGURACION INICIAL DEL USUARIO Y LA BASE DE DATOS
-- IMPORTANTE: en entornos de produccion elimina el DROP DATABASE.
DROP DATABASE IF EXISTS negocio;
CREATE DATABASE IF NOT EXISTS negocio CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE negocio;

CREATE USER IF NOT EXISTS 'negocio'@'localhost' IDENTIFIED BY 'negocio';
GRANT ALL PRIVILEGES ON negocio.* TO 'negocio'@'localhost';
FLUSH PRIVILEGES;

-- 2. TABLAS CATALOGO Y PADRE
CREATE TABLE negocios (
  id_negocio INT AUTO_INCREMENT PRIMARY KEY,
  nombre_negocio VARCHAR(100) NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_negocios_nombre (nombre_negocio)
) ENGINE = InnoDB;

CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL,
  UNIQUE KEY uk_roles_nombre (nombre_rol)
) ENGINE = InnoDB;

-- Insertamos los roles, incluyendo el Superadmin
INSERT INTO roles (id_rol, nombre_rol)
VALUES (1, 'Administrador'),
       (2, 'Empleado'),
       (3, 'Superadmin'); -- ROL GLOBAL AGREGADO

-- 3. TABLA DE USUARIOS
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_negocio INT NULL, -- CAMBIO CLAVE: Permite NULL para el Superadmin
  id_rol INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT chk_usuarios_estado CHECK (estado IN (0, 1)),
  UNIQUE KEY uk_usuarios_username (username),
  UNIQUE KEY uk_usuarios_negocio_idusuario (id_negocio, id_usuario),
  KEY idx_usuarios_negocio_estado (id_negocio, estado),
  CONSTRAINT fk_usuarios_negocio FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- 4. TABLAS DE INVENTARIO (Aisladas por negocio)
CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  id_negocio INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  UNIQUE KEY uk_categoria_negocio_nombre (id_negocio, nombre),
  UNIQUE KEY uk_categoria_negocio_idcategoria (id_negocio, id_categoria),
  CONSTRAINT fk_categoria_negocio FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_negocio INT NOT NULL,
  id_categoria INT,
  nombre_producto VARCHAR(100) NOT NULL,
  precio_compra DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  precio_venta DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  codigo_barras VARCHAR(20),
  stock INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_productos_precio_compra CHECK (precio_compra >= 0),
  CONSTRAINT chk_productos_precio_venta CHECK (precio_venta >= 0),
  CONSTRAINT chk_productos_stock CHECK (stock >= 0),
  UNIQUE KEY uk_productos_negocio_codigo (id_negocio, codigo_barras),
  UNIQUE KEY uk_productos_negocio_idproducto (id_negocio, id_producto),
  KEY idx_productos_negocio_nombre (id_negocio, nombre_producto),
  CONSTRAINT fk_productos_negocio FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (id_negocio, id_categoria) REFERENCES categoria(id_negocio, id_categoria) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB;

-- 5. TABLAS DE TRANSACCIONES (Ventas)
CREATE TABLE ventas (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_negocio INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2) NOT NULL,
  monto_extra DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  CONSTRAINT chk_ventas_total CHECK (total >= 0),
  CONSTRAINT chk_ventas_monto_extra CHECK (monto_extra >= 0),
  UNIQUE KEY uk_ventas_negocio_idventa (id_negocio, id_venta),
  KEY idx_ventas_negocio_fecha (id_negocio, fecha_venta),
  CONSTRAINT fk_ventas_negocio FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ventas_usuario_mismo_negocio FOREIGN KEY (id_negocio, id_usuario) REFERENCES usuarios(id_negocio, id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE detalle_venta (
  id_negocio INT NOT NULL,
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad DECIMAL(10, 3) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_precio_unitario CHECK (precio_unitario >= 0),
  PRIMARY KEY (id_negocio, id_venta, id_producto),
  KEY idx_detalle_negocio_producto (id_negocio, id_producto),
  CONSTRAINT fk_detalle_venta_mismo_negocio FOREIGN KEY (id_negocio, id_venta) REFERENCES ventas(id_negocio, id_venta) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto_mismo_negocio FOREIGN KEY (id_negocio, id_producto) REFERENCES productos(id_negocio, id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- 6. DATOS DE PRUEBA

-- A. Creamos el Superadmin de la plataforma (id_negocio es NULL)
INSERT INTO usuarios (
    id_negocio, id_rol, nombre, apellido, username, contrasena, estado
) VALUES (
    NULL, 
    3, 
    'Plataforma', 'Superadmin', 'superadmin', '$2b$10$EQX/UvNEf34aP.cPci9i6uYHDMbFV.AmocH5vl/kwIjft1phT24sS', 1
);

-- B. Creamos el primer negocio
INSERT INTO negocios (id_negocio, nombre_negocio)
VALUES (1, 'Mi Primer Kiosco');

-- C. Creamos el usuario Administrador para ese negocio
INSERT INTO usuarios (
    id_usuario, id_negocio, id_rol, nombre, apellido, username, contrasena, estado
) VALUES (
    2, 1, 1, 'Tomas', 'Admin', 'admin_kiosco', '$2b$10$EQX/UvNEf34aP.cPci9i6uYHDMbFV.AmocH5vl/kwIjft1phT24sS', 1
);