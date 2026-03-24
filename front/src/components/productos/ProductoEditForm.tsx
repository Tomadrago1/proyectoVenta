import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { Producto } from '../../interface/producto';
import { Categoria } from '../../interface/categoria';
import { productoService } from '../../services/productoService';

interface ProductoEditFormProps {
    categorias: Categoria[];
    onSuccess: () => void;
    onCancel: () => void;
    fetchNombreProducto: (codigo: string) => Promise<string>;
    initialProductId?: string;
}

const ProductoEditForm: React.FC<ProductoEditFormProps> = ({
    categorias,
    onSuccess,
    onCancel,
    fetchNombreProducto,
    initialProductId = '',
}) => {
    const [editId, setEditId] = useState<string>(initialProductId);
    const [producto, setProducto] = useState<Producto>({
        id_producto: '',
        id_categoria: '',
        nombre_producto: '',
        precio_compra: 0,
        precio_venta: 0,
        stock: 0,
        codigo_barras: '',
    });

    const [porcentaje, setPorcentaje] = useState<number>(50);
    const [mostrarPrecioAutomatico, setMostrarPrecioAutomatico] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (initialProductId) {
            setEditId(initialProductId);
            loadProducto(initialProductId);
        }
    }, [initialProductId]);

    const loadProducto = async (id: string) => {
        if (!id) return;

        try {
            const data = await productoService.getById(id);
            setProducto(data);
            setError('');
        } catch (error) {
            setError('Producto no encontrado');
            console.error('Error loading product:', error);
        }
    };

    const handleCodigoBarrasChange = async (codigo: string) => {
        setProducto((prev) => ({ ...prev, codigo_barras: codigo }));

        if (codigo) {
            const nombreAuto = await fetchNombreProducto(codigo);
            if (nombreAuto) {
                setProducto((prev) => ({ ...prev, nombre_producto: nombreAuto }));
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const precioVenta = mostrarPrecioAutomatico
                ? producto.precio_compra * (1 + porcentaje / 100)
                : producto.precio_venta;

            await productoService.update(producto.id_producto, {
                ...producto,
                precio_venta: precioVenta,
            });

            onSuccess();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error al actualizar el producto');
        }
    };

    return (
        <div className="product-form">
            <h3>Modificar Producto</h3>

            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label>ID del Producto</label>
                <input
                    type="text"
                    placeholder="Ingrese el ID del producto"
                    value={editId}
                    onChange={(e) => setEditId(e.target.value)}
                    onBlur={() => loadProducto(editId)}
                />
            </div>

            {producto.id_producto && (
                <>
                    <div className="form-group">
                        <label>Código de Barras</label>
                        <input
                            type="text"
                            value={producto.codigo_barras}
                            onChange={(e) => handleCodigoBarrasChange(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Nombre del Producto</label>
                        <input
                            type="text"
                            value={producto.nombre_producto}
                            onChange={(e) =>
                                setProducto({ ...producto, nombre_producto: e.target.value })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Categoría</label>
                        <select
                            value={producto.id_categoria}
                            onChange={(e) =>
                                setProducto({ ...producto, id_categoria: e.target.value })
                            }
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
                            value={producto.precio_compra}
                            onChange={(e) =>
                                setProducto({
                                    ...producto,
                                    precio_compra: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </div>

                    <button
                        className="toggle-button"
                        onClick={() => setMostrarPrecioAutomatico(!mostrarPrecioAutomatico)}
                    >
                        {mostrarPrecioAutomatico ? 'Usar Precio Manual' : 'Usar Precio Automático'}
                    </button>

                    {mostrarPrecioAutomatico ? (
                        <div className="form-group">
                            <label>Porcentaje de Ganancia (%)</label>
                            <input
                                type="number"
                                value={porcentaje}
                                onChange={(e) => setPorcentaje(parseFloat(e.target.value))}
                            />
                            <p>
                                Precio de venta: $
                                {(producto.precio_compra * (1 + porcentaje / 100)).toFixed(2)}
                            </p>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Precio Venta</label>
                            <input
                                type="number"
                                value={producto.precio_venta}
                                onChange={(e) =>
                                    setProducto({
                                        ...producto,
                                        precio_venta: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            value={producto.stock}
                            onChange={(e) =>
                                setProducto({ ...producto, stock: parseInt(e.target.value, 10) || 0 })
                            }
                        />
                    </div>

                    <div className="form-buttons">
                        <button className="submit-button" onClick={handleSubmit}>
                            <FontAwesomeIcon icon={faFloppyDisk} />
                            Actualizar
                        </button>
                        <button className="cancel-button" onClick={onCancel}>
                            Cancelar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductoEditForm;
