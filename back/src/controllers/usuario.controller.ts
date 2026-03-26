import { Request, Response } from 'express';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new UsuarioRepository();

async function findAll(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const usuarios = await repository.findAll(idNegocio);
    res.json(usuarios);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener los usuarios', errorMessage: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const idNegocio = resolveBusinessIdFromRequest(req);
    const usuario = await repository.findOne({ id: id.toString(), id_negocio: idNegocio.toString() });
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
    const idNegocio = resolveBusinessIdFromRequest(req);
    const { contrasena, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const usuario = new Usuario(
      rest.id_usuario,
      rest.nombre,
      rest.apellido,
      rest.username,
      hashedPassword,
      rest.id_rol,
      idNegocio
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
    const idNegocio = resolveBusinessIdFromRequest(req);
    let { contrasena } = req.body;

    if (!contrasena.startsWith('$2b$')) {
      contrasena = await bcrypt.hash(contrasena, 10);
    }

    const usuarioActualizado = new Usuario(
      Number(id),
      req.body.nombre,
      req.body.apellido,
      req.body.username,
      contrasena,
      req.body.id_rol,
      idNegocio
    );

    const result = await repository.update({ id: id, id_negocio: idNegocio.toString() }, usuarioActualizado);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el usuario', errorMessage: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    await repository.remove({ id: id, id_negocio: idNegocio.toString() });
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
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }

        const token = jwt.sign(
          { id_usuario: usuario.id_usuario, username: usuario.username, id_negocio: usuario.id_negocio, nombre_rol: usuario.nombre_rol },
          jwtSecret,
          { expiresIn: '1h' }
        );

        res.json({
          id_rol: usuario.id_rol,
          token
        });
      } else {
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
    } else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error al iniciar sesión', errorMessage: error.message });
  }
}

export { findAll, findOne, create, update, remove, login };
