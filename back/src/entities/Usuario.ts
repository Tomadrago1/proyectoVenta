import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'usuarios' })
export class Usuario {
  @PrimaryKey({ fieldName: 'id_usuario' })
  id_usuario!: number;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Property()
  username!: string;

  @Property()
  contrasena!: string;
}
