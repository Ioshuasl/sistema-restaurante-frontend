import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu } from '../../../services/menuService'; // Importando a função de serviço
import { type Menu, type Produto } from '../../../types/interfaces-types'; // Importando os tipos
import { Lock, Truck, CookingPotIcon } from 'lucide-react'; // Importando o ícone de cadeado

// O componente agora lida com o estado do menu, carregamento e erros

type CardapioProps = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

type CartItem = {
  product: Produto; // Usando o tipo Produto da API
  quantity: number;
};

export default function Cardapio({ cart, setCart }: CardapioProps) {
  const [menu, setMenu] = useState<Menu[]>([]); // Estado para armazenar o menu da API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // useEffect para buscar os dados do menu quando o componente é montado
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuData = await getMenu();
        setMenu(menuData);
      } catch (err) {
        setError("Não foi possível carregar o cardápio. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []); // O array de dependências vazio garante que a busca ocorra apenas uma vez

  const addToCart = (product: Produto) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.valorProduto * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-gray-700">Carregando cardápio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  const filteredMenu = menu
    .map(category => ({
      ...category,
      produtos: category.produtos.filter(product =>
        product.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.produtos.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col min-h-screen">
      <title>GS Sabores</title>
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white py-6 shadow-lg relative gap-2">
        <div className='flex flex-1 justify-between items-center'>
          <div className='max-w-7xl mx-auto px-4'>
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2 tracking-wide"><CookingPotIcon size={36} /> GS Sabores</h1>
            <p className="text-sm mt-1 flex items-center justify-center gap-2">
              <Truck size={16} color='yellow' /> Entregamos sabor até você!
            </p>
          </div>

          {/* Ícone de cadeado para acesso administrativo */}
          <div>
            <button
              onClick={() => navigate('/login')}
              aria-label="Acesso administrativo"
              className="absolute top-1/2 right-6 -translate-y-1/2 text-white hover:text-gray-200 transition hover:cursor-pointer"
            >
              <Lock size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* NAVBAR */}
      <nav className="bg-white shadow-md sticky top-0 z-30 border-b border-gray-200">
        <ul className="flex justify-center gap-6 py-4 font-medium text-gray-700 overflow-x-auto whitespace-nowrap">
          {menu.map((category) => (
            <li key={category.id}>
              <a
                href={`#${category.nomeCategoriaProduto}`}
                className="hover:text-red-600 transition duration-200"
              >
                {category.nomeCategoriaProduto}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* INPUT DE BUSCA */}
      <div className="px-4 py-4">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>

      {/* MAIN */}
      <main className="w-full px-4 py-8 flex-grow">
        {/* BOTÃO FLOTANTE DO CARRINHO */}
        {!isCartOpen && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-full shadow-xl hover:bg-red-700 transition z-50 hover:cursor-pointer"
          >
            🛒 Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        )}

        {/* LISTAGEM DE CATEGORIAS */}
        {filteredMenu.map((category) => (
          <section key={category.id} id={category.nomeCategoriaProduto} className="mb-16 scroll-mt-32">
            <h2 className="text-2xl font-bold mb-6 text-red-600 border-b pb-2">
              {category.nomeCategoriaProduto}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.produtos.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-xl transition"
                >
                  <img
                    src={product.image}
                    alt={product.nomeProduto}
                    className="w-32 h-32 object-cover rounded-xl mb-3"
                  />
                  <h3 className="text-lg font-semibold">{product.nomeProduto}</h3>
                  {/* A descrição não está no seu tipo de Produto, mas você pode adicionar se precisar */}
                  <p className="text-gray-500 text-sm mt-1">
                    {/* Exemplo de descrição do produto, se disponível */}
                  </p>
                  <p className="text-red-600 font-bold text-lg mt-2">
                    R$ {product.valorProduto}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:cursor-pointer"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* SIDEBAR DO CARRINHO */}
        <aside
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl rounded-l-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="flex justify-between items-center px-6 py-5 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-red-600">🛒</span> Seu Carrinho
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-600 hover:text-red-600 text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Seu carrinho está vazio.</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-4 p-3 shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.nomeProduto}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.nomeProduto}</h3>
                    <p className="text-sm text-gray-500">
                      R$ {(item.product.valorProduto * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      −
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                R$ {cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${cart.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              Finalizar Pedido
            </button>
          </div>
        </aside>

      </main>

      {/* RODAPÉ */}
      <footer className="bg-red-600 text-white text-center">
        <p>© 2025 GS Sabores. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Contato: contato@gssabores.com | (11) 99999-9999</p>
      </footer>
    </div>
  );
}