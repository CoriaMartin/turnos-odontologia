export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string | null;
  telefono: string | null;
  email: string | null;
  obraSocial: string | null;
  numeroAfiliado: string | null;
  aceptaRecordatorios: boolean;
  activo: boolean;
}

export interface DatosPaciente {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string | null;
  telefono: string | null;
  email: string | null;
  obraSocial: string | null;
  numeroAfiliado: string | null;
  aceptaRecordatorios: boolean;
}

export interface PaginaPacientes {
  contenido: Paciente[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
