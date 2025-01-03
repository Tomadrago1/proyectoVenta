import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/ProductoStyle.css';
import { Producto } from '../interface/producto';
import { Categoria } from '../interface/categoria';

const Producto: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [newProducto, setNewProducto] = useState<Producto>({
    id_producto: '',
    id_categoria: '',
    nombre_producto: '',
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    codigo_barras: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
  const [porcentaje, setPorcentaje] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const formRef = useRef<HTMLDivElement | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/producto');
      setProductos(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const searchProductos = async (search: string) => {
    try {
      if (search.trim() === '') {
        fetchProductos();
      } else {
        const response = await axios.get(
          `http://localhost:3000/api/producto/search/${search}`
        );
        setProductos(response.data);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categoria');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEditLoad = async (id: string) => {
    if (id) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/producto/${id}`
        );
        setNewProducto(response.data);
        setPorcentaje(50);
        handleActionClick('modificar');
        setEditId(id);
        setError('');
      } catch (error) {
        setError('Producto no encontrado');
        resetForm();
      }
    }
  };

  const handleUpdateStockLoad = async (id: string) => {
    if (id) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/producto/${id}`
        );
        setNewProducto(response.data);
        handleActionClick('update-stock');
        setEditId(id);
        setError('');
      } catch (error) {
        setError('Producto no encontrado');
        resetForm();
      }
    }
  };

  const handleDeleteLoad = async (id: string) => {
    if (id) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/producto/${id}`
        );
        setNewProducto(response.data);
        handleActionClick('eliminar');
        setEditId(id);
        setError('');
      } catch (error) {
        setError('Producto no encontrado');
        resetForm();
      }
    }
  };

  const createProducto = async () => {
    const precioVentaCalculado =
      newProducto.precio_compra * (1 + porcentaje / 100);
    try {
      const response = await axios.post('http://localhost:3000/api/producto', {
        ...newProducto,
        precio_venta: precioVentaCalculado,
      });
      setProductos((prevProductos) => [...prevProductos, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const updateProducto = async () => {
    const precioVentaCalculado =
      newProducto.precio_compra * (1 + porcentaje / 100);
    try {
      const response = await axios.put(
        `http://localhost:3000/api/producto/${newProducto.id_producto}`,
        {
          ...newProducto,
          precio_venta: precioVentaCalculado,
        }
      );
      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id_producto === response.data.id_producto
            ? response.data
            : producto
        )
      );
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateStock = async (cantidadAAgregar: number) => {
    const newStock = newProducto.stock + cantidadAAgregar;

    try {
      const response = await axios.put(
        `http://localhost:3000/api/producto/stock/${newProducto.id_producto}/${newStock}`
      );
      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id_producto === response.data.id_producto
            ? response.data
            : producto
        )
      );
      setCantidad(0);
      resetForm();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const deleteProducto = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/producto/${newProducto.id_producto}`
      );
      setProductos((prevProductos) =>
        prevProductos.filter(
          (producto) => producto.id_producto !== newProducto.id_producto
        )
      );
      resetForm();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setNewProducto({
      id_producto: '',
      id_categoria: '',
      nombre_producto: '',
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
      codigo_barras: '',
    });
    setSelectedAction('');
    setEditId('');
    setPorcentaje(50);
    setError('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchProductos(value);
  };

  const getCategoriaName = (id_categoria: string) => {
    const categoria = categorias.find(
      (cat) => cat.id_categoria === id_categoria
    );
    return categoria ? categoria.nombre : 'Categoría no encontrada';
  };

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  return (
    <div className="container">
      <h1>Productos</h1>
      <div className="action-buttons">
        <button
          onClick={() => {
            resetForm();
            handleActionClick('crear');
          }}
        >
          Crear Producto
        </button>
        <button
          onClick={() => {
            handleActionClick('modificar');
          }}
        >
          Modificar Producto
        </button>
        <button
          onClick={() => {
            handleActionClick('eliminar');
          }}
        >
          Eliminar Producto
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar Producto por Nombre"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="product-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Stock</th>
              <th>Código de Barras</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id_producto}>
                <td>{producto.nombre_producto}</td>
                <td>{getCategoriaName(producto.id_categoria)}</td>
                <td>${producto.precio_compra}</td>
                <td>${producto.precio_venta}</td>
                <td>{producto.stock}</td>
                <td>{producto.codigo_barras}</td>
                <td>
                  <button onClick={() => handleEditLoad(producto.id_producto)}>
                    Editar
                  </button>
                  <button
                    onClick={() => handleUpdateStockLoad(producto.id_producto)}
                  >
                    Cargar Stock
                  </button>
                  <button
                    onClick={() => handleDeleteLoad(producto.id_producto)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAction && (
        <div ref={formRef} className="product-form">
          <h3>
            {selectedAction === 'crear'
              ? 'Crear Producto'
              : selectedAction === 'modificar'
              ? 'Modificar Producto'
              : selectedAction === 'eliminar'
              ? 'Eliminar Producto'
              : selectedAction === 'update-stock'
              ? 'Actualizar stock'
              : ''}
          </h3>

          {error && <p className="error-message">{error}</p>}

          {(selectedAction === 'modificar' ||
            selectedAction === 'eliminar' ||
            selectedAction === 'update-stock') && (
            <div className="form-group">
              <label>ID del Producto</label>
              <input
                type="text"
                placeholder="ID del Producto"
                value={editId}
                onChange={(e) => setEditId(e.target.value)}
                onBlur={() => {
                  if (selectedAction === 'modificar') {
                    handleEditLoad(editId);
                  } else if (selectedAction === 'eliminar') {
                    handleDeleteLoad(editId);
                  } else if (selectedAction === 'update-stock') {
                    handleUpdateStockLoad(editId);
                  }
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              value={newProducto.nombre_producto}
              onChange={(e) =>
                setNewProducto({
                  ...newProducto,
                  nombre_producto: e.target.value,
                })
              }
            />
          </div>

          {selectedAction !== 'eliminar' &&
            selectedAction !== 'update-stock' && (
              <>
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={newProducto.id_categoria}
                    onChange={(e) =>
                      setNewProducto({
                        ...newProducto,
                        id_categoria: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categorias.map((categoria) => (
                      <option
                        key={categoria.id_categoria}
                        value={categoria.id_categoria}
                      >
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Precio Compra</label>
                  <input
                    type="number"
                    value={newProducto.precio_compra}
                    onChange={(e) =>
                      setNewProducto({
                        ...newProducto,
                        precio_compra: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Porcentaje de Ganancia (%)</label>
                  <input
                    type="number"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(parseFloat(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Código de Barras</label>
                  <input
                    type="text"
                    value={newProducto.codigo_barras}
                    onChange={(e) =>
                      setNewProducto({
                        ...newProducto,
                        codigo_barras: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

          {selectedAction !== 'eliminar' && (
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={
                  selectedAction === 'update-stock'
                    ? cantidad
                    : newProducto.stock
                }
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  if (selectedAction === 'update-stock') {
                    setCantidad(value);
                  } else {
                    setNewProducto({ ...newProducto, stock: value });
                  }
                }}
              />
            </div>
          )}

          <div className="form-buttons">
            {selectedAction === 'crear' && (
              <button onClick={createProducto}>Crear</button>
            )}
            {selectedAction === 'modificar' && (
              <button onClick={updateProducto}>Actualizar</button>
            )}
            {selectedAction === 'eliminar' && (
              <button onClick={deleteProducto}>Eliminar</button>
            )}
            {selectedAction === 'update-stock' && (
              <button onClick={() => updateStock(cantidad)}>
                Actualizar Stock
              </button>
            )}
            <button onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Producto;
