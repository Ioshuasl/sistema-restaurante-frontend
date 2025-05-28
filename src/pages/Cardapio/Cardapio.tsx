import React, { useState } from 'react';
import './Cardapio.css';

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
        id: 3,
        name: 'Petit Gateau',
        description: 'Bolo fofo de chocolate quente com brigadeiro',
        price: 6.0,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 4,
        name: 'Milk shake de morango',
        description: 'Hmmmmmm.. é muito cremoso',
        price: 7.5,
        image: 'https://via.placeholder.com/150',
      },
    ]
  }
];

type CardapioProps = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  goToCheckout: () => void;
};


export default function Cardapio({ cart, setCart, goToCheckout }: CardapioProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
    <div className="min-h-screen bg-gray-100 scroll-smooth">
      {/* HEADER */}
      <header className="bg-red-600 text-white p-4 text-center text-2xl font-bold shadow-md">
        Cardápio Digital
      </header>

      {/* NAVBAR */}
      <nav className="bg-white shadow sticky top-0 z-30 border-b border-gray-200">
        <ul className="flex justify-center gap-4 py-3 text-sm font-medium text-gray-700">
          {menu.map((category, index) => (
            <li key={index}>
              <a href={`#${category.name}`} className="hover:text-red-600 transition">
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isCartOpen && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 z-50"
          >
            Ver Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        )}

        {menu.map((category, index) => (
          <section
            key={index}
            id={category.name}
            className="my-12 scroll-mt-24"
          >
            <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">{category.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col items-center gap-2"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-32 h-32 object-cover rounded-xl"
                  />
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm text-center">{product.description}</p>
                  <span className="text-red-600 font-bold">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-2 px-4 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* SIDEBAR CARRINHO */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${isCartOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Carrinho</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-600">Seu carrinho está vazio.</p>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <ul className="space-y-3">
                  {cart.map((item) => (
                    <li
                      key={item.product.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                          >
                            -
                          </button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item.product)}
                            className="px-2 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 font-semibold">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 border-t pt-4">
              <div className="text-right font-bold text-lg mb-4">
                Total: R$ {cartTotal.toFixed(2)}
              </div>

              <button
                onClick={goToCheckout}
                disabled={cart.length === 0} // opcional, para só permitir finalizar se tiver itens no carrinho
                className={`mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                Finalizar Pedido
              </button>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
