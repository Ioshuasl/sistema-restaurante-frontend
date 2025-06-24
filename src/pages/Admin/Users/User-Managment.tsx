import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../Components/ToggleSwitch";
import { getAllUsers } from "@/services/userService";
import { getAllCargos } from "@/services/cargoService";

type Cargo = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    cpf: string;
    cargoId: number;
    isAdmin: boolean;
    login: string;
    password: string;
};


export default function UserManagment() {
    const [users, setUsers] = useState<User[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [searchName, setSearchName] = useState("");
    const [searchCpf, setSearchCpf] = useState("");
    const [selectedCargo, setSelectedCargo] = useState<number | "">("");
    const [adminFilter, setAdminFilter] = useState<"all" | "admin" | "notAdmin">(
        "all"
    );

    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editedUser, setEditedUser] = useState<User | null>(null);
    
    const navigate = useNavigate();

    //funcao para puxar os usuários
    async function fetchUsers(){
        try {
            const data = await getAllUsers()
            console.log(data)
            setUsers(data)
        } catch (error) {
            console.error(error)
        }
    }

    //funcao para puxar os cargos
    async function fetchCargos(){
        try {
            const data = await getAllCargos()
            console.log(data)
            setCargos(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchCargos()
        fetchUsers()
    }, [])

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditedUser({ ...user });
    };

    const handleDeleteClick = (id: number) => {
        if (confirm("Tem certeza que deseja excluir este usuário?")) {
            setUsers((prev) => prev.filter((u) => u.id !== id));
        }
    };

    const handleSaveEdit = () => {
        if (editedUser) {
            setUsers((prev) =>
                prev.map((u) => (u.id === editedUser.id ? editedUser : u))
            );
            setEditingUser(null);
            setEditedUser(null);
        }
    };

    const getCargoName = (id: number) =>
        cargos.find((cargo) => cargo.id === id)?.name || "Desconhecido";

    const filteredUsers = users.filter((user) => {
        const nameMatch = user.name
            .toLowerCase()
            .includes(searchName.toLowerCase());
        const cpfMatch = user.cpf.includes(searchCpf);
        const cargoMatch =
            selectedCargo === "" ? true : user.cargoId === selectedCargo;
        const adminMatch =
            adminFilter === "all"
                ? true
                : adminFilter === "admin"
                    ? user.isAdmin
                    : !user.isAdmin;
        return nameMatch && cpfMatch && cargoMatch && adminMatch;
    });

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Usuáro</title>
            <main className="flex flex-1">
                <Sidebar />

                <div className="flex-1 p-6">
                    <h1 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h1>

                    {/* Seção de filtros */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Filtrar por Nome</label>
                            <input
                                type="text"
                                placeholder="Nome"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Filtrar por CPF</label>
                            <input
                                type="text"
                                placeholder="CPF"
                                value={searchCpf}
                                onChange={(e) => setSearchCpf(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">Filtrar por Cargo</label>
                            <select
                                value={selectedCargo}
                                onChange={(e) =>
                                    setSelectedCargo(
                                        e.target.value === "" ? "" : Number(e.target.value)
                                    )
                                }
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Todos</option>
                                {cargos.map((cargo) => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium mb-1">
                                Tipo de Usuário
                            </label>
                            <select
                                value={adminFilter}
                                onChange={(e) =>
                                    setAdminFilter(e.target.value as "all" | "admin" | "notAdmin")
                                }
                                className="border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="all">Todos</option>
                                <option value="admin">Administradores</option>
                                <option value="notAdmin">Não-Administradores</option>
                            </select>
                        </div>
                    </div>

                    <button
                        className="bg-blue-600 mb-4 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => navigate("/admin/user/new")}
                    >
                        Cadastrar Novo Usuário
                    </button>

                    {/* Listagem de usuários */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="border border-gray-300 rounded-md p-4 flex flex-col gap-2"
                            >
                                <span className="font-semibold">{user.name.charAt(0).toUpperCase() + user.name.slice(1)}</span>
                                <span className="text-gray-600 text-sm">CPF: {user.cpf}</span>
                                <span className="text-gray-600 text-sm">
                                    Cargo: {getCargoName(user.cargoId)}
                                </span>
                                <span className="text-gray-600 text-sm">
                                    Administrador: {user.isAdmin ? "Sim" : "Não"}
                                </span>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="p-2 rounded hover:bg-gray-100"
                                        title="Editar"
                                    >
                                        <Pencil className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(user.id)}
                                        className="p-2 rounded hover:bg-gray-100"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Modal de Edição */}
                    {editingUser && editedUser && (
                        <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-100 md:max-w-auto overflow-y-auto max-h-[90vh]">
                                <h2 className="text-xl font-semibold mb-4">Editar Usuário</h2>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Nome</label>
                                    <input
                                        type="text"
                                        value={editedUser.name}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, name: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">CPF</label>
                                    <input
                                        type="text"
                                        value={editedUser.cpf}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, cpf: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Cargo</label>
                                    <select
                                        value={editedUser.cargoId}
                                        onChange={(e) =>
                                            setEditedUser({
                                                ...editedUser,
                                                cargoId: Number(e.target.value),
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    >
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>
                                                {cargo.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <label className="block mb-1 font-medium">Aministrador:</label>
                                    <ToggleSwitch
                                        checked={editedUser.isAdmin}
                                        onChange={() =>
                                            setEditedUser({
                                                ...editedUser,
                                                isAdmin: !editedUser.isAdmin,
                                            })
                                        }
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Login</label>
                                    <input
                                        type="text"
                                        value={editedUser.login}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, login: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Senha</label>
                                    <input
                                        type="text"
                                        value={editedUser.password}
                                        onChange={(e) =>
                                            setEditedUser({ ...editedUser, password: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingUser(null);
                                            setEditedUser(null);
                                        }}
                                        className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
