import { Negocio } from '../models/negocio.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class NegocioRepository {

  public async findAll(): Promise<Negocio[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM negocios ORDER BY id_negocio'
    );
    return rows as Negocio[];
  }

  public async findOne(id: number): Promise<Negocio | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM negocios WHERE id_negocio = ?',
      [id]
    );
    if (rows.length === 0) return undefined;
    return rows[0] as Negocio;
  }

  public async save(negocio: Negocio): Promise<Negocio> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO negocios (nombre_negocio, ciudad, direccion, telefono) VALUES (?, ?, ?, ?)',
      [negocio.nombre_negocio, negocio.ciudad, negocio.direccion, negocio.telefono]
    );
    negocio.id_negocio = result.insertId;
    return negocio;
  }

  public async update(id: number, negocio: Negocio): Promise<Negocio | undefined> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE negocios SET nombre_negocio = ?, ciudad = ?, direccion = ?, telefono = ? WHERE id_negocio = ?',
      [negocio.nombre_negocio, negocio.ciudad, negocio.direccion, negocio.telefono, id]
    );
    if (result.affectedRows === 0) throw new Error('No se pudo actualizar el negocio');
    return negocio;
  }

  public async remove(id: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM negocios WHERE id_negocio = ?',
      [id]
    );
    if (result.affectedRows === 0) throw new Error('No se pudo eliminar el negocio');
  }
}
