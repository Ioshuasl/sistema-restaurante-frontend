// --- Autenticação e Usuário ---

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    nome: string;
    username: string;
    cargo: string;
    admin: boolean;
  };
  token: string;
}

export interface User {
  id: number;
  nome: string;
  cargo_id: number;
  username: string;
  password?: string; // A senha é opcional, pois não será retornada nas buscas
  createdAt: string;
  updatedAt: string;
  Cargo: Cargo; // Relação com o tipo Cargo
}

export interface CreateUserPayload {
  nome: string;
  cargo_id: number;
  username: string;
  password?: string;
}

export interface UpdateUserPayload {
  nome?: string;
  cargo_id?: number;
  username?: string;
  password?: string;
}


// --- Cargo ---

export interface Cargo {
  id: number;
  nome: string;
  descricao: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  Users?: User[]; // Relação opcional com o tipo User
}

export interface CreateCargoPayload {
  nome: string;
  descricao: string;
  admin: boolean;
}

export interface UpdateCargoPayload {
  nome?: string;
  descricao?: string;
  admin?: boolean;
}


// --- Configuração ---

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
  evolutionInstanceName: string;
  urlAgenteImpressao: string;
  nomeImpressora: string;
}


// --- Formas de Pagamento ---

export interface FormaPagamento {
  id: number;
  nomeFormaPagamento: string;
  createdAt: string;
  updatedAt: string;
  Pedidos?: Pedido[]; // Relação opcional com o tipo Pedido
}

export interface CreateFormaPagamentoPayload {
  nomeFormaPagamento: string;
}

export interface UpdateFormaPagamentoPayload {
  nomeFormaPagamento?: string;
}


// --- Produto e Categoria de Produto ---

export interface CategoriaProduto {
  id: number;
  nomeCategoriaProduto: string;
  createdAt: string;
  updatedAt: string;
  Produtos?: Produto[]; // Relação opcional com o tipo Produto
}

export interface CreateCategoriaProdutoPayload {
  nomeCategoriaProduto: string;
}

export interface UpdateCategoriaProdutoPayload {
  nomeCategoriaProduto?: string;
}

export interface GrupoOpcao {
  id: number;
  nomeGrupo: string;
  minEscolhas: number;
  maxEscolhas: number;
  produto_id: number;
  createdAt?: string;
  updatedAt?: string;
  opcoes?: SubProduto[]; // Um grupo tem várias opções (SubProdutos)
}

export interface SubProduto {
  id: number;
  nomeSubProduto: string;
  isAtivo: boolean;
  valorAdicional: number;
  // produto_id: number; // REMOVIDO
  grupoOpcao_id: number; // ADICIONADO
}

export interface SubItemPedido {
  precoAdicional(precoAdicional: any): unknown;
  subproduto: any;
  id: number;                 // O ID único do registro do sub-item no pedido
  nomeSubProduto: string;     // O nome do sub-produto (ex: "Bacon extra")
  valorAdicional: number;     // O valor que este sub-item adiciona ao produto principal
}

export interface Produto {
  id: number;
  nomeProduto: string;
  valorProduto: number;
  image: string;
  isAtivo: boolean;
  categoriaProduto_id: number;
  createdAt: string;
  updatedAt: string;
  CategoriaProduto?: CategoriaProduto;
  ItemPedidos?: ItemPedido[];
  // subprodutos?: SubProduto[]; // REMOVIDO
  gruposOpcoes?: GrupoOpcao[]; // ADICIONADO: Array de grupos
}

export interface OpcaoPayload {
  id?: number; // Opcional, para atualizações
  nomeSubProduto: string;
  valorAdicional: number;
  isAtivo: boolean;
}

// Payload para criar um GrupoOpcao aninhado
export interface GrupoOpcaoPayload {
  id?: number; // Opcional, para atualizações
  nomeGrupo: string;
  minEscolhas: number;
  maxEscolhas: number;
  opcoes: OpcaoPayload[];
}

export interface CreateSubProdutoPayload {
  nomeSubProduto: string;
  valorAdicional: number; // Corrigido
  isAtivo: boolean;
  grupoOpcao_id: number; // Corrigido
}

export interface UpdateSubProdutoPayload {
  nomeSubProduto?: string;
  valorAdicional?: number; // Corrigido
  isAtivo?: boolean;
  grupoOpcao_id?: number;
}

export interface CreateProdutoPayload {
  nomeProduto: string;
  valorProduto: number;
  image: string;
  isAtivo: boolean;
  categoriaProduto_id: number;
  gruposOpcoes?: GrupoOpcaoPayload[]; // ADICIONADO
}

export interface UpdateProdutoPayload {
  nomeProduto?: string;
  valorProduto?: number;
  image?: string;
  isAtivo?: boolean;
  categoriaProduto_id?: number;
  gruposOpcoes?: GrupoOpcaoPayload[]; // ADICIONADO
}


// --- Pedido e Itens de Pedido ---
type situacaoPedido = 'preparando' | 'entrega' | 'finalizado' | 'cancelado'

export interface Pedido {
  id: number;
  formaPagamento_id: number;
  isRetiradaEstabelecimento: boolean;
  situacaoPedido: situacaoPedido;
  nomeCliente: string;
  telefoneCliente: string;
  cepCliente: string;
  tipoLogadouroCliente: string;
  logadouroCliente: string;
  numeroCliente: string;
  quadraCliente: string;
  loteCliente: string;
  bairroCliente: string;
  cidadeCliente: string;
  estadoCliente: string;
  valorTotalPedido: number;
  createdAt: string;
  updatedAt: string;
  FormaPagamento?: FormaPagamento; // Relação opcional com o tipo FormaPagamento
  itensPedido?: ItemPedido[]; // Relação opcional com o tipo ItemPedido
}

export interface ItemPedido {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  createdAt: string;
  updatedAt: string;
  produto?: Produto;
  subItensPedido?: SubItemPedido[];  // novo relacionamento opcional
}

export interface ProdutoPedidoPayload {
  produtoId: number;
  quantidade: number;
  subProdutos?: SubProdutoPedidoPayload[];  // opcional, lista de subprodutos para esse item
}

export interface SubProdutoPedidoPayload {
  subProdutoId: number;
  quantidade: number;
}
export interface CreatePedidoPayload {
  produtosPedido: ProdutoPedidoPayload[];
  formaPagamento_id: number;
  situacaoPedido: string;
  isRetiradaEstabelecimento: boolean;
  taxaEntrega: number;
  nomeCliente: string;
  telefoneCliente: string;
  cepCliente: string;
  tipoLogadouroCliente: string;
  logadouroCliente: string;
  numeroCliente: string;
  quadraCliente: string;
  loteCliente: string;
  bairroCliente: string;
  cidadeCliente: string;
  estadoCliente: string;
}

export interface UpdatePedidoPayload {
  formaPagamento_id?: number;
  isRetiradaEstabelecimento?: boolean;
  situacaoPedido?: string;
  nomeCliente?: string;
  telefoneCliente?: string;
  cepCliente?: string;
  tipoLogadouroCliente?: string;
  logadouroCliente?: string;
  numeroCliente?: string;
  quadraCliente?: string;
  loteCliente?: string;
  bairroCliente?: string;
  cidadeCliente?: string;
  estadoCliente?: string;
  valorTotalPedido?: number;
}


// --- Menu ---

// A interface do menu é geralmente uma categoria de produto com seus produtos inclusos
export interface Menu extends CategoriaProduto {
  produtos: Produto[];
}

// Tipos para as respostas da API do dashboard
export interface MonthlyRevenueResponse {
  totalRevenue: number;
}

export interface MonthlyOrderCount {
  month: string;
  count: number;
}

export interface PaymentDistribution {
  label: string;
  value: number;
}

export type CartItem = {
  cartItemId: string;
  product: Produto;
  quantity: number;
  selectedSubProducts: SubProduto[];
  unitPriceWithSubProducts: number;
};