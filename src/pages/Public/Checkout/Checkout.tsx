import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { buscarCEP } from '@/functions/buscarCEP';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importando os tipos centralizados
import {
  type Produto,
  type Config,
  type FormaPagamento,
  type CreatePedidoPayload,
  type ProdutoPedidoPayload
} from "../../../types/interfaces-types";

// Tipos do componente Checkout
type CartItem = {
  product: Produto;
  quantity: number;
};

type Props = {
  cart: CartItem[];
  onConfirm: () => void;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
};

// Importando os serviços
import { getConfig } from '../../../services/configService';
import { getAllFormasPagamento } from '../../../services/formaPagamentoService';
import { createPedido } from '../../../services/pedidoService';


export default function Checkout({
  cart,
  onConfirm,
  onIncrease,
  onDecrease
}: Props) {
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [complemento, setComplemento] = useState('')
  const [retiradaLocal, setRetiradaLocal] = useState(false);
  const [payment, setPayment] = useState<number | ''>('');
  const [paymentMethods, setPaymentMethods] = useState<FormaPagamento[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [taxaEntrega, setTaxaEntrega] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // CORREÇÃO: Converte explicitamente para número para evitar erros de tipo
  const totalProdutos = cart.reduce(
    (acc, item) => acc + Number(item.product.valorProduto) * item.quantity,
    0
  );

  // CORREÇÃO: Converte explicitamente para número para evitar erros de tipo
  const valorTotal = retiradaLocal ? totalProdutos : totalProdutos + Number(taxaEntrega);

  // Efeito para buscar a taxa de entrega e as formas de pagamento
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, methods] = await Promise.all([
          getConfig(),
          getAllFormasPagamento(),
        ]);
        // CORREÇÃO: Converte o valor para Number antes de definir o estado
        setTaxaEntrega(Number(config.taxaEntrega));
        setPaymentMethods(methods);
        console.log("Dados carregados com sucesso. Tipo da taxa de entrega:", typeof Number(config.taxaEntrega), Number(config.taxaEntrega));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    // A validação do formulário permanece a mesma
    if (
      !name ||
      !telefone ||
      !cep ||
      !logradouro ||
      !bairro ||
      !numero ||
      !cidade ||
      !payment
    ) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mapear o carrinho para o formato esperado pela API
      const produtosPedido: ProdutoPedidoPayload[] = cart.map(item => ({
        produtoId: item.product.id,
        quantidade: item.quantity
      }));

      // Montar o objeto de pedido (Payload)
      const orderPayload: CreatePedidoPayload = {
        produtosPedido: produtosPedido,
        formaPagamento_id: Number(payment),
        situacaoPedido: 'preparando', // Status inicial
        isRetiradaEstabelecimento: retiradaLocal,
        nomeCliente: name,
        telefoneCliente: telefone,
        cepCliente: cep,
        tipoLogadouroCliente: 'Não informado', // Pode ser ajustado com um campo no formulário
        logadouroCliente: logradouro,
        numeroCliente: numero,
        quadraCliente: "", // Não há campo específico no formulário
        loteCliente: "", // Não há campo específico no formulário
        bairroCliente: bairro,
        cidadeCliente: cidade,
        estadoCliente: estado,
        taxaentrega: taxaEntrega
      };
      
      console.log("Payload do pedido a ser enviado:", orderPayload);

      const pedido = await createPedido(orderPayload);
      console.log(pedido)

      toast.success('Pedido enviado com sucesso!');
      onConfirm();
      navigate('/pedido-confirmado', { state: { pedidoId: pedido.id } });

    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuscarCEP = async () => {
    const data = await buscarCEP(cep)
    setLogradouro(data.logradouro || "");
    setBairro(data.bairro || "");
    setCidade(data.localidade || "");
    setEstado(data.uf || "") // A API do ViaCEP retorna 'uf'
  }

  // Função auxiliar para verificar o tipo e formatar o valor
  const formatValue = (value: number) => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(2);
    }
    console.error("Erro: valor com formato incorreto. Valor recebido:", value);
    return "Erro: valor está com formato correto";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <title>Checkout</title>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
          Finalizar Pedido
        </h1>

        {/* Resumo do Pedido */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Resumo do Pedido:
          </h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Seu carrinho está vazio.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li
                  key={item.product.id}
                  className="py-4 flex justify-between items-center"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.nomeProduto}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <p className="font-medium text-gray-800">
                      {item.product.nomeProduto}
                    </p>
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
                    R$ {formatValue(Number(item.product.valorProduto) * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className='flex justify-between items-center'>
            <span className="text-lg font-bold text-gray-800">
              SubTotal:
            </span>
            <span className="text-lg font-bold text-gray-800">
              R$ {formatValue(totalProdutos)}
            </span>
          </div>
        </div>

        {/* Formulário */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Nome Completo:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Telefone:
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(99) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">CEP:</label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="00.000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <button
                type="button"
                onClick={handleBuscarCEP}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
              >
                Buscar
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Logradouro:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rua, Avenida, etc."
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Número:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Bairro:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Cidade:
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Estado:
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              />
            </div>
          </div>

          <div>
              <label className="block font-medium text-gray-700 mb-1">
                Complemento:
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quadra, Lote, Ponto de Referência,..."
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Forma de Pagamento:
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={payment}
              onChange={(e) => setPayment(Number(e.target.value))}
            >
              <option value="">Selecione</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.nomeFormaPagamento}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total e Detalhes */}
        {cart.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg">
              <span className="text-lg font-bold text-gray-800">
                Total: R$ {formatValue(valorTotal)}
              </span>
              <button
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="flex items-center text-blue-600 hover:underline"
              >
                {showOrderDetails ? (
                  <>
                    Ocultar Detalhes
                    <ChevronUp className="ml-1 w-5 h-5" />
                  </>
                ) : (
                  <>
                    Ver Detalhes
                    <ChevronDown className="ml-1 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            {showOrderDetails && (
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {formatValue(totalProdutos)}</span>
                </div>
                {!retiradaLocal && (
                  <div className="flex justify-between">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {formatValue(taxaEntrega)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Voltar ao Cardápio
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}