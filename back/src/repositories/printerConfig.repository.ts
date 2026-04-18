import { pool } from '../shared/conn';
import { PrinterConfig, PAPER_COLUMNS, PaperWidth } from '../models/printerConfig.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class PrinterConfigRepository {

  /**
   * Obtiene la configuración de impresora para un negocio.
   * Retorna null si aún no existe configuración.
   */
  async findByNegocio(idNegocio: number): Promise<PrinterConfig | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM printer_config WHERE id_negocio = ?',
      [idNegocio],
    );
    if (rows.length === 0) return null;
    return rows[0] as PrinterConfig;
  }

  /**
   * Crea o actualiza la configuración de impresora (UPSERT).
   * Solo se permite una config por negocio.
   */
  async upsert(data: Omit<PrinterConfig, 'id_config' | 'created_at' | 'updated_at'>): Promise<PrinterConfig> {
    const columnsCount = PAPER_COLUMNS[data.paper_width as PaperWidth] ?? 48;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO printer_config (id_negocio, paper_width, vendor_id, product_id, printer_name, columns_count)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         paper_width = VALUES(paper_width),
         vendor_id = VALUES(vendor_id),
         product_id = VALUES(product_id),
         printer_name = VALUES(printer_name),
         columns_count = VALUES(columns_count)`,
      [
        data.id_negocio,
        data.paper_width,
        data.vendor_id,
        data.product_id,
        data.printer_name,
        columnsCount,
      ],
    );

    // Leer la config actualizada
    const config = await this.findByNegocio(data.id_negocio);
    if (!config) throw new Error('Error al guardar la configuración de impresora');
    return config;
  }

  /**
   * Elimina la configuración de impresora de un negocio.
   */
  async remove(idNegocio: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM printer_config WHERE id_negocio = ?',
      [idNegocio],
    );
    if (result.affectedRows === 0) {
      throw new Error('No se encontró configuración de impresora para eliminar');
    }
  }
}
