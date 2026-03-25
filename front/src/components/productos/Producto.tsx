import React, { useState, useRef } from 'react';
import '../../styles/ProductoStyle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSquarePlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { useProductos } from '../../hooks/useProductos';
import ProductoCreateForm from './ProductoCreateForm';
import ProductoEditForm from './ProductoEditForm';
import ProductoDeleteForm from './ProductoDeleteForm';
import ProductoUpdateStockForm from './ProductoUpdateStockForm';

const Producto: React.FC = () => {
  const {
    productos,
    categorias,
    searchProductos,
    getCategoriaName,
    fetchNombreProducto,
    fetchProductos,
  } = useProductos();

  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchProductos(value);
  };

  const handleActionClick = (action: string, productId: string = '') => {
    setSelectedAction(action);
    setSelectedProductId(productId);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSuccess = () => {
    setSelectedAction('');
    setSelectedProductId('');
    fetchProductos();
  };

  const handleCancel = () => {
    setSelectedAction('');
    setSelectedProductId('');
  };

  return (
    <div className="container_producto">
      <h1>Productos</h1>
      
      <div className="action-buttons">
        <button className="create-button" onClick={() => handleActionClick('crear')}>
          <FontAwesomeIcon icon={faSquarePlus} />
          Crear Producto
        </button>
        <button className="update-button" onClick={() => handleActionClick('modificar')}>
          <FontAwesomeIcon icon={faPen} />
          Modificar Producto
        </button>
        <button className="delete-button" onClick={() => handleActionClick('eliminar')}>
          <FontAwesomeIcon icon={faTrash} />
          Eliminar Producto
        </button>
        <button className="update-button" onClick={() => handleActionClick('update-stock')}>
          Cargar Stock
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
                  <button onClick={() => handleActionClick('modificar', producto.id_producto)}>
                    Editar
                  </button>
                  <button onClick={() => handleActionClick('update-stock', producto.id_producto)}>
                    Cargar Stock
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleActionClick('eliminar', producto.id_producto)}
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
        <div ref={formRef}>
          {selectedAction === 'crear' && (
            <ProductoCreateForm
              categorias={categorias}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              fetchNombreProducto={fetchNombreProducto}
            />
          )}

          {selectedAction === 'modificar' && (
            <ProductoEditForm
              categorias={categorias}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              fetchNombreProducto={fetchNombreProducto}
              initialProductId={selectedProductId}
            />
          )}

          {selectedAction === 'eliminar' && (
            <ProductoDeleteForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              getCategoriaName={getCategoriaName}
              initialProductId={selectedProductId}
            />
          )}

          {selectedAction === 'update-stock' && (
            <ProductoUpdateStockForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              getCategoriaName={getCategoriaName}
              initialProductId={selectedProductId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Producto;