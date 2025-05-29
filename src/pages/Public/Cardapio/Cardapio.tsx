import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

type Category = {
  name: string;
  products: Product[];
};

type CartItem = {
  product: Product;
  quantity: number;
};

type CardapioProps = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

const menu: Category[] = [
  {
    name: 'Lanches',
    products: [
      {
        id: 1,
        name: 'X-Burger',
        description: 'Pão, hambúrguer, queijo, alface e tomate.',
        price: 15.9,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 2,
        name: 'X-Bacon',
        description: 'Pão, hambúrguer, bacon, queijo e alface.',
        price: 18.9,
        image: 'https://via.placeholder.com/150',
      },
    ],
  },
  {
    name: 'Bebidas',
    products: [
      {
        id: 3,
        name: 'Refrigerante Lata',
        description: '350ml - Coca, Pepsi ou Guaraná',
        price: 6.0,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 4,
        name: 'Suco Natural',
        description: 'Laranja, Limão ou Abacaxi',
        price: 7.5,
        image: 'https://via.placeholder.com/150',
      },
    ],
  },
  {
    name: 'Sobremesas',
    products: [
      {
        id: 5,
        name: 'Petit Gateau',
        description: 'Bolo de chocolate quente com brigadeiro',
        price: 12.0,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 6,
        name: 'Milk shake de morango',
        description: 'Hmmmmmm.. é muito cremoso',
        price: 10.5,
        image: 'https://via.placeholder.com/150',
      },
    ],
  },
];

export default function Cardapio({ cart, setCart }: CardapioProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const addToCart = (product: Product) => {
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
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <title>Cardápio Digital</title>
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white py-6 shadow-lg text-center">
        <h1 className="text-3xl font-bold tracking-wide">🍔 Cardápio Digital</h1>
        <p className="text-sm mt-1">Escolha e monte seu pedido de forma rápida e fácil</p>
      </header>

      {/* NAVBAR */}
      <nav className="bg-white shadow-md sticky top-0 z-30 border-b border-gray-200">
        <ul className="flex justify-center gap-6 py-4 font-medium text-gray-700">
          {menu.map((category, index) => (
            <li key={index}>
              <a
                href={`#${category.name}`}
                className="hover:text-red-600 transition duration-200"
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* BOTÃO FLOTANTE DO CARRINHO */}
        {!isCartOpen && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-full shadow-xl hover:bg-red-700 transition z-50"
          >
            🛒 Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        )}

        {/* LISTAGEM DE CATEGORIAS */}
        {menu.map((category, index) => (
          <section key={index} id={category.name} className="mb-16 scroll-mt-32">
            <h2 className="text-2xl font-bold mb-6 text-red-600 border-b pb-2">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-xl transition"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-32 h-32 object-cover rounded-xl mb-3"
                  />
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                  <p className="text-red-600 font-bold text-lg mt-2">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
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
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"                    >
                      −
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"                      >
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
    </div>
  );
}
