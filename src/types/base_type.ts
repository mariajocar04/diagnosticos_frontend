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
  codigo_nanda: string;
  nombre: string;
  definicion: string;
  caracteristicas_definitorias?: string;
  factores_relacionados?: string;
  nic_sugeridos?: string;
  noc_sugeridos?: string;
}

export interface Patient {
  id: number;
  nombre_completo: string;
  numero_historia: string;
  tipo_documento: string;
  numero_documento: string;
  creado_en: string;
}
