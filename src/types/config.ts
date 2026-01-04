
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
  createdAt: string;
  updatedAt: string;
  evolutionInstanceName: string;
  urlAgenteImpressao: string;
  nomeImpressora: string;
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
  evolutionInstanceName?: string;
  urlAgenteImpressao?: string;
  nomeImpressora?: string;
}
