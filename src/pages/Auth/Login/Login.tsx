import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../services/userService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    // CORREÇÃO: Usando 'username' em vez de 'email' para refletir a API
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Limpa o erro anterior
        setIsSubmitting(true);
        
        // Log para verificação dos dados de login
        console.log("Tentativa de login com:", { username, password });

        try {
            const response = await loginUser({ username, password });

            // Log da resposta de sucesso
            console.log("Login bem-sucedido. Resposta da API:", response);
            
            // Armazenar o token no localStorage para uso futuro
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user)); // Armazena como string JSON
            
            // Exibe mensagem de sucesso e redireciona
            toast.success("Login realizado com sucesso!");
            navigate("/admin/dashboard");

        } catch (err: any) {
            console.error("Erro ao fazer login:", err);
            // Log do erro da API
            if (err.response && err.response.data && err.response.data.message) {
                console.log("Mensagem de erro da API:", err.response.data.message);
                setError(err.response.data.message);
                toast.error(err.response.data.message);
            } else {
                console.log("Erro inesperado:", err);
                setError("Ocorreu um erro. Tente novamente.");
                toast.error("Ocorreu um erro. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Acesso Administrativo
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Usuário
                        </label>
                        <input
                            // CORREÇÃO: Tipo 'text' em vez de 'email'
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && (
                        <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-semibold py-2 rounded-lg transition duration-200 ${
                            isSubmitting
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}