import { Request } from 'express';

const DEFAULT_BUSINESS_ID = Number.parseInt(process.env.DEFAULT_BUSINESS_ID ?? '1', 10);

export function resolveBusinessId(value: unknown): number {
  const parsed = Number.parseInt(String(value ?? DEFAULT_BUSINESS_ID), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_BUSINESS_ID;
  }
  return parsed;
}

export function resolveBusinessIdFromRequest(req: Request): number {
  const jwtBusinessId = req.res?.locals?.user?.id_negocio;

  // En rutas protegidas, el middleware validateJWT fija este valor.
  if (jwtBusinessId !== undefined && jwtBusinessId !== null) {
    return resolveBusinessId(jwtBusinessId);
  }

  return DEFAULT_BUSINESS_ID;
}