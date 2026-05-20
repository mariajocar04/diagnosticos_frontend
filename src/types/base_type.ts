export interface Rol {
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



