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
