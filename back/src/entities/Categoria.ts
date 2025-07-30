import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'categoria' })
export class Categoria {
  @PrimaryKey({ fieldName: 'id_categoria' })
  id!: number;

  @Property()
  nombre!: string;
}
