import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'detalle_venta' })
export class DetalleVenta {
  @PrimaryKey({ fieldName: 'id_venta' })
  id_venta!: number;

  @PrimaryKey({ fieldName: 'id_producto' })
  id_producto!: number;

  @Property()
  cantidad!: number;

  @Property()
  precio_unitario!: number;
}
