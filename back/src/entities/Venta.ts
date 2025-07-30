import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'ventas' })
export class Venta {
  @PrimaryKey({ fieldName: 'id_venta' })
  id_venta!: number;

  @Property({ fieldName: 'id_usuario' })
  id_usuario!: number;

  @Property()
  fecha_venta!: Date;

  @Property()
  total!: number;

  @Property()
  monto_extra?: number;
}
