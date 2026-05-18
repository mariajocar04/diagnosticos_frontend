export interface UserProfile {
  id: number;
  email: string;
  nombre_completo: string;
  rol: 'enfermero' | 'administrador';
  is_active: boolean;
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
