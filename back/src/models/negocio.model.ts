export class Negocio {
  constructor(
    public id_negocio: number,
    public nombre_negocio: string,
    public ciudad: string,
    public direccion: string,
    public telefono: string,
    public fecha_registro?: string
  ) { }
}
