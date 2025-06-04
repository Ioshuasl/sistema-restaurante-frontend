import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Cargo = {
    id: number;
    name: string;
};

const initialCargos: Cargo[] = [
    { id: 1, name: "colaborador" },
    { id: 2, name: "administrador" },
    { id: 3, name: "entregador" },
];

export default function RoleManagment() {
    const [cargos, setCargos] = useState<Cargo[]>(initialCargos);
    const [filter, setFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCargoName, setNewCargoName] = useState("");
    const [cargoBeingEdited, setCargoBeingEdited] = useState<Cargo | null>(null);
    const [editCargoName, setEditCargoName] = useState("");

    const navigate = useNavigate();

    const filteredCargos = cargos.filter((cargo) =>
        cargo.name.toLowerCase().includes(filter.toLowerCase())
    );

    const handleAddCargo = () => {
        if (!newCargoName.trim()) {
            alert("Digite o nome do cargo!");
            return;
        }

        const newCargo: Cargo = {
            id: cargos.length > 0 ? cargos[cargos.length - 1].id + 1 : 1,
            name: newCargoName.trim()
        };

        setCargos([...cargos, newCargo]);
        setNewCargoName("");
        setIsModalOpen(false);
        alert(`Cargo "${newCargo.name}" cadastrado com sucesso!`);
    };

    const handleDeleteCargo = (id: number) => {
        const confirmDelete = confirm("Tem certeza que deseja excluir este cargo?");
        if (confirmDelete) {
            setCargos(cargos.filter((cargo) => cargo.id !== id));
        }
    };

    const handleEditCargo = (cargo: Cargo) => {
        setCargoBeingEdited(cargo);
        setEditCargoName(cargo.name);
    };

    const handleUpdateCargo = () => {
        if (!editCargoName.trim()) {
            alert("Digite o nome do cargo!");
            return;
        }

        setCargos((prevCargos) =>
            prevCargos.map((c) =>
                c.id === cargoBeingEdited?.id ? { ...c, name: editCargoName.trim() } : c
            )
        );

        setCargoBeingEdited(null);
        setEditCargoName("");
        alert("Cargo atualizado com sucesso!");
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Cargos</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />

                <div className="flex flex-1 p-6">
                    <div className="flex flex-col flex-1 bg-white rounded-lg shadow-lg p-6 mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Cargos</h1>

                        {/* Filtro */}
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Pesquisar Cargo:</label>
                            <input
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Digite o nome do cargo para filtrar"
                            />
                        </div>

                        {/* Botão para abrir o modal */}
                        <div className="mb-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                            >
                                Novo Cargo
                            </button>
                        </div>

                        {/* Lista de Cargos */}
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Cargos Cadastrados:</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {filteredCargos.map((cargo) => (
                                    <li
                                        key={cargo.id}
                                        className="flex flex-col gap-2 border border-gray-300 rounded-md px-3 py-2"
                                    >
                                        <h3 className="text-lg font-semibold">
                                            {cargo.name.charAt(0).toUpperCase() + cargo.name.slice(1)}
                                        </h3>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleEditCargo(cargo)}
                                                className="p-2 rounded hover:bg-gray-100"
                                                title="Editar"
                                            >
                                                <Pencil className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCargo(cargo.id)}
                                                className="p-2 rounded hover:bg-gray-100"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-600" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                {filteredCargos.length === 0 && (
                                    <li className="text-gray-500 italic">
                                        Nenhum cargo encontrado.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Novo Cargo */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.70)] z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Cadastrar Novo Cargo</h2>
                        <input
                            type="text"
                            value={newCargoName}
                            onChange={(e) => setNewCargoName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                            placeholder="Digite o nome do novo cargo"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCargo}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Cargo */}
            {cargoBeingEdited && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Editar Cargo</h2>
                        <input
                            type="text"
                            value={editCargoName}
                            onChange={(e) => setEditCargoName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                            placeholder="Digite o novo nome do cargo"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setCargoBeingEdited(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateCargo}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
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
