import { Request, Response } from 'express';
import { CategoriaRepository } from '../repositories/categoria.repository';
import { Categoria } from '../models/categoria.model';

const repository = new CategoriaRepository();

async function findAll(req: Request, res: Response) {
  try {
    const categorias = await repository.findAll();
    res.json(categorias);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener las categorias', errorMessage });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const categoria = await repository.findOne({ id });
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
    console.log(req.body);
    const categoria = new Categoria(
      req.body.id,
      req.body.nombre
    );
    console.log(categoria);
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
    const categoria = new Categoria(
      parseInt(id),
      req.body.nombre
    );

    const result = await repository.update({ id }, categoria);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar la categoria', errorMessage });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await repository.remove({ id });
    res.json({ message: 'Categoria eliminada' });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la categoria', errorMessage });
  }
}

async function findByName(req: Request, res: Response) {
  try {
    const { name } = req.params;
    const categorias = await repository.findByName({ name });
    res.json(categorias);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los productos', errorMessage });
  }
}

export { findAll, findOne, create, update, remove, findByName };

