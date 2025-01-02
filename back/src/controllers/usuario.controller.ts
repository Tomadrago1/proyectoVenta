import { Request, Response } from 'express';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const repository = new UsuarioRepository();

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await repository.findAll();
    res.json(usuarios);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener los usuarios', errorMessage: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const usuario = await repository.findOne({ id: id.toString() });
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el usuario', errorMessage: error.message });
  }
}

async function create(req: Request, res: Response) {
  try {
    const { contrasena, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const usuario = new Usuario(
      rest.id_usuario,
      rest.nombre,
      rest.apellido,
      rest.username,
      hashedPassword
    );
    const result = await repository.save(usuario);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al crear el usuario', errorMessage: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let { contrasena } = req.body;

    if (!contrasena.startsWith('$2b$')) {
      contrasena = await bcrypt.hash(contrasena, 10);
    }

    const usuarioActualizado = new Usuario(
      Number(id),
      req.body.nombre,
      req.body.apellido,
      req.body.username,
      contrasena
    );

    const result = await repository.update({ id: id }, usuarioActualizado);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el usuario', errorMessage: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await repository.remove({ id: id });
    res.json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el usuario', errorMessage: error.message });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const usuario = await repository.findByUsername(username);
    if (usuario) {
      const isMatch = await bcrypt.compare(password, usuario.contrasena);
      if (isMatch) {
        const token = jwt.sign(
          { id_usuario: usuario.id_usuario, username: usuario.username },
          'secreto_del_token',
          { expiresIn: '1h' }
        );

        res.json({ usuario, token });
      } else {
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
    }
    else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error al iniciar sesión', errorMessage: error.message });
  }
}

export { findAll, findOne, create, update, remove, login };
