import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  cart: CartItem[];
  onConfirm: () => void;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
};

export default function Checkout({ cart, onConfirm, onIncrease, onDecrease }: Props) {
  const [name, setName] = useState('');
  const [payment, setPayment] = useState('');
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleSubmit = () => {
    if (!name || !payment) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    onConfirm(); // Limpa carrinho
    navigate('/pedido-confirmado'); // Redireciona para tela de sucesso
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <title>Checkout</title>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Finalizar Pedido</h1>

        {/* Resumo do Pedido */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Resumo do Pedido:</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Seu carrinho está vazio.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.product.id} className="py-4 flex justify-between items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <img src={item.product.image} alt={item.product.name} />
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                      <button
                        onClick={() => onDecrease(item.product.id)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        −
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onIncrease(item.product.id)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-md font-semibold text-gray-700 whitespace-nowrap">
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
              <li className="pt-4 text-right font-bold text-lg text-gray-800">
                Total: R$ {total.toFixed(2)}
              </li>
            </ul>
          )}
        </div>

        {/* Formulário */}
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-1">Nome Completo do Cliente:</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block font-medium text-gray-700 mb-1">Forma de Pagamento:</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">PIX</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Voltar ao Cardápio
          </button>
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Confirmar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
