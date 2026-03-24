import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { Producto } from "../../interface/producto";
import { productoService } from "../../services/productoService";

interface ProductoUpdateStockFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    getCategoriaName: (id_categoria: string) => string;
    initialProductId?: string;
}

const ProductoUpdateStockForm: React.FC<ProductoUpdateStockFormProps> = ({
    onSuccess,
    onCancel,
    getCategoriaName,
    initialProductId = "",
}) => {
    const [stockId, setStockId] = useState<string>(initialProductId);
    const [producto, setProducto] = useState<Producto | null>(null);
    const [cantidad, setCantidad] = useState<number>(0);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (initialProductId) {
            setStockId(initialProductId);
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

    const handleUpdateStock = async () => {
        if (!producto) return;

        try {
            const newStock = producto.stock + cantidad;
            await productoService.updateStock(producto.id_producto, newStock);
            onSuccess();
        } catch (error) {
            console.error("Error updating stock:", error);
            alert("Error al actualizar el stock");
        }
    };

    return (
        <div className="product-form">
            <h3>Actualizar Stock</h3>

            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label>ID del Producto</label>
                <input
                    type="text"
                    placeholder="Ingrese el ID del producto"
                    value={stockId}
                    onChange={(e) => setStockId(e.target.value)}
                    onBlur={() => loadProducto(stockId)}
                />
            </div>

            {producto && (
                <>
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
                            <strong>Stock Actual:</strong> {producto.stock}
                        </p>
                    </div>

                    <div className="form-group">
                        <label>Cantidad a Agregar (puede ser negativa)</label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 0)}
                        />
                    </div>

                    <div className="stock-preview">
                        <p>
                            <strong>Nuevo Stock:</strong> {producto.stock + cantidad}
                        </p>
                    </div>

                    <div className="form-buttons">
                        <button className="submit-button" onClick={handleUpdateStock}>
                            <FontAwesomeIcon icon={faFloppyDisk} />
                            Actualizar Stock
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

export default ProductoUpdateStockForm;
