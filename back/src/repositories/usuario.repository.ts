import { Repository } from "../shared/repository";
import { Usuario } from "../models/usuario.model";
import { pool } from "../shared/conn";
import { RowDataPacket } from "mysql2";

export class UsuarioRepository implements Repository<Usuario> {

  public async findAll(): Promise<Usuario[] | undefined> {
    const [usuarios] = await pool.query('SELECT * FROM usuarios');
    return usuarios as Usuario[];
  }

  public async findOne(item: { id: string }): Promise<Usuario | undefined> {
    const id_usuario = Number.parseInt(item.id);
    const [usuarios] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );
    if (usuarios.length === 0) {
      return undefined;
    }
    const usuario = usuarios[0] as Usuario;
    return usuario;
  }

  public async save(item: Usuario): Promise<Usuario> {
    const [result] = (await pool.query(
      'INSERT INTO usuarios (nombre, apellido, username, contrasena) VALUES (?, ?, ?, ?)',
      [
        item.nombre,
        item.apellido,
        item.username,
        item.contrasena
      ]
    )) as RowDataPacket[];
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 1) {
      return item;
    } else {
      throw new Error('No se ha podido insertar el usuario');
    }
  }

  public async update(
    item: { id: string },
    usuario: Usuario
  ): Promise<Usuario | undefined> {
    const id_usuario = Number.parseInt(item.id);
    const [result] = (await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, username = ?, contrasena = ? WHERE id_usuario = ?',
      [
        usuario.nombre,
        usuario.apellido,
        usuario.username,
        usuario.contrasena,
        id_usuario
      ]
    )) as RowDataPacket[];
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 1) {
      return usuario;
    } else {
      throw new Error('No se ha podido actualizar el usuario');
    }
  }

  public async remove(item: { id: string }): Promise<void> {
    const id_usuario = Number.parseInt(item.id);
    const [result] = (await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    )) as RowDataPacket[];
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) {
      throw new Error('No se ha podido eliminar el usuario');
    }
  }

  public async findByUsername(username: string): Promise<Usuario | undefined> {
    const [usuarios] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    );
    if (usuarios.length === 0) {
      return undefined;
    }
    const usuario = usuarios[0] as Usuario;
    return usuario;
  }
}
