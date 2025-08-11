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

export interface Produto {
  id: number;
  nomeProduto: string;
  valorProduto: number;
  image: string;
  isAtivo: boolean;
  categoriaProduto_id: number;
  createdAt: string;
  updatedAt: string;
  CategoriaProduto?: CategoriaProduto; // Relação opcional com o tipo CategoriaProduto
  ItemPedidos?: ItemPedido[]; // Relação opcional com o tipo ItemPedido
}

export interface CreateProdutoPayload {
  nomeProduto: string;
  valorProduto: number;
  image: string;
  isAtivo: boolean;
  categoriaProduto_id: number;
}

export interface UpdateProdutoPayload {
  nomeProduto?: string;
  valorProduto?: number;
  image?: string;
  isAtivo?: boolean;
  categoriaProduto_id?: number;
}


// --- Pedido e Itens de Pedido ---

export interface Pedido {
  id: number;
  formaPagamento_id: number;
  isRetiradaEstabelecimento: boolean;
  situacaoPedido: string;
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
  ItemPedidos?: ItemPedido[]; // Relação opcional com o tipo ItemPedido
}

export interface ItemPedido {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  createdAt: string;
  updatedAt: string;
  Produto?: Produto; // Relação opcional com o tipo Produto
}

export interface ProdutoPedidoPayload {
  produtoId: number;
  quantidade: number;
}

export interface CreatePedidoPayload {
  produtosPedido: ProdutoPedidoPayload[];
  formaPagamento_id: number;
  situacaoPedido: string;
  isRetiradaEstabelecimento: boolean;
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