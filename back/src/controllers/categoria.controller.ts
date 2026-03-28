import { Request, Response } from 'express';
import { CategoriaRepository } from '../repositories/categoria.repository';
import { Categoria } from '../models/categoria.model';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new CategoriaRepository();

async function findAll(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const categorias = await repository.findAll(idNegocio);
    res.json(categorias);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener las categorias', errorMessage });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const categoria = await repository.findOne({ id, id_negocio: idNegocio.toString() });
    if (categoria) {
      res.json(categoria);
    } else {
      res.status(404).json({ message: 'Categoria no encontrada' });
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener la categoria', errorMessage });
  }
}

async function create(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const categoria = new Categoria(
      req.body.id,
      idNegocio,
      req.body.nombre
    );
    const result = await repository.save(categoria);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al crear la categoria', errorMessage });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const categoria = new Categoria(
      parseInt(id),
      idNegocio,
      req.body.nombre
    );

    const result = await repository.update({ id, id_negocio: idNegocio.toString() }, categoria);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar la categoria', errorMessage });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    await repository.remove({ id, id_negocio: idNegocio.toString() });
    res.json({ message: 'Categoria eliminada' });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la categoria', errorMessage });
  }
}

async function findByName(req: Request, res: Response) {
  try {
    const { name } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const categorias = await repository.findByName({ name, id_negocio: idNegocio.toString() });
    res.json(categorias);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los productos', errorMessage });
  }
}

export { findAll, findOne, create, update, remove, findByName };

