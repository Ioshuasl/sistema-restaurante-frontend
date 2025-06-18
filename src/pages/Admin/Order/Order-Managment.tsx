import { useState, useRef } from "react";
import { BadgeCheck, Clock, XCircle, Truck } from "lucide-react";
import Sidebar from "../Components/Sidebar";

type Order = {
    id: number;
    clientName: string;
    items: { name: string; quantity: number }[];
    total: number;
    status: "preparando" | "entrega" | "finalizado" | "cancelado";
};

export default function OrderManagment() {
    const [statusFilter, setStatusFilter] = useState<"todos" | "preparando" | "entrega" | "finalizado" | "cancelado">("todos");
    const [searchId, setSearchId] = useState("");

    const [orders, setOrders] = useState<Order[]>([
        {
            id: 10,
            clientName: "João Silva",
            items: [
                { name: "Pizza Calabresa", quantity: 1 },
                { name: "Coca-Cola 2L", quantity: 1 },
            ],

            total: 58.9,
            status: "preparando",
        },
        {
            id: 11,
            clientName: "Maria Souza",
            items: [{ name: "Lasanha", quantity: 2 }],
            total: 42.0,
            status: "finalizado",
        },
        {
            id: 12,
            clientName: "Carlos Oliveira",
            items: [{ name: "Hambúrguer", quantity: 2 }],
            total: 32.5,
            status: "entrega",
        },
    ]);

    const handleStatusChange = (orderId: number, newStatus: Order["status"]) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const filteredOrders = orders.filter((order) => {
        const matchStatus = statusFilter === "todos" || order.status === statusFilter;
        const matchId = order.id.toString().includes(searchId);
        return matchStatus && matchId;
    });

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Pedidos</title>
            {/* Sidebar */}

            {/* Conteúdo */}
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />
                <div className="p-6">
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
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between border border-gray-100"
                            >
                                <div className="flex flex-col justify-between mb-2">
                                    <h2 className="text-lg font-semibold text-indigo-600">Pedido Nº{order.id}</h2>
                                    {order.status === "preparando" && (
                                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                                            <Clock size={16} />
                                            Preparando Pedido
                                        </span>
                                    )}
                                    {order.status === "entrega" && (
                                        <span className="flex items-center gap-1 text-blue-600 text-sm">
                                            <Truck size={16} />
                                            Saiu para Entrega
                                        </span>
                                    )}
                                    {order.status === "finalizado" && (
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <BadgeCheck size={16} />
                                            Finalizado
                                        </span>
                                    )}
                                    {order.status === "cancelado" && (
                                        <span className="flex items-center gap-1 text-red-600 text-sm">
                                            <XCircle size={16} />
                                            Cancelado
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Cliente:</strong> {order.clientName}
                                </p>

                                <ul className="mb-3 text-sm text-gray-700">
                                    {order.items.map((item, index) => (
                                        <li key={index}>
                                            - {item.name} x {item.quantity}
                                        </li>
                                    ))}
                                </ul>

                                <p className="text-gray-800 font-semibold mb-3">
                                    Total: R$ {order.total.toFixed(2)}
                                </p>

                                <div className="flex justify-between gap-2">
                                    {order.status === "preparando" && (
                                        <>
                                            <button
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition"
                                                onClick={() =>
                                                    handleStatusChange(order.id, "entrega")
                                                }
                                            >
                                                Saiu para Entrega
                                            </button>
                                            <button
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition"
                                                onClick={() =>
                                                    handleStatusChange(order.id, "cancelado")
                                                }
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                    {order.status === "entrega" && (
                                        <>
                                            <button
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg transition"
                                                onClick={() =>
                                                    handleStatusChange(order.id, "finalizado")
                                                }
                                            >
                                                Finalizar
                                            </button>
                                            <button
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition"
                                                onClick={() =>
                                                    handleStatusChange(order.id, "cancelado")
                                                }
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                    {order.status !== "preparando" &&
                                        order.status !== "entrega" && (
                                            <button
                                                className="w-full bg-gray-200 text-gray-700 text-sm py-2 rounded-lg cursor-not-allowed"
                                                disabled
                                            >
                                                Pedido {order.status}
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
