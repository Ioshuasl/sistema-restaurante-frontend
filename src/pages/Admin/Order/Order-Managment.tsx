import { useState, useEffect } from "react";
import { BadgeCheck, Clock, XCircle, Truck, X } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { getAllPedidos, updatePedido } from "../../../services/pedidoService";
import { type Pedido } from "../../../types/interfaces-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderManagment() {
    const [statusFilter, setStatusFilter] = useState<
        "todos" | "preparando" | "entrega" | "finalizado" | "cancelado"
    >("todos");
    const [searchId, setSearchId] = useState("");
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const fetchedOrders = await getAllPedidos();
            console.log(fetchedOrders)
            setOrders(fetchedOrders);
        } catch (err) {
            console.error("Erro ao buscar pedidos:", err);
            setError("Não foi possível carregar os pedidos.");
            toast.error("Erro ao carregar os pedidos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (
        orderId: number,
        newStatus: Pedido["situacaoPedido"]
    ) => {
        try {
            await updatePedido(orderId, { situacaoPedido: newStatus });
            toast.success(`Status do pedido #${orderId} atualizado para ${newStatus}.`);
            fetchOrders(); // Recarrega os pedidos para exibir a alteração
        } catch (err) {
            console.error("Erro ao atualizar o status do pedido:", err);
            toast.error("Erro ao atualizar o status do pedido.");
        }
    };

    const openModal = (order: Pedido) => {
        setSelectedOrder(order);
        console.log(order)
        setIsModalOpen(true);
    };

    const filteredOrders = orders.filter((order) => {
        const matchStatus = statusFilter === "todos" || order.situacaoPedido === statusFilter;
        const matchId = order.id.toString().includes(searchId);
        return matchStatus && matchId;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando pedidos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Pedidos</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />
                <div className="p-6 flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Pedidos</h1>

                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex gap-2 flex-wrap">
                            {["todos", "preparando", "entrega", "finalizado", "cancelado"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status as any)}
                                    className={`px-4 py-1 rounded-full text-sm font-medium border ${statusFilter === status
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "text-gray-600 hover:text-indigo-600 border-gray-300"
                                        } transition`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Buscar por ID do pedido..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="px-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between border border-gray-100 cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <div className="flex flex-col justify-between mb-2">
                                        <h2 className="text-lg font-semibold text-indigo-600">Pedido Nº{order.id}</h2>
                                        {order.situacaoPedido === "preparando" && (
                                            <span className="flex items-center gap-1 text-yellow-600 text-sm">
                                                <Clock size={16} />
                                                Preparando Pedido
                                            </span>
                                        )}
                                        {order.situacaoPedido === "entrega" && (
                                            <span className="flex items-center gap-1 text-blue-600 text-sm">
                                                <Truck size={16} />
                                                Saiu para Entrega
                                            </span>
                                        )}
                                        {order.situacaoPedido === "finalizado" && (
                                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                                <BadgeCheck size={16} />
                                                Finalizado
                                            </span>
                                        )}
                                        {order.situacaoPedido === "cancelado" && (
                                            <span className="flex items-center gap-1 text-red-600 text-sm">
                                                <XCircle size={16} />
                                                Cancelado
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>Cliente:</strong> {order.nomeCliente}
                                    </p>

                                    <ul className="mb-3 text-sm text-gray-700">
                                        {order.itenspedidos?.map((item, index) => (
                                            <li key={index}>
                                                - {item.produto?.nomeProduto} x {item.quantidade}
                                            </li>
                                        ))}
                                    </ul>

                                    <p className="text-gray-800 font-semibold mb-3">
                                        Total: R$ {Number(order.valorTotalPedido)?.toFixed(2)}
                                    </p>

                                    <div className="flex justify-between gap-2">
                                        {order.situacaoPedido === "preparando" && (
                                            <>
                                                <button
                                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(order.id, "entrega");
                                                    }}
                                                >
                                                    Saiu para Entrega
                                                </button>
                                                <button
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(order.id, "cancelado");
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                        {order.situacaoPedido === "entrega" && (
                                            <>
                                                <button
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg transition"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(order.id, "finalizado");
                                                    }}
                                                >
                                                    Finalizar
                                                </button>
                                                <button
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(order.id, "cancelado");
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                        {order.situacaoPedido !== "preparando" &&
                                            order.situacaoPedido !== "entrega" && (
                                                <button
                                                    className="w-full bg-gray-200 text-gray-700 text-sm py-2 rounded-lg cursor-not-allowed"
                                                    disabled
                                                >
                                                    Pedido {order.situacaoPedido}
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Nenhum pedido encontrado.</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de Detalhes do Pedido */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative ring ring-gray-200 ring-opacity-50">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-indigo-600">
                            Detalhes do Pedido #{selectedOrder.id}
                        </h2>
                        <div className="space-y-2 text-gray-700">
                            <p>
                                <strong>Cliente:</strong> {selectedOrder.nomeCliente}
                            </p>
                            <p>
                                <strong>Telefone:</strong> {selectedOrder.telefoneCliente}
                            </p>
                            <p>
                                <strong>Endereço:</strong> {selectedOrder.logadouroCliente}, {selectedOrder.numeroCliente} - {selectedOrder.bairroCliente}, {selectedOrder.cidadeCliente} - {selectedOrder.estadoCliente}
                            </p>
                            <p>
                                <strong>Forma de Pagamento:</strong>{" "}
                                {selectedOrder.FormaPagamento?.nomeFormaPagamento}
                            </p>
                            <h3 className="font-semibold mt-4">Itens do Pedido:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {selectedOrder.itenspedidos?.map((item) => (
                                    <li key={item.id}>
                                        {item.quantidade}x {item.produto?.nomeProduto} (R$ {Number(item.precoUnitario)?.toFixed(2)} cada)
                                    </li>
                                ))}
                            </ul>
                            <p className="text-lg font-bold mt-4">
                                Valor Total: R$ {Number(selectedOrder.valorTotalPedido)?.toFixed(2)}
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                                {selectedOrder.situacaoPedido === "preparando" && (
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
                                        onClick={() => handleStatusChange(selectedOrder.id, "entrega")}
                                    >
                                        Saiu para Entrega
                                    </button>
                                )}
                                {selectedOrder.situacaoPedido === "entrega" && (
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition"
                                        onClick={() => handleStatusChange(selectedOrder.id, "finalizado")}
                                    >
                                        Finalizar
                                    </button>
                                )}
                                {(selectedOrder.situacaoPedido === "preparando" || selectedOrder.situacaoPedido === "entrega") && (
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
                                        onClick={() => handleStatusChange(selectedOrder.id, "cancelado")}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}