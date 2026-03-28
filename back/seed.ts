import mysql from 'mysql2/promise';

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'negocio',
    password: 'negocio',
    database: 'negocio'
  });

  try {
    console.log('--- Iniciando Seeding de Datos ---');
    const idNegocio = 1;
    const idUsuario = 2;

    // 1. Insertar Categorias
    console.log('Insertando 5 categorias...');
    const categorias = ['Electrónica', 'Bebidas', 'Alimentos', 'Limpieza', 'Kiosko'];
    const categoriasIds: number[] = [];

    for (const cat of categorias) {
      // Usamos IGNORE por si ya existen
      const [result] = await connection.query(
        'INSERT IGNORE INTO categoria (id_negocio, nombre) VALUES (?, ?)',
        [idNegocio, cat]
      );
      const insertId = (result as any).insertId;
      if (insertId) {
        categoriasIds.push(insertId);
      } else {
        // Obtener el id si ya existia
        const [rows] = await connection.query('SELECT id_categoria FROM categoria WHERE id_negocio = ? AND nombre = ?', [idNegocio, cat]);
        categoriasIds.push((rows as any)[0].id_categoria);
      }
    }

    // 2. Insertar 50 Productos
    console.log('Insertando 50 productos...');
    const productosIds: { id: number, precio: number }[] = [];
    for (let i = 1; i <= 50; i++) {
      const idCat = categoriasIds[Math.floor(Math.random() * categoriasIds.length)];
      const precioCompra = Math.floor(Math.random() * 500) + 50;
      const precioVenta = precioCompra + Math.floor(Math.random() * 300) + 100;
      const stock = Math.floor(Math.random() * 50) + 5;
      const codigoBarras = `779${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;

      const [result] = await connection.query(
        `INSERT INTO productos 
        (id_negocio, id_categoria, nombre_producto, precio_compra, precio_venta, codigo_barras, stock) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idNegocio, idCat, `Producto de Prueba ${i}`, precioCompra, precioVenta, codigoBarras, stock]
      );
      productosIds.push({ id: (result as any).insertId, precio: precioVenta });
    }

    // 3. Insertar 30 Ventas
    console.log('Insertando 30 ventas con sus detalles...');
    for (let i = 1; i <= 30; i++) {
      // Elegir entre 1 a 5 productos distintos para esta venta
      const numProductos = Math.floor(Math.random() * 5) + 1;
      const productosVenta = [];
      let totalVenta = 0;

      // Seleccionar productos sin repetir en la misma venta
      const availableProds = [...productosIds];
      for (let j = 0; j < numProductos; j++) {
        const index = Math.floor(Math.random() * availableProds.length);
        const prod = availableProds.splice(index, 1)[0];
        const cantidad = Math.floor(Math.random() * 4) + 1;
        
        productosVenta.push({ ...prod, cantidad });
        totalVenta += prod.precio * cantidad;
      }

      // Añadir la venta
      const fechaAleatoria = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
      const [vResult] = await connection.query(
        'INSERT INTO ventas (id_negocio, id_usuario, fecha_venta, total) VALUES (?, ?, ?, ?)',
        [idNegocio, idUsuario, fechaAleatoria, totalVenta]
      );
      const idVenta = (vResult as any).insertId;

      // Añadir los detalles de esta venta
      for (const pv of productosVenta) {
        await connection.query(
          'INSERT INTO detalle_venta (id_negocio, id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?, ?)',
          [idNegocio, idVenta, pv.id, pv.cantidad, pv.precio]
        );
      }
    }

    console.log('Exito: Seeding completado exitosamente.');
  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await connection.end();
  }
}

seed();
