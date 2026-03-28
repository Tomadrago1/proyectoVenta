import { pool } from '../shared/conn';

export interface DetalleTicket {
    cantidad: number;
    precio_unitario: number;
    nombre_producto: string;
}

export interface Negocio {
    nombre_negocio: string;
    ciudad: string;
    direccion: string;
    telefono: string;
}

export const obtenerDetallesConProductos = async (id_venta: number, id_negocio: number): Promise<DetalleTicket[]> => {
    try {
        const query = `
            SELECT 
                d.cantidad, 
                d.precio_unitario, 
                p.nombre_producto
            FROM detalle_venta d
            INNER JOIN productos p ON d.id_producto = p.id_producto
            WHERE d.id_venta = ?  AND d.id_negocio = ?
        `;

        const [rows] = await pool.execute(query, [id_venta, id_negocio]);
        return rows as DetalleTicket[];
    } catch (error) {
        console.error("Error en la consulta SQL:", error);
        throw new Error('Error al obtener los detalles combinados para el ticket');
    }
};

export const obtenerNegocio = async (id_negocio: number): Promise<Negocio> => {
    try {
        const query = `
            SELECT * FROM negocios WHERE id_negocio = ?
        `;
        const [rows] = await pool.execute(query, [id_negocio]);
        return (rows as any[])[0] as Negocio;
    } catch (error) {
        console.error("Error en la consulta SQL:", error);
        throw new Error('Error al obtener el negocio');
    }
};