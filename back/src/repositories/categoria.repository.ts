import { Repository } from '../shared/repository';
import { Categoria } from '../models/categoria.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class CategoriaRepository implements Repository<Categoria> {
  public async findAll(): Promise<Categoria[] | undefined> {
    const [categorias] = await pool.query('SELECT * FROM categoria');
    return categorias as Categoria[];
  }

  public async findOne(item: { id: string }): Promise<Categoria | undefined> {
    const id = Number.parseInt(item.id);
    const [categorias] = (await pool.query<RowDataPacket[]>(
      'SELECT * FROM categoria WHERE id_categoria = ?',
      [id]
    )) as RowDataPacket[];
    if (categorias.length === 0) {
      return undefined;
    }
    return categorias[0] as Categoria;
  }

  public async save(item: Categoria): Promise<Categoria> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categoria (nombre) VALUES (?)',
      [item.nombre]
    );

    const insertId = result.insertId;

    if (insertId) {
      const [newCategoria] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM categoria WHERE id_categoria = ?',
        [insertId]
      );
      return newCategoria[0] as Categoria;
    } else {
      throw new Error('No se ha podido insertar la categoria');
    }
  }

  public async update(item: { id: string }, categoria: Categoria): Promise<Categoria | undefined> {
    const id = Number.parseInt(item.id);

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE categoria SET nombre = ? WHERE id_categoria = ?',
      [categoria.nombre, id]
    );

    if (result.affectedRows === 1) {
      const [updatedCategoria] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM categoria WHERE id_categoria = ?',
        [id]
      );
      return updatedCategoria[0] as Categoria;
    } else {
      throw new Error('No se ha podido actualizar la categoria o la categoria no existe');
    }
  }

  public async remove(item: { id: string }): Promise<void> {
    const id = Number.parseInt(item.id);
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM categoria WHERE id_categoria = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se ha podido eliminar la categoria o la categoria no existe');
    }
  }
}
