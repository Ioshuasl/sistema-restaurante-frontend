//Interface para as credenciais enviadas no login.
export interface LoginCredentials {
  username: string;
  password: string;
}


//Interface para a resposta completa do endpoint de login.
export interface LoginResponse {
  message: string;
  user: {
    id: number;
    nome: string;
    username: string;
  };
  token: string;
}

//Interface para os dados de um Cargo.
export interface Cargo {
  id: number;
  nome: string;
  descricao?: string;
}

//Interface representando o objeto de um Usuário, como retornado pela API.
export interface User {
  id: number;
  nome: string;
  username: string;
  cargoId: number;
  Cargo?: Cargo; // O cargo pode ser incluído em algumas requisições
  createdAt?: string;
  updatedAt?: string;
}

//Payload para a criação de um novo usuário.
export interface NewUserPayload {
  nome: string;
  cargoId: number;
  username: string;
  password: string;
}

//Interface representando o objeto de uma Categoria de Produto.
export interface Category {
  id: number;
  nomeCategoriaProduto: string;
}

//Interface representando o objeto de um Produto.
export interface Product {
  id: number;
  nomeProduto: string;
  valorProduto: string;
  isAtivo: boolean;
  categoriaProduto_id: number;
  CategoriaProduto?: Category; // A categoria pode ser incluída
}

//Payload para a criação de um novo produto.
export interface NewProductPayload {
  nomeProduto: string;
  valorProduto: number;
  isAtivo: boolean;
  categoriaProduto_id: number;
}

//Interface representando uma Forma de Pagamento.
export interface FormaPagamento {
  id: number;
  nomeFormaPagamento: string;
}

//Interface para um item individual dentro de um pedido ao ser criado.
export interface PedidoItemPayload {
  produtoId: number;
  quantidade: number;
}

//Payload completo para a criação de um novo pedido.
export interface NewPedidoPayload {
  formaPagamento_id: number;
  isRetiradaEstabelecimento: boolean;
  nomeCliente: string;
  enderecoCliente?: string;
  produtosPedido: PedidoItemPayload[];
}

//Interface para um item de pedido quando retornado pela API.
export interface PedidoItem {
    quantidade: number;
    precoUnitario: string;
    Produto: {
        nomeProduto: string;
    }
}

//Interface representando o objeto de um Pedido completo, como retornado pela API.
export interface Pedido {
    id: number;
    valorTotalPedido: string;
    isRetiradaEstabelecimento: boolean;
    nomeCliente: string;
    enderecoCliente?: string;
    createdAt?: string;
    updatedAt?: string;
    ItemPedidos?: PedidoItem[]; // Itens são incluídos na busca de pedidos
}

//Interface para o objeto de configuração do sistema.
export interface Config {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  tipoLogadouro: string;
  logadouro: string;
  numero: string;
  quadra?: string;
  lote?: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  taxaEntrega: string; // DECIMAL é retornado como string
}
