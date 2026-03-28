import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that restricts access to one or more roles.
 * Roles are read from res.locals.user.nombre_rol set by validateJWT.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.user;
    if (!user || !roles.includes(user.nombre_rol)) {
      res.status(403).json({ message: 'Acceso denegado: permisos insuficientes.' });
      return;
    }
    next();
  };
}
