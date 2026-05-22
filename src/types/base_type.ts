export interface Rol {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface UserProfile {
  id: number;
  usuario: string;
  email: string;
  nombre_completo?: string;
  activo: boolean;
  roles: Rol[];
}

export interface NandaCatalog {
  id: number;
  codigo: string;
  nombre: string;
  sintomas?: string;
  intervenciones_nic?: string;
  resultados_noc?: string;
}

export interface Patient {
  id: number;
  nombre_completo: string;
  numero_historia: string;
  tipo_documento: string;
  numero_documento: string;
  creado_en: string;
  remisiones?: Remision[];
}

export interface PatientCreate {
  nombre_completo: string;
  numero_historia: string;
  tipo_documento: string;
  numero_documento: string;
}

export interface PatientUpdate {
  nombre_completo?: string;
  numero_historia?: string;
  tipo_documento?: string;
  numero_documento?: string;
}

export interface UsuarioMini {
  id: number;
  usuario: string;
  nombre_completo: string;
}

export interface NotaEnfermeria {
  id: number;
  paciente_id: number;
  usuario_id: number;
  contenido: string;
  creado_en: string;
  usuario?: UsuarioMini;
  remision_id?: number;
}

export interface NotaEnfermeriaCreate {
  contenido: string;
}

export interface DiagnosticoClinico {
  id: number;
  usuario_id: number;
  paciente_id: number;
  codigo_nanda: string;
  resultado?: string;
  fecha_hora: string;
  usuario?: UsuarioMini;
  catalogo?: {
    codigo: string;
    nombre: string;
  };
  remision_id?: number;
}

export interface DiagnosticoClinicoCreate {
  codigo_nanda: string;
  resultado?: string;
}

export interface EventoHistorial {
  tipo: 'nota' | 'diagnostico';
  id: number;
  fecha: string;
  descripcion: string;
  detalle: string;
  usuario?: UsuarioMini;
  metadata?: Record<string, any>;
}

export interface Unidad {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  descripcion?: string;
  pacientes_activos?: number;
}

export interface Remision {
  id: number;
  paciente_id: number;
  unidad_id: number;
  motivo?: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'PENDIENTE' | 'ACTIVA' | 'EGRESADO' | 'TRASLADADO';
  fecha_remision: string;
  fecha_ingreso?: string;
  unidad?: Unidad;
  paciente?: Patient;
}

export interface UnidadBoardColumn {
  unidad: Unidad;
  remisiones_activas: Remision[];
}

export interface RemisionCreate {
  paciente_id: number;
  unidad_id: number;
  motivo?: string;
  prioridad?: string;
}
