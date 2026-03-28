import { Request, Response } from 'express';
import { pool } from '../shared/conn';
import { RowDataPacket } from 'mysql2';

async function findAll(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM roles ORDER BY id_rol');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener los roles', errorMessage: error.message });
  }
}

export { findAll };
