import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import ToggleSwitch from "../Components/ToggleSwitch";
import { Plus, Pencil, X } from "lucide-react";
import { getAllFormasPagamento,updateFormaPagamento,createFormaPagamento,deleteFormaPagamento } from "@/services/formaPagamentoService";

type PaymentMethodType = {
    id: number;
    name: string;
    isAtivo: boolean;
};

export default function PaymentMethod() {
    // Estado das formas de pagamento (mock para teste)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);

    async function fetchPaymentMethods(){
        try {
            const data = await getAllFormasPagamento()
            console.log(data)
            setPaymentMethods(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchPaymentMethods()
    } , [])

    // Filtro
    const [searchName, setSearchName] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [newPaymentName, setNewPaymentName] = useState("");
    const [newPaymentStatus, setNewPaymentStatus] = useState(true);

    // Funções de filtro
    const filteredPaymentMethods = paymentMethods.filter((method) => {
        const matchesName = method.name
            .toLowerCase()
            .includes(searchName.toLowerCase());
        const matchesStatus =
            filterStatus === "todos" ||
            (filterStatus === "ativos" && method.isAtivo) ||
            (filterStatus === "inativos" && !method.isAtivo);
        return matchesName && matchesStatus;
    });

    // Função de adicionar forma de pagamento
    const handleAddPaymentMethod = () => {
        if (newPaymentName.trim() === "") return;
        const newMethod: PaymentMethodType = {
            id: Date.now(),
            name: newPaymentName,
            isAtivo: newPaymentStatus,
        };
        setPaymentMethods([...paymentMethods, newMethod]);
        setNewPaymentName("");
        setNewPaymentStatus(true);
        setShowModal(false);
    };

    // Função de editar forma de pagamento (placeholder)
    const handleEdit = (id: number) => {
        alert(`Editar forma de pagamento ID: ${id}`);
    };

    // Função de excluir forma de pagamento
    const handleDelete = (id: number) => {
        const confirm = window.confirm(
            "Tem certeza que deseja cancelar esta forma de pagamento?"
        );
        if (confirm) {
            setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Forma de Pagamento</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />

                <div className="flex flex-1 p-6">
                    <div className="flex flex-col flex-1 bg-white rounded-lg shadow-lg p-6 mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Formas de Pagamento</h1>

                        {/* Filtro */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Pesquisar por nome..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="todos">Todos</option>
                                <option value="ativos">Somente Ativos</option>
                                <option value="inativos">Somente Inativos</option>
                            </select>
                        </div>

                        <div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Nova Forma de Pagamento
                            </button>
                        </div>

                        {/* Lista de Formas de Pagamento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPaymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className="bg-gray-100 rounded-lg p-4 shadow-md flex flex-col gap-2"
                                >
                                    <h2 className="text-lg font-semibold">{method.name}</h2>
                                    <span
                                        className={`text-sm font-medium ${method.isAtivo ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {method.isAtivo ? "Ativo" : "Inativo"}
                                    </span>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleEdit(method.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                        >
                                            <Pencil size={16} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(method.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                        >
                                            <X size={16} />
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de Cadastro */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.70)] z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            Cadastrar Forma de Pagamento
                        </h2>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">
                                Nome da Forma de Pagamento:
                            </label>
                            <input
                                type="text"
                                placeholder="Digite o nome"
                                value={newPaymentName}
                                onChange={(e) => setNewPaymentName(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">
                                Status:
                            </label>
                            <select
                                value={newPaymentStatus ? "ativo" : "inativo"}
                                onChange={(e) =>
                                    setNewPaymentStatus(e.target.value === "ativo")
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddPaymentMethod}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
