export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  username: string;
  contrasena?: string; // Solo para cuando creamos/editamos
  id_rol: number;
  nombre_rol?: string; // Viene en el JWT
  id_negocio: number;
}
