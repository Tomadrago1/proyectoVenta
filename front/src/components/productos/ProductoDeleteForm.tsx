import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Producto } from "../../interface/producto";
import { productoService } from "../../services/productoService";

interface ProductoDeleteFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    getCategoriaName: (id_categoria: string) => string;
    initialProductId?: string;
}

const ProductoDeleteForm: React.FC<ProductoDeleteFormProps> = ({
    onSuccess,
    onCancel,
    getCategoriaName,
    initialProductId = "",
}) => {
    const [deleteId, setDeleteId] = useState<string>(initialProductId);
    const [producto, setProducto] = useState<Producto | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (initialProductId) {
            setDeleteId(initialProductId);
            loadProducto(initialProductId);
        }
    }, [initialProductId]);

    const loadProducto = async (id: string) => {
        if (!id) return;

        try {
            const data = await productoService.getById(id);
            setProducto(data);
            setError("");
        } catch (error) {
            setError("Producto no encontrado");
            setProducto(null);
            console.error("Error loading product:", error);
        }
    };

    const handleDelete = async () => {
        if (!producto) return;

        const confirmacion = window.confirm(
            `¿Estás seguro de eliminar el producto "${producto.nombre_producto}"?`,
        );

        if (confirmacion) {
            try {
                await productoService.delete(producto.id_producto);
                onSuccess();
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Error al eliminar el producto");
            }
        }
    };

    return (
        <div className="product-form">
            <h3>Eliminar Producto</h3>

            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label>ID del Producto</label>
                <input
                    type="text"
                    placeholder="Ingrese el ID del producto a eliminar"
                    value={deleteId}
                    onChange={(e) => setDeleteId(e.target.value)}
                    onBlur={() => loadProducto(deleteId)}
                />
            </div>

            {producto && (
                <div className="product-details">
                    <h4>Información del Producto</h4>
                    <p>
                        <strong>Nombre:</strong> {producto.nombre_producto}
                    </p>
                    <p>
                        <strong>Categoría:</strong>{" "}
                        {getCategoriaName(producto.id_categoria)}
                    </p>
                    <p>
                        <strong>Precio Compra:</strong> ${producto.precio_compra}
                    </p>
                    <p>
                        <strong>Precio Venta:</strong> ${producto.precio_venta}
                    </p>
                    <p>
                        <strong>Stock:</strong> {producto.stock}
                    </p>
                    <p>
                        <strong>Código de Barras:</strong> {producto.codigo_barras}
                    </p>

                    <div className="form-buttons">
                        <button className="delete-button" onClick={handleDelete}>
                            <FontAwesomeIcon icon={faTrash} />
                            Eliminar
                        </button>
                        <button className="cancel-button" onClick={onCancel}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductoDeleteForm;
