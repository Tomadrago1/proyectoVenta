import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'productos' })
export class Producto {
  @PrimaryKey({ fieldName: 'id_producto' })
  id!: number;

  @Property({ fieldName: 'id_categoria' })
  id_categoria!: number;

  @Property()
  nombre_producto!: string;

  @Property()
  precio_compra!: number;

  @Property()
  precio_venta!: number;

  @Property()
  stock!: number;

  @Property()
  codigo_barras!: string;
}
