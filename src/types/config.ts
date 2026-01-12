
export interface HorarioDia {
  dia: number; // 0 (Domingo) a 6 (Sábado)
  aberto: boolean;
  inicio: string; // formato "HH:mm"
  fim: string;    // formato "HH:mm"
}

export interface Config {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  tipoLogadouro: string;
  logadouro: string;
  numero: string;
  quadra: string;
  lote: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  taxaEntrega: number;
  menuLayout: 'modern' | 'compact' | 'minimalist';
  primaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'poppins';
  borderRadius: '0px' | '8px' | '16px' | '9999px';
  showBanner: boolean;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
  evolutionInstanceName: string;
  urlAgenteImpressao: string;
  nomeImpressora: string;
  horariosFuncionamento?: HorarioDia[];
}

export interface UpdateConfigPayload {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cep?: string;
  tipoLogadouro?: string;
  logadouro?: string;
  numero?: string;
  quadra?: string;
  lote?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  taxaEntrega?: number;
  menuLayout?: 'modern' | 'compact' | 'minimalist';
  primaryColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'poppins';
  borderRadius?: '0px' | '8px' | '16px' | '9999px';
  showBanner?: boolean;
  bannerImage?: string;
  evolutionInstanceName?: string;
  urlAgenteImpressao?: string;
  nomeImpressora?: string;
  horariosFuncionamento?: HorarioDia[];
}
