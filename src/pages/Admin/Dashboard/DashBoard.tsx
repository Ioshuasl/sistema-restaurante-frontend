import { useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {

    const pedidosMensais = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
            {
                label: 'Pedidos',
                data: [65, 59, 80, 81, 56, 75],
                backgroundColor: '#4f46e5',
            },
        ],
    };

    const formaPagamentoData = {
        labels: ['Pix', 'Cartão', 'Dinheiro'],
        datasets: [
            {
                data: [45, 35, 20],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
            },
        ],
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Dashboard</title>

            {/* Conteúdo */}
            <main className="flex flex-1 bg-gray-100">
                {/* Sidebar */}
                <Sidebar />
                <div className='flex-1 p-6'>

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

                    {/* Cards de KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-gray-500 text-sm font-medium">Total de Pedidos</h2>
                            <p className="text-2xl font-bold text-gray-800 mt-2">1.245</p>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-gray-500 text-sm font-medium">Rendimento Mensal</h2>
                            <p className="text-2xl font-bold text-gray-800 mt-2">R$ 12.530,00</p>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-gray-500 text-sm font-medium">Clientes Ativos</h2>
                            <p className="text-2xl font-bold text-gray-800 mt-2">342</p>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico de Barras */}
                        <div className="bg-white rounded-xl shadow p-6 h-[300px] flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pedidos por Mês</h3>
                            <div className="flex-1">
                                <Bar
                                    data={pedidosMensais}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        {/* Gráfico de Pizza */}
                        <div className="bg-white rounded-xl shadow p-6 h-[300px] flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Formas de Pagamento</h3>
                            <div className="flex-1">
                                <Pie
                                    data={formaPagamentoData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
