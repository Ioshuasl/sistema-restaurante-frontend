import { useState, useEffect } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../Components/ToggleSwitch";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { type User, type Cargo, type UpdateUserPayload } from '../../../types/interfaces-types';
import { getUsers, updateUser, deleteUser } from '../../../services/userService';
import { getCargos } from '../../../services/cargoService';

export default function UserManagment() {
    const [users, setUsers] = useState<User[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [searchName, setSearchName] = useState("");
    const [selectedCargo, setSelectedCargo] = useState<number | "">("");

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editedNome, setEditedNome] = useState("");
    const [editedUsername, setEditedUsername] = useState("");
    const [editedCargoId, setEditedCargoId] = useState<number | ''>('');
    const [newPassword, setNewPassword] = useState("");
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    
    // CORREÇÃO: Pega o ID do usuário diretamente do localStorage, sem decodificar o token
    const userString = localStorage.getItem('user');
    let loggedInUserId: number | null = null;
    if (userString) {
        try {
            const userObject = JSON.parse(userString);
            loggedInUserId = userObject.id;
        } catch (error) {
            console.error("Erro ao fazer parse do usuário do localStorage:", error);
        }
    }

    const fetchUsersAndCargos = async () => {
        try {
            setIsLoading(true);
            const [usersData, cargosData] = await Promise.all([
                getUsers(),
                getCargos(),
            ]);
            setUsers(usersData);
            setCargos(cargosData);
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
            setError("Não foi possível carregar os dados.");
            toast.error("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndCargos();
    }, []);

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditedNome(user.nome);
        setEditedUsername(user.username);
        setEditedCargoId(user.cargo_id);
        setNewPassword(''); // Reseta a senha ao abrir o modal
    };

    const handleDeleteClick = async (id: number) => {
        // CORREÇÃO: Usa o loggedInUserId obtido do localStorage
        if (id === loggedInUserId) {
            toast.error("Você não pode excluir sua própria conta.");
            return;
        }

        if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
            try {
                await deleteUser(id);
                toast.success("Usuário excluído com sucesso.");
                fetchUsersAndCargos();
            } catch (err) {
                console.error("Erro ao excluir usuário:", err);
                toast.error("Erro ao excluir o usuário.");
            }
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setIsSubmitting(true);
        
        const payload: UpdateUserPayload = {
            nome: editedNome,
            username: editedUsername,
            cargo_id: Number(editedCargoId),
        };
        
        if (newPassword) {
            payload.password = newPassword;
        }

        try {
            await updateUser(editingUser.id, payload);
            toast.success("Usuário atualizado com sucesso.");
            setEditingUser(null);
            fetchUsersAndCargos();
        } catch (err) {
            console.error("Erro ao salvar edição:", err);
            toast.error("Erro ao salvar as alterações.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCargoName = (id: number) =>
        cargos.find((cargo) => cargo.id === id)?.nome || "Desconhecido";

    const filteredUsers = users.filter((user) => {
        const nameMatch = user.nome
            .toLowerCase()
            .includes(searchName.toLowerCase());
        const cargoMatch =
            selectedCargo === "" ? true : user.cargo_id === selectedCargo;
        return nameMatch && cargoMatch;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando usuários...</p>
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
            <title>Gerenciamento de Usuáros</title>
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
                                        {cargo.nome}
                                    </option>
                                ))}
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
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="border border-gray-300 rounded-md p-4 flex flex-col gap-2"
                                >
                                    <span className="font-semibold">{user.nome.charAt(0).toUpperCase() + user.nome.slice(1)}</span>
                                    <span className="text-gray-600 text-sm">
                                        Cargo: {getCargoName(user.cargo_id)}
                                    </span>
                                    <span className="text-gray-600 text-sm">
                                        Administrador: {user.Cargo.admin ? "Sim" : "Não"}
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
                            ))
                        ) : (
                            <p className="text-gray-500">Nenhum usuário encontrado.</p>
                        )}
                    </div>

                    {/* Modal de Edição */}
                    {editingUser && (
                        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Editar Usuário</h2>
                                    <button onClick={() => setEditingUser(null)}>
                                        <X size={20} className="text-gray-500 hover:text-gray-700" />
                                    </button>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Nome</label>
                                    <input
                                        type="text"
                                        value={editedNome}
                                        onChange={(e) => setEditedNome(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Username</label>
                                    <input
                                        type="text"
                                        value={editedUsername}
                                        onChange={(e) => setEditedUsername(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Cargo</label>
                                    <select
                                        value={editedCargoId}
                                        onChange={(e) => setEditedCargoId(Number(e.target.value))}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    >
                                        <option value="">Selecione um Cargo</option>
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>
                                                {cargo.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Nova Senha (opcional)</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSubmitting}
                                        className={`px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <ToastContainer />
        </div>
    );
}