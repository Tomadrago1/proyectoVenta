import { Request, Response } from 'express';
import { ProductoRepository } from '../repositories/producto.repository';
import { Producto } from '../models/producto.model';

const repository = new ProductoRepository();

async function findAll(req: Request, res: Response) {
  try {
    const productos = await repository.findAll();
    res.json(productos);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los productos', errorMessage });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const producto = await repository.findOne({ id });
    if (producto) {
      res.json(producto);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener el producto', errorMessage });
  }
}

async function create(req: Request, res: Response) {
  try {
    const producto = new Producto(
      req.body.id,
      req.body.nombre,
      req.body.precio
    );
    const result = await repository.save(producto);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al crear el producto', errorMessage });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const producto = new Producto(
      req.body.id,
      req.body.nombre,
      req.body.precio,
    );
    const result = await repository.update({ id }, producto);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el producto', errorMessage });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await repository.remove({ id });
    res.json({ message: 'Producto eliminado' });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar el producto', errorMessage });
  }
}

export { findAll, findOne, create, update, remove };
