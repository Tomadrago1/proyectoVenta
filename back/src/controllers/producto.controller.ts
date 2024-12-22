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
      req.body.id_categoria,
      req.body.nombre_producto,
      req.body.precio_compra,
      req.body.precio_venta,
      req.body.stock,
      req.body.codigo_barras,
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
      parseInt(id),
      req.body.id_categoria,
      req.body.nombre_producto,
      req.body.precio_compra,
      req.body.precio_venta,
      req.body.stock,
      req.body.codigo_barras,
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

async function findByBarcode(req: Request, res: Response) {
  try {
    const { barcode } = req.params;
    const producto = await repository.findByBarcode({ barcode });
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

async function findByName(req: Request, res: Response) {
  try {
    const { name } = req.params;
    const productos = await repository.findByName({ name });
    res.json(productos);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los productos', errorMessage });
  }
}

async function updateStock(req: Request, res: Response) {
  try {
    const { id, stock } = req.params;
    const result = await repository.updateStock({ id, stock });
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el stock', errorMessage });
  }

}

export { findAll, findOne, create, update, remove, findByBarcode, findByName, updateStock };
