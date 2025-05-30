import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../Components/ToggleSwitch";

type Cargo = {
    id: number;
    name: string;
};

type User = {
    name: string;
    cpf: string;
    cargoId: number;
    isAdmin: boolean;
    login: string;
    password: string;
};

const cargos: Cargo[] = [
    { id: 1, name: "colaborador" },
    { id: 2, name: "administrador" },
    { id: 3, name: "entregador" },
];

export default function NewUser() {
    const [name, setName] = useState("")
    const [cpf, setCpf] = useState("")
    const [cargoId, setCargoId] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async () => {
        console.log(name)
        console.log(cpf)
        console.log(cargoId)
        console.log(isAdmin)
        console.log(login)
        console.log(password)

        if (!name || !cpf || !cargoId || !login || !password) {
            alert('Preencha todos os campos!');
            return;
        }


        const newUser: User = {
            name,
            cpf,
            cargoId: parseInt(cargoId),
            isAdmin,
            login,
            password
        }

        console.log("Novo usuário cadastrado:", newUser);
        // Aqui você pode chamar a função para salvar no backend ou atualizar o contexto
        alert(`Usuário "${newUser.name}" cadastrado com sucesso!`);
        navigate("/admin/user/consult")
    };

    const handleCancel = () => {
        confirm("deseja realmente cancelar o cadastro do usuário?")
        navigate("/admin/user/consult")
    }


    return (

        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Usuáro</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />

                <div className="flex flex-col flex-1 bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Cadastro de Usuário</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Nome:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">CPF:</label>
                            <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Cargo:</label>
                            <select
                                value={cargoId}
                                onChange={(e) => setCargoId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                {cargos.map((cargo) => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">

                            <label className="block mb-1 font-medium">Aministrador:</label>
                            <ToggleSwitch
                                checked={isAdmin}
                                onChange={() => setIsAdmin(!isAdmin)}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Login:</label>
                            <input
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Senha:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                            >
                                Cadastrar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
