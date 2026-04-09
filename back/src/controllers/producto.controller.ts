import { Request, Response } from 'express';
import { ProductoRepository } from '../repositories/producto.repository';
import { Producto } from '../models/producto.model';
import { resolveBusinessIdFromRequest } from '../shared/tenant';

const repository = new ProductoRepository();

async function findAll(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const productos = await repository.findAll(idNegocio);
    res.json(productos);
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener productos' });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const producto = await repository.findOne({ id, id_negocio: idNegocio.toString() });
    if (producto) {
      res.json(producto);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error: any) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener el producto' });
  }
}

async function create(req: Request, res: Response) {
  try {
    const idNegocio = resolveBusinessIdFromRequest(req);
    const producto = new Producto(
      req.body.id,
      idNegocio,
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
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear producto' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const producto = new Producto(
      parseInt(id),
      idNegocio,
      req.body.id_categoria,
      req.body.nombre_producto,
      req.body.precio_compra,
      req.body.precio_venta,
      req.body.stock,
      req.body.codigo_barras,
    );

    const result = await repository.update({ id, id_negocio: idNegocio.toString() }, producto);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el producto', errorMessage });
  }
}


async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    await repository.remove({ id, id_negocio: idNegocio.toString() });
    res.json({ message: 'Producto eliminado' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar el producto' });
  }
}

async function findByBarcode(req: Request, res: Response) {
  try {
    const { barcode } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const producto = await repository.findByBarcode({ barcode, id_negocio: idNegocio.toString() });
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
    const idNegocio = resolveBusinessIdFromRequest(req);
    const productos = await repository.findByName({ name, id_negocio: idNegocio.toString() });
    res.json(productos);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los productos', errorMessage });
  }
}

async function updateStock(req: Request, res: Response) {
  try {
    const { id, stock } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);
    const result = await repository.updateStock({ id, stock, id_negocio: idNegocio.toString() });
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el stock', errorMessage });
  }
}

async function decrementStock(req: Request, res: Response) {
  try {
    const { id, cantidad } = req.params;
    const idNegocio = resolveBusinessIdFromRequest(req);

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({
        message: 'ID de producto inválido',
        errorMessage: `El ID "${id}" no es un número válido`
      });
    }

    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({
        message: 'Cantidad inválida',
        errorMessage: `La cantidad "${cantidad}" debe ser un número mayor a 0`
      });
    }

    const result = await repository.decrementStock({
      id: productId.toString(),
      cantidad: cantidadNum,
      id_negocio: idNegocio.toString(),
    });
    res.json({ message: 'Stock decrementado correctamente', result });
  } catch (error: any) {
    const errorMessage = error.message || 'Error desconocido';
    console.error('Error en decrementStock controller:', errorMessage);
    res.status(500).json({ message: 'Error al decrementar el stock', errorMessage });
  }
}


export { findAll, findOne, create, update, remove, findByBarcode, findByName, updateStock, decrementStock };
