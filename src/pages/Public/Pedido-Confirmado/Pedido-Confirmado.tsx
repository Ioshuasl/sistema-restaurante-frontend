import { useNavigate } from 'react-router-dom';
import { CheckCircle, Phone } from 'lucide-react';

export default function PedidoConfirmado() {
  const navigate = useNavigate();

  // Número do restaurante no formato internacional (exemplo BR)
  const whatsappNumber = '5511999999999'; // Troque pelo número real
  const message = encodeURIComponent("Olá, acabei de fazer um pedido e tenho uma dúvida.");
  const numeroPedido = 10246

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center text-center px-4">
      <title>Pedido Confirmado</title>
      <CheckCircle size={64} className="text-green-600 mb-4" />
      <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
        Pedido Confirmado! <br /> Nº do Pedido: {numeroPedido}
      </h1>
      <p className="text-gray-700 mb-6">
        Obrigado pelo seu pedido. Em breve ele estará pronto!
      </p>

      <div className="flex flex-col md:flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 w-full"
        >
          Voltar ao Início
        </button>

        <a
          href={`https://wa.me/${whatsappNumber}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white border border-green-600 text-green-700 hover:bg-green-100 font-semibold px-6 py-3 rounded-lg transition duration-200 w-full"
        >
          <Phone size={20} />
          Falar com o Restaurante
        </a>
      </div>
    </div>
  );
}
