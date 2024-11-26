import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Definimos la interfaz para Producto
interface Producto {
  id_producto: string;
  nombre_producto: string;
  precio: number;
}

const ProductCrud: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [newProducto, setNewProducto] = useState<Producto>({
    id_producto: '',
    nombre_producto: '',
    precio: 0,
  });

  const [editProducto, setEditProducto] = useState<Producto | null>(null);

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/producto');
      setProductos(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const createProducto = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/producto', newProducto);
      // Agregar el nuevo producto al estado de forma inmutable
      setProductos((prevProductos) => [...prevProductos, response.data]);
      setNewProducto({ id_producto: '', nombre_producto: '', precio: 0 });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };


  const editProduct = (producto: Producto) => {
    setEditProducto(producto);
    setNewProducto(producto);
  };

  // Handle updating the product
  const updateProducto = async () => {
    if (editProducto) {
      try {
        const response = await axios.put(
          `http://localhost:3000/api/producto/${editProducto.id_producto}`,
          newProducto
        );
        setProductos((prevProductos) =>
          prevProductos.map((producto) =>
            producto.id_producto === response.data.id_producto ? response.data : producto
          )
        );
        setEditProducto(null);
        setNewProducto({ id_producto: '', nombre_producto: '', precio: 0 });
      } catch (error) {
        console.error('Error updating product:', error);
      }
    }
  };

  // Handle deleting a product
  const deleteProducto = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/producto/${id}`);
      setProductos((prevProductos) =>
        prevProductos.filter((producto) => producto.id_producto !== id)
      );
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <div>
      <h1>Product CRUD</h1>
      <div>
        <h2>{editProducto ? 'Edit Product' : 'Add Product'}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editProducto) {
              updateProducto();  // Update if editing
            } else {
              createProducto();  // Create if not editing
            }
          }}
        >
          <input
            type="text"
            placeholder="Nombre"
            value={newProducto.nombre_producto}
            onChange={(e) => setNewProducto({ ...newProducto, nombre_producto: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio"
            value={newProducto.precio}
            onChange={(e) => setNewProducto({ ...newProducto, precio: +e.target.value })}
          />
          <button type="submit">{editProducto ? 'Modificar Producto' : 'Crear producto'}</button>
        </form>
      </div>
      <div>
        <h2>Product List</h2>
        <ul>
          {productos.map((producto) => (
            <li key={producto.id_producto}>
              {producto.nombre_producto} - ${producto.precio}
              <button onClick={() => editProduct(producto)}>Editar</button>
              <button onClick={() => deleteProducto(producto.id_producto)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductCrud;
