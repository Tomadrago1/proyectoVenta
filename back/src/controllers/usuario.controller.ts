import { Request, Response } from 'express';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new UsuarioRepository();

async function findAll(req: Request, res: Response) {
  try {
    let idNegocio = resolveBusinessIdFromRequest(req);
    if (res.locals.user?.nombre_rol === 'Superadmin' && req.query.id_negocio) {
      idNegocio = Number(req.query.id_negocio);
    }
    const usuarios = await repository.findAll(idNegocio);
    res.json(usuarios);
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud' });
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
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud' });
  }
}

async function create(req: Request, res: Response) {
  try {
    let idNegocio = resolveBusinessIdFromRequest(req);
    if (res.locals.user?.nombre_rol === 'Superadmin' && req.body.id_negocio) {
      idNegocio = Number(req.body.id_negocio);
    }
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
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let idNegocio = resolveBusinessIdFromRequest(req);
    if (res.locals.user?.nombre_rol === 'Superadmin' && req.body.id_negocio) {
      idNegocio = Number(req.body.id_negocio);
    }
    let { contrasena } = req.body;

    // Solo hasheamos si se envía una contraseña y no parece ser un hash bcrypt existente válido
    // Para evitar que alguien mande un string que empiece con $2b$ y evite el hasheo, 
    // verificamos si la longitud coincide con un hash bcrypt (60 caracteres).
    if (contrasena && !(contrasena.startsWith('$2b$') && contrasena.length === 60)) {
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
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let idNegocio = resolveBusinessIdFromRequest(req);
    if (res.locals.user?.nombre_rol === 'Superadmin' && req.query.id_negocio) {
      idNegocio = Number(req.query.id_negocio);
    }
    await repository.remove({ id: id, id_negocio: idNegocio.toString() });
    res.json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud' });
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
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000 // 1 hora
        });
        
        res.json({
          id_rol: usuario.id_rol,
        });
      } else {
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
    } else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar el inicio de sesión' });
  }
}

async function me(req: Request, res: Response) {
  try {
    const user = res.locals.user;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: 'No autenticado' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada correctamente' });
}

export { findAll, findOne, create, update, remove, login, me, logout };
