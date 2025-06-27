import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Phone, Loader2 } from 'lucide-react';
import { getConfig } from '@/services/configService';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PedidoConfirmado() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  //usando o location para permitir passar a reposta da requisição POST da tela anterior para essa tela
  //location ajuda bastante a não precisar usar prop ou ter mais trabalho com outras requisições
  const location = useLocation();

  //essa função permite executar a requisição getConfig e extrai apenas o número de telefone
  async function fetchConfig() {
    setIsLoading(true);
    setError(null);
    try {
      const config = await getConfig();
      setWhatsappNumber(config.telefone); 
    } catch (err: any) {
      const errorMessage = err.message || 'Não foi possível carregar as informações de contato.';
      setError(errorMessage);
      
      toast.error(errorMessage);
      
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchConfig();
  }, []);

  const numeroPedido = location.state?.numeroPedido;

  const message = encodeURIComponent(`Olá, acabei de fazer um pedido e tenho uma dúvida. O número do meu pedido é o ${numeroPedido}`);
  
  const renderContactButton = () => {
    if (isLoading) {
      return (
        <button
          disabled
          className="flex items-center justify-center gap-2 bg-gray-200 text-gray-500 font-semibold px-6 py-3 rounded-lg w-full cursor-wait"
        >
          <Loader2 size={20} className="animate-spin" />
          Carregando contato...
        </button>
      );
    }

    // Se houver erro ou não vier número, o botão não é renderizado. O toast já informou o usuário.
    if (error || !whatsappNumber) {
      return null;
    }

    return (
      <a
        href={`https://wa.me/${whatsappNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-white border border-green-600 text-green-700 hover:bg-green-100 font-semibold px-6 py-3 rounded-lg transition duration-200 w-full"
      >
        <Phone size={20} />
        Falar com o Restaurante
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center text-center px-4">
      <title>Pedido Confirmado</title>
      <CheckCircle size={64} className="text-green-600 mb-4" />
      <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
        Pedido Confirmado!
        {numeroPedido && (
            <>
                <br />
                <span className="text-lg md:text-xl font-normal">Nº do Pedido: {numeroPedido}</span>
            </>
        )}
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
        
        {renderContactButton()}
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
}