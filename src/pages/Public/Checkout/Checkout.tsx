import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { buscarCEP } from '@/functions/buscarCEP';
import { IMaskInput } from 'react-imask';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OptionsModal from '../Components/OptionsModal';

// Importando os tipos centralizados
import {
    type Produto,
    type Config,
    type FormaPagamento,
    type CreatePedidoPayload,
    type ProdutoPedidoPayload,
    type SubProduto
} from "../../../types/interfaces-types";

// Importando os serviços
import { getConfig } from '../../../services/configService';
import { getAllFormasPagamento } from '../../../services/formaPagamentoService';
import { createPedido } from '../../../services/pedidoService';


export type CartItem = {
    cartItemId: string;
    product: Produto;
    quantity: number;
    selectedSubProducts: SubProduto[];
    unitPriceWithSubProducts: number;
};

type Props = {
    cart: CartItem[];
    onConfirm: () => void;
    onIncrease: (cartItemId: string) => void;
    onDecrease: (cartItemId: string) => void;
    onUpdateItem: (cartItemId: string, newConfig: { product: Produto, subProducts: SubProduto[], quantity: number }) => void;
};


export default function Checkout({
    cart,
    onConfirm,
    onIncrease,
    onDecrease,
    onUpdateItem
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

    // Estado para controlar o modal de edição
    const [itemToEdit, setItemToEdit] = useState<CartItem | null>(null);

    const navigate = useNavigate();

    const totalProdutos = cart.reduce(
        (acc, item) => acc + item.unitPriceWithSubProducts * item.quantity,
        0
    );

    const valorTotal = retiradaLocal ? totalProdutos : totalProdutos + Number(taxaEntrega);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [config, methods] = await Promise.all([
                    getConfig(),
                    getAllFormasPagamento(),
                ]);
                setTaxaEntrega(Number(config.taxaEntrega));
                setPaymentMethods(methods);
            } catch (error) {
                toast.error("Erro ao carregar dados. Tente novamente.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!name || !telefone || (!retiradaLocal && (!cep || !logradouro || !bairro || !numero || !cidade)) || !payment) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const produtosPedido: ProdutoPedidoPayload[] = cart.map(item => ({
                produtoId: item.product.id,
                quantidade: item.quantity,
                subProdutos: item.selectedSubProducts.map(sp => ({
                    subProdutoId: sp.id,
                    // Assumindo que a quantidade de um subproduto é sempre 1
                    quantidade: 1
                }))
            }));

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
                taxaEntrega: taxaEntrega
            };

            console.log(orderPayload)

            const pedido = await createPedido(orderPayload);

            toast.success('Pedido enviado com sucesso!');
            onConfirm();
            navigate('/pedido-confirmado', { state: { pedidoId: pedido.id } });

        } catch (error) {
            toast.error('Erro ao enviar pedido. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBuscarCEP = async () => {
        const data = await buscarCEP(cep);
        setLogradouro(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
    }

    const handleSaveEdit = (product: Produto, subProducts: SubProduto[], quantity: number) => {
        if (itemToEdit) {
            onUpdateItem(itemToEdit.cartItemId, { product, subProducts, quantity });
        }
    };

    const formatValue = (value: number) => {
        if (typeof value === 'number' && !isNaN(value)) {
            return value.toFixed(2).replace('.', ',');
        }
        return "0,00";
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

                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">
                        Resumo do Pedido:
                    </h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-500">Seu carrinho está vazio.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {cart.map((item) => (
                                <li key={item.cartItemId} className="py-4 flex justify-between items-start">
                                    <div className="flex items-start gap-4 flex-1">
                                        <img src={item.product.image} alt={item.product.nomeProduto} className="w-16 h-16 object-cover rounded" />
                                        <div>
                                            <p className="font-medium text-gray-800">{item.product.nomeProduto}</p>
                                            {item.selectedSubProducts.length > 0 && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {item.selectedSubProducts.map(sp => (
                                                        <p key={sp.id}>+ {sp.nomeSubProduto}</p>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button onClick={() => onDecrease(item.cartItemId)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">−</button>
                                                <span className="font-medium">{item.quantity}</span>
                                                <button onClick={() => onIncrease(item.cartItemId)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-md font-semibold text-gray-700 whitespace-nowrap">
                                            R$ {formatValue(item.unitPriceWithSubProducts * item.quantity)}
                                        </p>
                                        <button onClick={() => setItemToEdit(item)} className="text-xs text-blue-600 hover:underline mt-2 flex items-center gap-1">
                                            <Edit size={12} /> Editar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className='flex justify-between items-center mt-4 pt-4 border-t'>
                        <span className="text-lg font-bold text-gray-800">SubTotal:</span>
                        <span className="text-lg font-bold text-gray-800">R$ {formatValue(totalProdutos)}</span>
                    </div>
                </div>

                <div className="mb-6 space-y-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Nome Completo:</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Digite seu nome" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Telefone:</label>
                        <IMaskInput mask="(00) 00000-0000" type="tel" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="(99) 99999-9999" value={telefone} onAccept={(value) => setTelefone(value)} />
                    </div>
                    <div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={retiradaLocal} onChange={(e) => setRetiradaLocal(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                            <span>Vou retirar no estabelecimento</span>
                        </label>
                    </div>
                    {!retiradaLocal && (
                        <>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">CEP:</label>
                                <div className="flex items-center">
                                    <IMaskInput mask="00000-000" type="text" placeholder="00000-000" value={cep} onAccept={(value) => setCep(value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                                    <button type="button" onClick={handleBuscarCEP} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition">Buscar</button>
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Logradouro:</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rua, Avenida, etc." value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Número:</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Bairro:</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Cidade:</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Estado:</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Complemento:</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Quadra, Lote, Ponto de Referência,..." value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Forma de Pagamento:</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={payment} onChange={(e) => setPayment(Number(e.target.value))}>
                            <option value="">Selecione</option>
                            {paymentMethods.map((method) => (<option key={method.id} value={method.id}>{method.nomeFormaPagamento}</option>))}
                        </select>
                    </div>
                </div>

                {cart.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg">
                            <span className="text-lg font-bold text-gray-800">Total: R$ {formatValue(valorTotal)}</span>
                            <button onClick={() => setShowOrderDetails(!showOrderDetails)} className="flex items-center text-blue-600 hover:underline">
                                {showOrderDetails ? (<>Ocultar Detalhes <ChevronUp className="ml-1 w-5 h-5" /></>) : (<>Ver Detalhes <ChevronDown className="ml-1 w-5 h-5" /></>)}
                            </button>
                        </div>
                        {showOrderDetails && (
                            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 space-y-2">
                                <div className="flex justify-between"><span>Subtotal:</span><span>R$ {formatValue(totalProdutos)}</span></div>
                                {!retiradaLocal && (<div className="flex justify-between"><span>Taxa de Entrega:</span><span>R$ {formatValue(taxaEntrega)}</span></div>)}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-4 mt-6">
                    <button onClick={() => navigate('/')} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition">Voltar ao Cardápio</button>
                    <button onClick={handleSubmit} disabled={isSubmitting || cart.length === 0} className={`w-full py-2 rounded-lg font-semibold transition ${isSubmitting || cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                        {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
                    </button>
                </div>
            </div>

            {itemToEdit && (
                <OptionsModal
                    product={itemToEdit.product}
                    initialItem={itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    onSave={handleSaveEdit}
                />
            )}

            <ToastContainer />
        </div>
    );
}