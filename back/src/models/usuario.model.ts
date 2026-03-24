export class Usuario {
  constructor(
    public id_usuario: number,
    public nombre: string,
    public apellido: string,
    public username: string,
    public contrasena: string,
    public id_rol: number,
    public id_negocio: number,
    public nombre_rol?: string
  ) { }
}