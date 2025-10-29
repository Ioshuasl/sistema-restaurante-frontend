// src/types/interfaces-types.ts

// --- Autenticação e Usuário ---
// (Sem alterações nesta seção)
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
  password?: string;
  createdAt: string;
  updatedAt: string;
  Cargo: Cargo;
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
// (Sem alterações nesta seção)
export interface Cargo {
  id: number;
  nome: string;
  descricao: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  Users?: User[];
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
// (Sem alterações nesta seção)
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
// (Sem alterações nesta seção)
export interface FormaPagamento {
  id: number;
  nomeFormaPagamento: string;
  createdAt: string;
  updatedAt: string;
  Pedidos?: Pedido[];
}

export interface CreateFormaPagamentoPayload {
  nomeFormaPagamento: string;
}

export interface UpdateFormaPagamentoPayload {
  nomeFormaPagamento?: string;
}


// --- Produto e Categoria de Produto (SEÇÃO REFATORADA) ---

export interface CategoriaProduto {
  id: number;
  nomeCategoriaProduto: string;
  createdAt: string;
  updatedAt: string;
  Produtos?: Produto[];
}

export interface CreateCategoriaProdutoPayload {
  nomeCategoriaProduto: string;
}

export interface UpdateCategoriaProdutoPayload {
  nomeCategoriaProduto?: string;
}

// --- REMOVIDAS ---
// export interface SubProduto { ... }
// export interface SubItemPedido { ... }
// export interface CreateSubProdutoPayload { ... }
// export interface UpdateSubProdutoPayload { ... }

// --- NOVAS INTERFACES (backend response) ---

// O item individual (Ex: Arroz, Filé de Frango)
export interface IItemOpcao {
  id: number;
  nome: string;
  valorAdicional: number;
  isAtivo: boolean;
  grupoOpcao_id: number;
  createdAt: string;
  updatedAt: string;
}

// O grupo (Ex: Bases, Carnes) que contém os itens
export interface IGrupoOpcao {
  id: number;
  nome: string;
  minEscolhas: number;
  maxEscolhas: number;
  produto_id: number;
  createdAt: string;
  updatedAt: string;
  itens: IItemOpcao[]; // Aninhamento
}

// --- ATUALIZADA ---
// A interface Produto agora tem 'grupos' em vez de 'subprodutos'
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
  grupos?: IGrupoOpcao[]; // <-- MUDANÇA AQUI
}

// --- NOVAS INTERFACES (payload para criar/atualizar produto) ---

export interface IItemOpcaoPayload {
  id?: number; // Opcional (usado no update)
  nome: string;
  valorAdicional: number;
  isAtivo: boolean;
}

export interface IGrupoOpcaoPayload {
  id?: number; // Opcional (usado no update)
  nome: string;
  minEscolhas: number;
  maxEscolhas: number;
  itens: IItemOpcaoPayload[];
}

// --- ATUALIZADA ---
// O payload de criação agora inclui 'grupos'
export interface CreateProdutoPayload {
  nomeProduto: string;
  valorProduto: number;
  image: string;
  isAtivo: boolean;
  categoriaProduto_id: number;
  grupos?: IGrupoOpcaoPayload[]; // <-- MUDANÇA AQUI
}

// --- ATUALIZADA ---
// O payload de atualização agora inclui 'grupos'
export interface UpdateProdutoPayload {
  nomeProduto?: string;
  valorProduto?: number;
  image?: string;
  isAtivo?: boolean;
  categoriaProduto_id?: number;
  grupos?: IGrupoOpcaoPayload[]; // <-- MUDANÇA AQUI
}


// --- Pedido e Itens de Pedido (SEÇÃO REFATORADA) ---

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
  FormaPagamento?: FormaPagamento;
  itensPedido?: ItemPedido[];
}

// --- NOVA INTERFACE (backend response) ---
// O item de opção que foi salvo no pedido (Ex: Arroz, R$ 0.00)
export interface IOpcaoItemPedido {
  id: number;
  itemPedidoId: number;
  itemOpcaoId: number;
  quantidade: number;
  precoAdicional: number;
  ItemOpcao: IItemOpcao; // Inclui o nome e detalhes
}

// --- ATUALIZADA ---
// ItemPedido (response) agora tem 'opcoesPedido' em vez de 'subItensPedido'
export interface ItemPedido {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  createdAt: string;
  updatedAt: string;
  produto?: Produto;
  opcoesPedido?: IOpcaoItemPedido[]; // <-- MUDANÇA AQUI
}

// --- NOVA INTERFACE (payload para criar pedido) ---
// O payload de uma opção escolhida (Ex: { id: 1, qtd: 1 })
export interface IOpcaoItemPedidoPayload {
  itemOpcaoId: number;
  quantidade: number;
}

// --- REMOVIDA ---
// export interface SubProdutoPedidoPayload { ... }

// --- ATUALIZADA ---
// O payload de um produto no pedido
export interface ProdutoPedidoPayload {
  produtoId: number;
  quantidade: number;
  opcoesEscolhidas?: IOpcaoItemPedidoPayload[]; // <-- MUDANÇA AQUI
}

// --- ATUALIZADA ---
// O payload de criação de pedido
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
// (Sem alterações, mas agora `Produto` está atualizado)
export interface Menu extends CategoriaProduto {
  Produtos: Produto[];
}


// --- Dashboard ---
// (Sem alterações)
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

// --- Carrinho (Tipo do Frontend) (SEÇÃO REFATORADA) ---

// --- ATUALIZADA ---
// O item do carrinho
export type CartItem = {
  cartItemId: string; // ID único do item no carrinho
  product: Produto; // O produto principal (Marmita)
  quantity: number; // Quantas marmitas
  opcoesEscolhidas: IOpcaoItemPedidoPayload[]; // As opções (Arroz, Frango...)
  unitPriceWithOptions: number; // O preço final de UMA marmita com suas opções
};