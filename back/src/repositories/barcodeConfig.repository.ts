import { Repository } from '../shared/repository';
import { BarcodeConfig } from '../models/barcodeConfig.model';
import { pool } from '../shared/conn';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ── Caché en memoria ────────────────────────────────────────────────
// Clave: "tenantId:prefix"  →  Valor: { config, expiry }
// TTL de 5 minutos. Se invalida al escribir (save/update/remove).

interface CacheEntry {
  config: BarcodeConfig | null;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export class BarcodeConfigRepository implements Repository<BarcodeConfig> {
  private cache = new Map<string, CacheEntry>();

  // ── Helpers de caché ────────────────────────────────────────────

  private cacheKey(idNegocio: number, prefix: string): string {
    return `${idNegocio}:${prefix}`;
  }

  private getCached(key: string): BarcodeConfig | null | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;               // No existe en caché
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;                          // Expirado
    }
    return entry.config;                         // Hit (puede ser null → "no hay config")
  }

  private setCache(key: string, config: BarcodeConfig | null): void {
    this.cache.set(key, {
      config,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  private invalidateTenant(idNegocio: number): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${idNegocio}:`)) {
        this.cache.delete(key);
      }
    }
  }

  // ── Métodos de Repository<T> ────────────────────────────────────

  public async findAll(idNegocio: number = 1): Promise<BarcodeConfig[] | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM barcode_configs WHERE id_negocio = ? ORDER BY prefix',
      [idNegocio],
    );
    return rows as BarcodeConfig[];
  }

  public async findOne(item: { [key: string]: string }): Promise<BarcodeConfig | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM barcode_configs WHERE id_negocio = ? AND id_config = ?',
      [idNegocio, id],
    );
    if ((rows as RowDataPacket[]).length === 0) return undefined;
    return (rows as RowDataPacket[])[0] as BarcodeConfig;
  }

  public async save(item: BarcodeConfig): Promise<BarcodeConfig> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO barcode_configs
        (id_negocio, prefix, plu_length, value_length, value_type, decimal_places, descripcion, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id_negocio,
        item.prefix,
        item.plu_length,
        item.value_length,
        item.value_type,
        item.decimal_places,
        item.descripcion,
        item.activo ? 1 : 0,
      ],
    );

    this.invalidateTenant(item.id_negocio);

    const insertId = result.insertId;
    if (!insertId) throw new Error('No se pudo insertar la configuración de código de barras');

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM barcode_configs WHERE id_config = ?',
      [insertId],
    );
    return (rows as RowDataPacket[])[0] as BarcodeConfig;
  }

  public async update(
    item: { [key: string]: string },
    entity: BarcodeConfig,
  ): Promise<BarcodeConfig | undefined> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE barcode_configs
          SET prefix = ?, plu_length = ?, value_length = ?, value_type = ?,
              decimal_places = ?, descripcion = ?, activo = ?
        WHERE id_negocio = ? AND id_config = ?`,
      [
        entity.prefix,
        entity.plu_length,
        entity.value_length,
        entity.value_type,
        entity.decimal_places,
        entity.descripcion,
        entity.activo ? 1 : 0,
        idNegocio,
        id,
      ],
    );

    this.invalidateTenant(idNegocio);

    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar la configuración o no existe');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM barcode_configs WHERE id_negocio = ? AND id_config = ?',
      [idNegocio, id],
    );
    return (rows as RowDataPacket[])[0] as BarcodeConfig;
  }

  public async remove(item: { [key: string]: string }): Promise<void> {
    const id = Number.parseInt(item.id);
    const idNegocio = Number.parseInt(item.id_negocio ?? '1');

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM barcode_configs WHERE id_negocio = ? AND id_config = ?',
      [idNegocio, id],
    );

    this.invalidateTenant(idNegocio);

    if (result.affectedRows === 0) {
      throw new Error('No se pudo eliminar la configuración o no existe');
    }
  }

  // ── Método especializado (usado por el service) ─────────────────

  /**
   * Busca la configuración activa para un tenant y prefijo.
   * Usa caché en memoria con TTL de 5 minutos.
   * Retorna `null` si no hay configuración para ese prefijo.
   */
  public async findByTenantAndPrefix(
    idNegocio: number,
    prefix: string,
  ): Promise<BarcodeConfig | null> {
    const key = this.cacheKey(idNegocio, prefix);

    // 1. Intentar desde caché
    const cached = this.getCached(key);
    if (cached !== undefined) return cached;

    // 2. Query a la BD
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM barcode_configs WHERE id_negocio = ? AND prefix = ? AND activo = 1',
      [idNegocio, prefix],
    );

    const config = (rows as RowDataPacket[]).length > 0
      ? ((rows as RowDataPacket[])[0] as BarcodeConfig)
      : null;

    // 3. Guardar en caché (incluso null para evitar queries repetidos)
    this.setCache(key, config);

    return config;
  }
}
