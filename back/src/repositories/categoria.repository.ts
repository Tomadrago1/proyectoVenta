import { Repository } from '../shared/repository';
import { Categoria } from '../models/categoria.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class CategoriaRepository implements Repository<Categoria> {
  public async findAll(idNegocio: number = 1): Promise<Categoria[] | undefined> {
    const [categorias] = await pool.query('SELECT * FROM categoria WHERE id_negocio = ?', [idNegocio]);
    return categorias as Categoria[];
  }

  public async findOne(item: { id: string; id_negocio?: string }): Promise<Categoria | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [categorias] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM categoria WHERE id_negocio = ? AND id_categoria = ?',
      [idNegocio, id]
    )) as RowDataPacket[];
    if (categorias.length === 0) {
      return undefined;
    }
    return categorias[0] as Categoria;
  }

  public async save(item: Categoria): Promise<Categoria> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categoria (id_negocio, nombre) VALUES (?, ?)',
      [item.id_negocio, item.nombre]
    );

    const insertId = result.insertId;

    if (insertId) {
      const [newCategoria] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM categoria WHERE id_negocio = ? AND id_categoria = ?',
        [item.id_negocio, insertId]
      );
      return newCategoria[0] as Categoria;
    } else {
      throw new Error('No se ha podido insertar la categoria');
    }
  }

  public async update(item: { id: string; id_negocio?: string }, categoria: Categoria): Promise<Categoria | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE categoria SET nombre = ? WHERE id_negocio = ? AND id_categoria = ?',
      [categoria.nombre, idNegocio, id]
    );

    if (result.affectedRows === 1) {
      const [updatedCategoria] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM categoria WHERE id_negocio = ? AND id_categoria = ?',
        [idNegocio, id]
      );
      return updatedCategoria[0] as Categoria;
    } else {
      throw new Error('No se ha podido actualizar la categoria o la categoria no existe');
    }
  }

  public async remove(item: { id: string; id_negocio?: string }): Promise<void> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM categoria WHERE id_negocio = ? AND id_categoria = ?',
      [idNegocio, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se ha podido eliminar la categoria o la categoria no existe');
    }
  }

  public async findByName(item: { name: string; id_negocio?: string }): Promise<Categoria[]> {
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [categorias] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categoria WHERE id_negocio = ? AND nombre LIKE ?',
      [idNegocio, `%${item.name}%`]
    ) as RowDataPacket[];
    return categorias as Categoria[];
  }
}
