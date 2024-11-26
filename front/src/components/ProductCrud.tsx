import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CrudStyle.css';

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
    <div className="container">
      <h1>Product CRUD</h1>
      <div className="form-container">
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
            className="input-field"
            type="text"
            placeholder="Nombre"
            value={newProducto.nombre_producto}
            onChange={(e) => setNewProducto({ ...newProducto, nombre_producto: e.target.value })}
          />
          <input
            className="input-field"
            type="text"
            placeholder="Precio"
            value={newProducto.precio === 0 ? '' : newProducto.precio} // Muestra vacío si el precio es 0
            onChange={(e) => {
              const value = e.target.value;
              // Si está vacío, se setea el valor a 0
              if (value === '') {
                setNewProducto({ ...newProducto, precio: 0 });
              } else if (!isNaN(Number(value))) {
                setNewProducto({ ...newProducto, precio: Number(value) });
              }
            }}
          />
          <button type="submit" className="btn-submit">{editProducto ? 'Modificar Producto' : 'Crear producto'}</button>
        </form>
      </div>
      <div className="list-container">
        <h2>Product List</h2>
        <ul className="product-list">
          {productos.map((producto) => (
            <li key={producto.id_producto} className="product-item">
              {producto.nombre_producto} - ${producto.precio}
              <div className="product-actions">
                <button className="btn-edit" onClick={() => editProduct(producto)}>Editar</button>
                <button className="btn-delete" onClick={() => deleteProducto(producto.id_producto)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductCrud;
