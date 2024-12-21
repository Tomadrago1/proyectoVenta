import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CrudStyle.css";
import { Producto } from "../interface/producto";
import { Categoria } from "../interface/categoria";

const ProductCrud: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [newProducto, setNewProducto] = useState<Producto>({
    id_producto: "",
    id_categoria: "",
    nombre_producto: "",
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    codigo_barras: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editId, setEditId] = useState<string>("");
  const [porcentaje, setPorcentaje] = useState<number>(0);
  const [error, setError] = useState<string>(""); // Estado para los errores

  // Obtener productos desde el backend
  const fetchProductos = async (search: string = "") => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/producto?search=${search}`
      );
      setProductos(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Obtener las categorías desde el backend
  const fetchCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categoria");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Cargar los datos del producto para modificar en tiempo real
  const handleEditLoad = async (id: string) => {
    if (id) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/producto/${id}`
        );
        setNewProducto(response.data);
        setPorcentaje(0); // Restablecer el porcentaje al editar
        setSelectedAction("modificar");
        setEditId(id); // Asignar el ID al estado de edición
        setError(""); // Limpiar errores al encontrar el producto
      } catch (error) {
        setError("Producto no encontrado"); // Mostrar mensaje de error si no se encuentra el producto
        setNewProducto({
          id_producto: "",
          id_categoria: "",
          nombre_producto: "",
          precio_compra: 0,
          precio_venta: 0,
          stock: 0,
          codigo_barras: "",
        });
      }
    }
  };

  // Crear un nuevo producto
  const createProducto = async () => {
    const precioVentaCalculado = newProducto.precio_compra * (1 + porcentaje / 100);
    try {
      const response = await axios.post("http://localhost:3000/api/producto", {
        ...newProducto,
        precio_venta: precioVentaCalculado,
        precio_compra: parseFloat(newProducto.precio_compra.toString()) || 0,
        stock: parseInt(newProducto.stock.toString(), 10) || 0,
      });
      setProductos((prevProductos) => [...prevProductos, response.data]);
      resetForm();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Actualizar un producto existente
  const updateProducto = async () => {
    const precioVentaCalculado = newProducto.precio_compra * (1 + porcentaje / 100);
    try {
      const response = await axios.put(
        `http://localhost:3000/api/producto/${newProducto.id_producto}`,
        {
          ...newProducto,
          precio_venta: precioVentaCalculado,
          precio_compra: parseFloat(newProducto.precio_compra.toString()) || 0,
          stock: parseInt(newProducto.stock.toString(), 10) || 0,
        }
      );
      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id_producto === response.data.id_producto ? response.data : producto
        )
      );
      resetForm();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Eliminar un producto
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
      console.error("Error deleting product:", error);
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setNewProducto({
      id_producto: "",
      id_categoria: "",
      nombre_producto: "",
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
      codigo_barras: "",
    });
    setSelectedAction("");
    setEditId(""); // Limpiar el ID de edición
    setPorcentaje(0); // Resetear el porcentaje
    setError(""); // Limpiar errores
  };

  // Actualizar los productos al escribir en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchProductos(value); // Se filtran productos por nombre al escribir
  };

  // Obtener el nombre de la categoría a partir del id_categoria
  const getCategoriaName = (id_categoria: string) => {
    const categoria = categorias.find((cat) => cat.id_categoria === id_categoria);
    return categoria ? categoria.nombre : "Categoría no encontrada";
  };

  // Convierte un valor en un número con 2 decimales, o retorna 0 si no es un número válido
  const formatCurrency = (value: any): string => {
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias(); // Cargar categorías cuando se monta el componente
  }, []);

  return (
    <div className="container">
      <h1>CRUD Producto</h1>

      <div className="action-buttons">
        <button onClick={() => setSelectedAction("crear")}>Crear Producto</button>
        <button onClick={() => setSelectedAction("modificar")}>
          Modificar Producto
        </button>
        <button onClick={() => setSelectedAction("eliminar")}>
          Eliminar Producto
        </button>
      </div>

      {/* Campo de búsqueda para filtrar productos por nombre */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar Producto por Nombre"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Tabla de productos */}
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id_producto}>
                <td>{producto.nombre_producto}</td>
                <td>{getCategoriaName(producto.id_categoria)}</td>
                <td>${formatCurrency(producto.precio_compra)}</td>
                <td>${formatCurrency(producto.precio_venta)}</td>
                <td>{producto.stock}</td>
                <td>{producto.codigo_barras}</td>
                <td>
                  <button onClick={() => handleEditLoad(producto.id_producto)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario para crear o modificar productos */}
      {selectedAction && (
        <div className="product-form">
          <h3>{selectedAction === "crear" ? "Crear Producto" : "Modificar Producto"}</h3>

          {/* Mensaje de error si no se encuentra el producto */}
          {error && <p className="error-message">{error}</p>}

          {/* Campo ID para edición */}
          {selectedAction === "modificar" && (
            <div className="form-group">
              <label>ID del Producto (para modificar)</label>
              <input
                type="text"
                placeholder="ID del Producto"
                value={editId}
                onChange={(e) => setEditId(e.target.value)}
                onBlur={() => handleEditLoad(editId)} // Precargar datos al salir del campo
              />
            </div>
          )}

          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              placeholder="Nombre del Producto"
              value={newProducto.nombre_producto}
              onChange={(e) => setNewProducto({ ...newProducto, nombre_producto: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              value={newProducto.id_categoria}
              onChange={(e) => setNewProducto({ ...newProducto, id_categoria: e.target.value })}
            >
              <option value="">Seleccionar Categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Precio Compra</label>
            <input
              type="number"
              placeholder="Precio Compra"
              value={newProducto.precio_compra}
              onChange={(e) => setNewProducto({ ...newProducto, precio_compra: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label>Porcentaje de Ganancia (%)</label>
            <input
              type="number"
              placeholder="Porcentaje de Ganancia"
              value={porcentaje}
              onChange={(e) => setPorcentaje(parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              placeholder="Stock"
              value={newProducto.stock}
              onChange={(e) => setNewProducto({ ...newProducto, stock: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div className="form-group">
            <label>Código de Barras</label>
            <input
              type="text"
              placeholder="Código de Barras"
              value={newProducto.codigo_barras}
              onChange={(e) => setNewProducto({ ...newProducto, codigo_barras: e.target.value })}
            />
          </div>

          <div className="form-actions">
            {selectedAction === "crear" && (
              <button onClick={createProducto}>Crear Producto</button>
            )}
            {selectedAction === "modificar" && (
              <button onClick={updateProducto}>Modificar Producto</button>
            )}
            {selectedAction === "eliminar" && (
              <button onClick={deleteProducto}>Eliminar Producto</button>
            )}
            <button onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCrud;
