import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle, Phone } from 'lucide-react';
import { getConfig } from '../../../services/configService';

export default function PedidoConfirmado() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para gerenciar o telefone, carregamento e erros
  const [telefone, setTelefone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtém o ID do pedido do estado de navegação, com um fallback
  const pedidoId = location.state?.pedidoId || 'Não informado';

  // Efeito para buscar as configurações do sistema
  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const config = await getConfig();
        console.log(config.telefone)
        setTelefone(config.telefone); // Atualiza o estado com o telefone da API
      } catch (err) {
        console.error("Erro ao carregar as configurações:", err);
        setError("Não foi possível carregar o telefone do restaurante.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigData();
  }, []);

  // Formata o telefone para ser usado no link do WhatsApp (remove caracteres não numéricos)
  const formatWhatsappNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const formattedPhoneNumber = formatWhatsappNumber(telefone);
  const message = encodeURIComponent(`Olá, acabei de fazer o pedido de Nº ${pedidoId} e tenho uma dúvida.`);

  // Lógicas de renderização
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <p className="text-xl text-green-700">Carregando informações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <p className="text-xl text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center text-center px-4">
      <title>Pedido Confirmado</title>
      <CheckCircle size={64} className="text-green-600 mb-4" />
      <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
        Pedido Confirmado! <br /> Nº do Pedido: {pedidoId}
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
          href={`https://wa.me/55${formattedPhoneNumber}?text=${message}`}
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