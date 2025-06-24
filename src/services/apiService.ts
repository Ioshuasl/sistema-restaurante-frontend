import axios from 'axios';

// Instância axios

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3300/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Ocorreu um erro de comunicação com o servidor.';
    
    if (error.response?.data) {
      const errorData = error.response.data as any;
      // Pega a mensagem de erro específica do backend, se disponível.
      errorMessage = errorData.message || 'Erro desconhecido.';
      // Adiciona detalhes da validação se existirem.
      if (errorData.details) {
        errorMessage += ` Detalhes: ${errorData.details.join(', ')}`;
      }
    }
    
    // Lança um novo erro com a mensagem tratada para o componente/hook capturar.
    return Promise.reject(new Error(errorMessage));
  }
);

export default api
/*
export const apiService = {

  //congiura o token no cabeçalho da autorização para todas as requisições futuras
  setAuthToken: (token: string | null): void => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  //Autenticação
  auth: {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await api.post<LoginResponse>('/login', credentials);
      return response.data;
    },
  },

  //Users
  users: {
    getAll: async (): Promise<User[]> => {
      const response = await api.get<User[]>('/user');
      return response.data;
    },
    getById: async (id: number): Promise<User> => {
      const response = await api.get<User>(`/user/${id}`);
      return response.data;
    },
    create: async (userData: NewUserPayload): Promise<User> => {
      const response = await api.post<User>('/user', userData);
      return response.data;
    },
    update: async (id: number, updateData: Partial<NewUserPayload>): Promise<User> => {
        const response = await api.put<User>(`/user/${id}`, updateData);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/user/${id}`);
    },
  },

  //Produtos
  products: {
    getAll: async (): Promise<Product[]> => {
      const response = await api.get<Product[]>('/produto');
      return response.data;
    },
    getById: async (id: number): Promise<Product> => {
        const response = await api.get<Product>(`/produto/${id}`);
        return response.data;
    },
    create: async (productData: NewProductPayload): Promise<Product> => {
      const response = await api.post<Product>('/produto', productData);
      return response.data;
    },
    update: async (id: number, updateData: Partial<NewProductPayload>): Promise<Product> => {
        const response = await api.put<Product>(`/produto/${id}`, updateData);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/produto/${id}`);
    },
    toggleIsActive: async (id: number): Promise<Product> => {
      const response = await api.put<Product>(`/produto/${id}/toggle`);
      return response.data;
    },
  },

  //Pedidos
  pedidos: {
    create: async (pedidoData: NewPedidoPayload): Promise<Pedido> => {
      const response = await api.post<Pedido>('/pedido', pedidoData);
      return response.data;
    },
    getAll: async (): Promise<Pedido[]> => {
        const response = await api.get<Pedido[]>('/pedido');
        return response.data;
    },
  },

  //Cargos
  cargos: {
    getAll: async (): Promise<Cargo[]> => {
        const response = await api.get<Cargo[]>('/cargos');
        return response.data;
    },
    getById: async (id: number): Promise<Cargo> => {
        const response = await api.get<Cargo>(`/cargos/${id}`);
        return response.data;
    },
    create: async (cargoData: { nome: string; descricao?: string }): Promise<Cargo> => {
        const response = await api.post<Cargo>('/cargos', cargoData);
        return response.data;
    },
    update: async (id: number, cargoData: { nome?: string; descricao?: string }): Promise<Cargo> => {
        const response = await api.put<Cargo>(`/cargos/${id}`, cargoData);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
      await api.delete(`/cargos/${id}`);
    },
  },
  
  //Categorias de Produto
  categories: {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categoriaProduto');
        return response.data;
    },
    create: async (categoryData: { nomeCategoriaProduto: string }): Promise<Category> => {
        const response = await api.post<Category>('/categoriaProduto', categoryData);
        return response.data;
    },
    update: async (id: number, categoryData: { nomeCategoriaProduto: string }): Promise<{ message: string }> => {
        const response = await api.put(`/categoriaProduto/${id}`, categoryData);
        return response.data;
    },
    delete: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete(`/categoriaProduto/${id}`);
        return response.data;
    },
  },

  //Formas de Pagamento
  paymentMethods: {
    getAll: async (): Promise<FormaPagamento[]> => {
        const response = await api.get<FormaPagamento[]>('/formaPagamento');
        return response.data;
    },
    create: async (paymentMethodData: { nomeFormaPagamento: string }): Promise<any> => {
        const response = await api.post('/formaPagamento', paymentMethodData);
        return response.data;
    },
    update: async (id: number, paymentMethodData: { nomeFormaPagamento: string }): Promise<any> => {
        const response = await api.put(`/formaPagamento/${id}`, paymentMethodData);
        return response.data;
    },
    delete: async (id: number): Promise<any> => {
        const response = await api.delete(`/formaPagamento/${id}`);
        return response.data;
    },
  },

  //Configuração
  config: {
    get: async (): Promise<Config> => {
        const response = await api.get<Config>('/config');
        return response.data;
    },
    update: async (configData: Partial<Config>): Promise<Config> => {
        const response = await api.put<Config>('/config', configData);
        return response.data;
    },
  },
};
*/