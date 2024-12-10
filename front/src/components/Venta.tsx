import React, { useState, useEffect } from "react";
import axios from "axios";
import { Producto } from '../interface/producto';
import { DetalleVenta } from '../interface/detalleVenta';
import { Venta } from '../interface/venta';
import '../styles/VentaStyle.css';

const Venta: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [venta, setVenta] = useState<Venta>({
    id_venta: 0,  // Este id será null al guardarlo
    id_usuario: 1,  // ID del usuario hardcodeado
    fecha_venta: new Date().toISOString(),
    total: 0,
  });

  useEffect(() => {
    // Obtener los productos del servidor
    axios.get("/api/producto")
      .then((response) => {
        setProductos(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener productos", error);
      });
  }, []);

  useEffect(() => {
    // Calcular el total cuando los detalles cambian
    const totalCalculado = detalles.reduce((acc, detalle) => acc + detalle.precio_unitario * detalle.cantidad, 0);
    setTotal(totalCalculado);
  }, [detalles]);

  const agregarProducto = (idProducto: number, cantidad: number) => {
    const producto = productos.find((p) => Number(p.id_producto) === idProducto);
    if (!producto) return;

    // Verificar si el producto ya está en la venta
    const productoExistente = detalles.find(d => d.id_producto === idProducto);
    if (productoExistente) {
      alert("Este producto ya ha sido añadido a la venta.");
      return;
    }

    const nuevoDetalle: DetalleVenta = {
      id_producto: Number(producto.id_producto),
      id_venta: venta.id_venta,  // Este campo no se usa aquí, el id_venta lo asigna el backend
      cantidad,
      precio_unitario: producto.precio,
    };

    setDetalles([...detalles, nuevoDetalle]);
  };

  const eliminarProducto = (idProducto: number) => {
    const nuevoDetalles = detalles.filter((detalle) => detalle.id_producto !== idProducto);
    setDetalles(nuevoDetalles);
  };

  const guardarVenta = () => {
    if (total <= 0) {
      alert("El total de la venta no puede ser 0.");
      return;
    }

    const nuevaVenta: Venta = {
      id_venta: null,  // Este id será null para que el backend lo asigne automáticamente
      id_usuario: 1,  // ID del usuario hardcodeado
      fecha_venta: new Date().toISOString(),
      total: total,  // Asegúrate de que el total esté correctamente calculado
    };

    console.log("Datos de la venta que se van a guardar:", nuevaVenta);

    // Realizamos solo el POST para guardar la venta
    axios.post("/api/venta", nuevaVenta)
      .then((response) => {
        const ventaCreada = response.data; // La venta con el id generado por el backend
        console.log("Venta guardada con éxito:", ventaCreada);

        // Asignamos el id de la venta guardada al estado de la venta
        setVenta(ventaCreada);
        alert("Venta guardada exitosamente.");

        // Ahora guardamos los detalles de la venta
        detalles.forEach((detalle) => {
          // Aseguramos que el id_venta es el de la venta recién creada
          axios.post("/api/detalle-venta", { ...detalle, id_venta: ventaCreada.id_venta })
            .then(() => {
              console.log("Detalle de venta guardado correctamente.");
            })
            .catch((error) => {
              console.error("Error al guardar el detalle de la venta", error);
              alert("Error al guardar los detalles de la venta.");
            });
        });
      })
      .catch((error) => {
        console.error("Error al guardar la venta", error);
        alert("Error al guardar la venta.");
      });
  };

  return (
    <div className="container">
      <h1>Registro de Venta</h1>
      <div>
        <label>Producto:</label>
        <select
          onChange={(e) => {
            const idProducto = parseInt(e.target.value);
            const cantidad = 1; // Ejemplo: cantidad de 1 por defecto
            agregarProducto(idProducto, cantidad);
          }}
        >
          <option value="">Seleccione un producto</option>
          {productos.map((producto) => (
            <option key={producto.id_producto} value={producto.id_producto}>
              {producto.nombre_producto}
            </option>
          ))}
        </select>
      </div>

      <h3>Detalles de la venta</h3>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle, index) => {
            const producto = productos.find(p => Number(p.id_producto) === detalle.id_producto);
            return (
              <tr key={index}>
                <td>{producto?.nombre_producto}</td>
                <td>
                  <input
                    type="number"
                    value={detalle.cantidad}
                    min="1"
                    onChange={(e) => {
                      const nuevaCantidad = parseInt(e.target.value);
                      const nuevosDetalles = detalles.map(d => 
                        d.id_producto === detalle.id_producto 
                          ? { ...d, cantidad: nuevaCantidad }
                          : d
                      );
                      setDetalles(nuevosDetalles);
                    }}
                  />
                </td>
                <td>{detalle.precio_unitario}</td>
                <td>
                  <button onClick={() => eliminarProducto(detalle.id_producto)}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Total: {total.toFixed(2)}</h2>
      <button onClick={guardarVenta}>Guardar Venta</button>
    </div>
  );
};

export default Venta;
