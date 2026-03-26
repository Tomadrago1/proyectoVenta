export const getRol = (id_rol: number) => {
    switch (id_rol) {
        case 1:
            return 'Administrador';
        case 2:
            return 'Empleado';
        default:
            return 'Desconocido';
    }
}