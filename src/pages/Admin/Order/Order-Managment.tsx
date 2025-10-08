import { useState, useEffect } from "react";
import { BadgeCheck, Clock, XCircle, Truck, X, Printer } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { getAllPedidos, updatePedido } from "../../../services/pedidoService";
import { getConfig } from "../../../services/configService";
import { getAllFormasPagamento } from "../../../services/formaPagamentoService";
import { type Pedido, type FormaPagamento } from "../../../types/interfaces-types";
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
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [taxaEntrega, setTaxaEntrega] = useState(0);
    const [razaoSocial, setRazaoSocial] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const [fetchedOrders, config, formasPagamentoData] = await Promise.all([
                getAllPedidos(),
                getConfig(),
                getAllFormasPagamento(),
            ]);
            setOrders(fetchedOrders);
            setTaxaEntrega(config.taxaEntrega);
            setRazaoSocial(config.razaoSocial);
            setCnpj(config.cnpj);
            setFormasPagamento(formasPagamentoData);
        } catch (err) {
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
            fetchOrders();
        } catch (err) {
            toast.error("Erro ao atualizar o status do pedido.");
        }
    };

    const openModal = (order: Pedido) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const openReceiptModal = (e: React.MouseEvent | null, order: Pedido) => {
        if (e) e.stopPropagation();
        setSelectedOrder(order);
        setIsReceiptModalOpen(true);
    }

    const handlePrintReceipt = (order: Pedido) => {
        const subtotal = calculateSubtotal(order);
        const total = subtotal + Number(taxaEntrega);

        const itemsHtml = order.itensPedido?.map(item => {
            let itemHtml = `
              <div class="item">
                  <span>${item.quantidade}x ${item.produto?.nomeProduto}</span>
                  <span>R$ ${(Number(item.precoUnitario) * item.quantidade)?.toFixed(2).replace('.', ',')}</span>
              </div>
            `;
            if (item.subItensPedido && item.subItensPedido.length > 0) {
                item.subItensPedido.forEach(subItem => {
                    itemHtml += `
                      <div class="sub-item">
                          <span>&nbsp;&nbsp;&nbsp;- ${subItem.nomeSubProduto}</span>
                          <span>+ R$ ${Number(subItem.valorAdicional)?.toFixed(2).replace('.', ',')}</span>
                      </div>
                    `;
                });
            }
            return itemHtml;
        }).join('');

        const receiptHtml = `
          <!DOCTYPE html>
          <html>
          <head>
              <title>Recibo de Pedido #${order.id}</title>
              <style>
                  body { font-family: 'Courier New', Courier, monospace; font-size: 14px; width: 80mm; margin: 0 auto; padding: 10px; }
                  .container { width: 100%; }
                  .header, .footer { text-align: center; margin-bottom: 10px; }
                  .divider { border-top: 1px dashed #000; margin: 10px 0; }
                  .item, .totals, .sub-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                  .sub-item { color: #555; font-size: 13px; padding-left: 10px; }
                  .totals { font-weight: bold; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2>RECIBO DE PEDIDO</h2>
                      <p>ID do Pedido: #${order.id}</p>
                      <p>Data: ${new Date(order.createdAt).toLocaleDateString()}</p>
                      <p>Hora: ${new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div class="divider"></div>
                  <div class="info">
                      <p><strong>${razaoSocial}</strong></p>
                      <p>CNPJ: ${cnpj}</p>
                  </div>
                  <div class="divider"></div>
                  <div class="info">
                      <p>Cliente: ${order.nomeCliente}</p>
                      <p>Telefone: ${order.telefoneCliente}</p>
                      <p>Pagamento: ${getPaymentMethodName(order.formaPagamento_id)}</p>
                  </div>
                  <div class="divider"></div>
                  <div class="items">
                      <h3>ITENS:</h3>
                      ${itemsHtml}
                  </div>
                  <div class="divider"></div>
                  <div class="totals-section">
                      <div class="totals"><span>Subtotal:</span><span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span></div>
                      <div class="totals"><span>Taxa de Entrega:</span><span>R$ ${Number(taxaEntrega)?.toFixed(2).replace('.', ',')}</span></div>
                      <div class="totals"><span>TOTAL:</span><span>R$ ${total.toFixed(2).replace('.', ',')}</span></div>
                  </div>
                  <div class="divider"></div>
                  <div class="footer"><p>Obrigado pelo seu pedido!</p></div>
              </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '', 'width=302'); // 80mm width in pixels approx.
        if (printWindow) {
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    const calculateSubtotal = (order: Pedido) => {
        return order.itensPedido?.reduce((sum, item) => sum + Number(item.precoUnitario) * item.quantidade, 0) || 0;
    };

    const getPaymentMethodName = (formaPagamentoId: number | null | undefined) => {
        const forma = formasPagamento.find(fp => fp.id === formaPagamentoId);
        return forma ? forma.nomeFormaPagamento : "Não informado";
    }

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
            <main className="flex flex-1 bg-gray-100 print:hidden">
                <Sidebar />
                <div className="p-6 flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Pedidos</h1>

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
                                            <span className="flex items-center gap-1 text-yellow-600 text-sm"><Clock size={16} /> Preparando Pedido</span>
                                        )}
                                        {order.situacaoPedido === "entrega" && (
                                            <span className="flex items-center gap-1 text-blue-600 text-sm"><Truck size={16} /> Saiu para Entrega</span>
                                        )}
                                        {order.situacaoPedido === "finalizado" && (
                                            <span className="flex items-center gap-1 text-green-600 text-sm"><BadgeCheck size={16} /> Finalizado</span>
                                        )}
                                        {order.situacaoPedido === "cancelado" && (
                                            <span className="flex items-center gap-1 text-red-600 text-sm"><XCircle size={16} /> Cancelado</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1"><strong>Cliente:</strong> {order.nomeCliente}</p>
                                    <ul className="mb-3 text-sm text-gray-700">
                                        {order.itensPedido?.map((item, index) => (
                                            <li key={index}>
                                                - {item.produto?.nomeProduto} x {item.quantidade}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-gray-800 font-semibold mb-3">Total: R$ {Number(order.valorTotalPedido)?.toFixed(2)}</p>
                                    <div className="flex justify-between items-center gap-2">
                                        <div className="flex-grow flex gap-2">
                                            {order.situacaoPedido === "preparando" && (
                                                <>
                                                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition" onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, "entrega"); }}>Saiu para Entrega</button>
                                                    <button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition" onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, "cancelado"); }}>Cancelar</button>
                                                </>
                                            )}
                                            {order.situacaoPedido === "entrega" && (
                                                <>
                                                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg transition" onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, "finalizado"); }}>Finalizar</button>
                                                    <button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition" onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, "cancelado"); }}>Cancelar</button>
                                                </>
                                            )}
                                            {order.situacaoPedido !== "preparando" && order.situacaoPedido !== "entrega" && (
                                                <button className="w-full bg-gray-200 text-gray-700 text-sm py-2 rounded-lg cursor-not-allowed" disabled>Pedido {order.situacaoPedido}</button>
                                            )}
                                        </div>
                                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg transition" onClick={(e) => openReceiptModal(e, order)}>
                                            <Printer size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-full">Nenhum pedido encontrado.</p>
                        )}
                    </div>
                </div>
            </main>

            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative ring ring-gray-200 ring-opacity-50">
                        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setIsModalOpen(false)}>
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-indigo-600">Detalhes do Pedido #{selectedOrder.id}</h2>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Cliente:</strong> {selectedOrder.nomeCliente}</p>
                            <p><strong>Telefone:</strong> {selectedOrder.telefoneCliente}</p>
                            <p><strong>Endereço:</strong> {selectedOrder.logadouroCliente}, {selectedOrder.numeroCliente} - {selectedOrder.bairroCliente}, {selectedOrder.cidadeCliente} - {selectedOrder.estadoCliente}</p>
                            <p><strong>Forma de Pagamento:</strong> {getPaymentMethodName(selectedOrder.formaPagamento_id)}</p>
                            <h3 className="font-semibold pt-2">Itens do Pedido:</h3>
                            <ul className="list-disc list-inside space-y-2">
                                {selectedOrder.itensPedido?.map((item) => (
                                    <li key={item.id}>
                                        {item.quantidade}x {item.produto?.nomeProduto} (R$ {Number(item.precoUnitario)?.toFixed(2)} cada)
                                        {item.subItensPedido && item.subItensPedido.length > 0 && (
                                            <ul className="list-['-_'] list-inside pl-4 text-sm text-gray-600">
                                                {item.subItensPedido.map(subItem => (
                                                    <li key={subItem.id}>{subItem.nomeSubProduto} (+ R$ {Number(subItem.valorAdicional)?.toFixed(2)})</li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-lg font-bold pt-2">Valor Total: R$ {Number(selectedOrder.valorTotalPedido)?.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            {selectedOrder.situacaoPedido === "preparando" && (<button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition" onClick={() => handleStatusChange(selectedOrder.id, "entrega")}>Saiu para Entrega</button>)}
                            {selectedOrder.situacaoPedido === "entrega" && (<button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition" onClick={() => handleStatusChange(selectedOrder.id, "finalizado")}>Finalizar</button>)}
                            {(selectedOrder.situacaoPedido === "preparando" || selectedOrder.situacaoPedido === "entrega") && (<button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition" onClick={() => handleStatusChange(selectedOrder.id, "cancelado")}>Cancelar</button>)}
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition" onClick={() => openReceiptModal(null, selectedOrder)}>Imprimir Recibo</button>
                        </div>
                    </div>
                </div>
            )}

            {isReceiptModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative ring ring-gray-200 ring-opacity-50">
                         <div className="text-center mb-4">
                            <h2 className="text-xl font-bold">Recibo Pedido #{selectedOrder.id}</h2>
                            <p className="text-sm text-gray-600">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="mb-4 text-center">
                            <h3 className="font-bold">{razaoSocial}</h3>
                            <p className="text-sm text-gray-600">CNPJ: {cnpj}</p>
                        </div>
                        <div className="mb-4 border-b border-dashed border-gray-400 pb-2">
                            <h3 className="font-semibold text-gray-800">Cliente: {selectedOrder.nomeCliente}</h3>
                            <p className="text-sm text-gray-600">Telefone: {selectedOrder.telefoneCliente}</p>
                            <p className="text-sm text-gray-600">Pagamento: {getPaymentMethodName(selectedOrder.formaPagamento_id)}</p>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-800">Itens:</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                {selectedOrder.itensPedido?.map((item) => (
                                    <li key={item.id} className="flex flex-col">
                                        <div className="flex justify-between">
                                            <span>{item.quantidade}x {item.produto?.nomeProduto}</span>
                                            <span>R$ {(Number(item.precoUnitario) * item.quantidade)?.toFixed(2)}</span>
                                        </div>
                                        {item.subItensPedido && item.subItensPedido.length > 0 && (
                                            <ul className="pl-4 text-xs text-gray-500">
                                                {item.subItensPedido.map(subItem => (
                                                    <li key={subItem.id} className="flex justify-between">
                                                         <span>&nbsp;&nbsp;&nbsp;- {subItem.nomeSubProduto}</span>
                                                         <span>+ R$ {Number(subItem.valorAdicional)?.toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t border-dashed border-gray-400 pt-2 text-gray-800">
                            <div className="flex justify-between mb-1"><span className="font-semibold">Subtotal:</span><span>R$ {Number(calculateSubtotal(selectedOrder))?.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="font-semibold">Taxa de Entrega:</span><span>R$ {Number(taxaEntrega)?.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg mt-1"><span >Total:</span><span>R$ {Number(selectedOrder.valorTotalPedido)?.toFixed(2)}</span></div>
                        </div>
                        <div className="text-center mt-4 text-sm text-gray-500"><p>Obrigado pelo seu pedido!</p></div>
                        <div className="flex justify-end gap-2 mt-4 print:hidden">
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition" onClick={() => setIsReceiptModalOpen(false)}>Fechar</button>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition" onClick={() => handlePrintReceipt(selectedOrder)}>Imprimir</button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}