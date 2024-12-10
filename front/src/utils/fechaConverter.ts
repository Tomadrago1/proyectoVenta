export const formatFechaHora = (fecha: string) => {
  const opciones: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Muestra en formato 24 horas
  };
  return new Date(fecha).toLocaleString('es-ES', opciones);
};
