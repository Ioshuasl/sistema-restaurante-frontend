import React, { useState } from 'react';

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
  goBack: () => void;
};

export default function Checkout({ cart, onConfirm, goBack  }: Props) {
  const [name, setName] = useState('');
  const [payment, setPayment] = useState('');

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleSubmit = () => {
    if (!name || !payment) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    alert('Pedido confirmado com sucesso!');
    onConfirm(); // callback para esvaziar carrinho, etc.
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

        {/* Resumo do Pedido */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Resumo do Pedido:</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Seu carrinho está vazio.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.product.id} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <span className="text-sm text-gray-600">
                      Quantidade: {item.quantity}
                    </span>
                  </div>
                  <p className="font-semibold">
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
              <li className="pt-4 text-right font-bold text-lg">
                Total: R$ {total.toFixed(2)}
              </li>
            </ul>
          )}
        </div>

        {/* Formulário */}
        <div className="mb-6">
          <label className="block font-medium mb-1">Nome do Cliente:</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 mb-4"
            placeholder="Digite seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block font-medium mb-1">Forma de Pagamento:</label>
          <select
            className="w-full border rounded-lg p-2"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">PIX</option>
          </select>
        </div>

        {/* Botão de Confirmar */}
        <div className='flex gap-x-4'>
        <button
            onClick={goBack}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
        >
            Voltar ao Cardápio
        </button>
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
        >
          Confirmar Pedido
        </button>
        </div>
      </div>
    </div>
  );
}
