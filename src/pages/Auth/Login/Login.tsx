import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, setAuthToken } from "@/services/authService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Limpa erros anteriores e ativa o estado de envio
        setError("");
        setIsSubmitting(true);

        try {
            // chama o serviço de login
            const response = await login({ username, password });

            // armazenando o token em local storage
            if (response.token) {
                setAuthToken(response.token); // Configura o token para requisições futuras
                localStorage.setItem('authToken', response.token); // Salva o token para persistir a sessão
            }
            
            toast.success("Login realizado com sucesso!");

            // Redireciona para o dashboard em caso de sucesso
            navigate("/admin/dashboard");

        } catch (err: any) {
            const errorMessage = err.message || "username ou senha inválidos.";
            setError(errorMessage);
            toast.error(errorMessage);
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
                            E-mail
                        </label>
                        <input
                            type="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
}