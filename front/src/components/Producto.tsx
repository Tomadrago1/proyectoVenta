import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/ProductoStyle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faSquarePlus,
  faFloppyDisk,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { Producto } from '../interface/producto';
import { Categoria } from '../interface/categoria';

type OFFProduct = {
  product_name?: string;
  product_name_es?: string;
  brands?: string;
  product_quantity?: string;
  product_quantity_unit?: string;
};
type OFFResponse = {
  status: number;
  product?: OFFProduct;
};

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
  const [mostrarFormularioAutomatico, setMostrarFormularioAutomatico] =
    useState<boolean>(false);

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
    const precioVentaCalculado = mostrarFormularioAutomatico
      ? newProducto.precio_compra * (1 + porcentaje / 100)
      : newProducto.precio_venta;

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
    const precioVentaCalculado = mostrarFormularioAutomatico
      ? newProducto.precio_compra * (1 + porcentaje / 100)
      : newProducto.precio_venta;

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

  const fetchNombreProducto = async (codigo: string) => {
    if (!codigo) return;
    try {
      const url = `https://world.openfoodfacts.net/api/v2/product/${codigo}`;
      const { data } = await axios.get<OFFResponse>(url, {
        params: {
          fields:
            'status,product_name,product_name_es,brands,product_quantity,product_quantity_unit',
        },
      });

      if (data.status === 1 && data.product) {
        const p = data.product;

        const toTitleCase = (str: string) =>
          str
            .split(' ')
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' ');

        const name = p.product_name_es || p.product_name || '';
        const brand = p.brands || '';
        let quantity = '';
        if (p.product_quantity) {
          quantity = String(p.product_quantity);
          if (p.product_quantity_unit) {
            quantity += p.product_quantity_unit;
          }
        }

        const parts = [];
        if (name) parts.push(toTitleCase(name));
        if (brand) parts.push(toTitleCase(brand));
        if (quantity) parts.push(quantity);

        const autoName = parts.join(' ').trim();

        if (autoName) {
          setNewProducto((prev) => ({
            ...prev,
            nombre_producto: autoName,
          }));
        }
      }
    } catch (error) {
      console.error('Error consultando OpenFoodFacts:', error);
    }
  };

  return (
    <div className="container_producto">
      <h1>Productos</h1>
      <div className="action-buttons">
        <button
          className="create-button"
          onClick={() => {
            resetForm();
            handleActionClick('crear');
          }}
        >
          <FontAwesomeIcon icon={faSquarePlus} />
          Crear Producto
        </button>
        <button
          className="update-button"
          onClick={() => {
            handleActionClick('modificar');
          }}
        >
          <FontAwesomeIcon icon={faPen} />
          Modificar Producto
        </button>
        <button
          className="delete-button"
          onClick={() => {
            handleActionClick('eliminar');
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
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
        <table className="table">
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
                    className="delete-button"
                    onClick={() => handleDeleteLoad(producto.id_producto)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
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

          {selectedAction !== 'eliminar' &&
            selectedAction !== 'update-stock' && (
              <>
                {/* Código de barras primero */}
                <div className="form-group">
                  <label>Código de Barras</label>
                  <input
                    type="text"
                    value={newProducto.codigo_barras}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewProducto((prev) => ({
                        ...prev,
                        codigo_barras: value,
                      }));
                      fetchNombreProducto(value); // llamada directa sin debounce
                    }}
                  />
                </div>

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

                {(selectedAction === 'crear' ||
                  selectedAction === 'modificar') && (
                  <>
                    <button
                      className="toggle-button"
                      onClick={() =>
                        setMostrarFormularioAutomatico(
                          !mostrarFormularioAutomatico
                        )
                      }
                    >
                      {mostrarFormularioAutomatico
                        ? 'Usar Precio Manual'
                        : 'Usar Precio Automático'}
                    </button>

                    {mostrarFormularioAutomatico && (
                      <div className="form-group">
                        <label>Porcentaje de Ganancia (%)</label>
                        <input
                          type="number"
                          value={porcentaje}
                          onChange={(e) =>
                            setPorcentaje(parseFloat(e.target.value))
                          }
                        />
                      </div>
                    )}

                    {!mostrarFormularioAutomatico && (
                      <div className="form-group">
                        <label>Precio Venta</label>
                        <input
                          type="number"
                          value={newProducto.precio_venta}
                          onChange={(e) =>
                            setNewProducto({
                              ...newProducto,
                              precio_venta: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

          {selectedAction !== 'eliminar' && (
            <div className="form-group">
              <label>
                {selectedAction === 'update-stock'
                  ? 'Cantidad a Agregar'
                  : 'Stock'}
              </label>
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
              <button className="submit-button" onClick={createProducto}>
                <FontAwesomeIcon icon={faFloppyDisk} />
                Crear
              </button>
            )}
            {selectedAction === 'modificar' && (
              <button className="submit-button" onClick={updateProducto}>
                <FontAwesomeIcon icon={faFloppyDisk} />
                Actualizar
              </button>
            )}
            {selectedAction === 'eliminar' && (
              <button className="delete-button" onClick={deleteProducto}>
                <FontAwesomeIcon icon={faTrash} />
                Eliminar
              </button>
            )}
            {selectedAction === 'update-stock' && (
              <button
                className="submit-button"
                onClick={() => updateStock(cantidad)}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                Actualizar Stock
              </button>
            )}
            <button className="cancel-button" onClick={resetForm}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Producto;
