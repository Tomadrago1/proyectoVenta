import { Request, Response } from 'express';
import { NegocioRepository } from '../repositories/negocio.repository';
import { Negocio } from '../models/negocio.model';

const repository = new NegocioRepository();

async function findAll(req: Request, res: Response) {
  try {
    const negocios = await repository.findAll();
    res.json(negocios);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener los negocios', errorMessage: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const negocio = await repository.findOne(id);
    if (negocio) {
      res.json(negocio);
    } else {
      res.status(404).json({ message: 'Negocio no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el negocio', errorMessage: error.message });
  }
}

async function create(req: Request, res: Response) {
  try {
    const negocio = new Negocio(0, req.body.nombre_negocio);
    const result = await repository.save(negocio);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al crear el negocio', errorMessage: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const negocio = new Negocio(id, req.body.nombre_negocio);
    const result = await repository.update(id, negocio);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el negocio', errorMessage: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await repository.remove(id);
    res.json({ message: 'Negocio eliminado' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el negocio', errorMessage: error.message });
  }
}

export { findAll, findOne, create, update, remove };
