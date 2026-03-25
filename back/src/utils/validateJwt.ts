
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../models/jwt.model';

const JWT_SECRET = process.env.JWT_SECRET;

export function validateJWT(req: Request, res: Response, next: NextFunction): void {
    if (!JWT_SECRET) {
        res.status(500).json({ mensaje: 'Configuración inválida del servidor: JWT_SECRET no definido.' });
        return;
    }

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado o formato inválido.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedPayload = jwt.verify(token, JWT_SECRET) as UserPayload;
        res.locals.user = decodedPayload;
        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token inválido o expirado.' });
        return;
    }
}