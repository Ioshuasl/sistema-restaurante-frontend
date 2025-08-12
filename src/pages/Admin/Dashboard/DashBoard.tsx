import { useState, useEffect } from 'react';
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getTotalOrders, getMonthlyRevenue, getMonthlyOrderCounts, getPaymentMethodDistribution } from '../../../services/dashboardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [rendimentoMensal, setRendimentoMensal] = useState(0);
    const [pedidosMensaisData, setPedidosMensaisData] = useState({
        labels: [] as string[],
        datasets: [{
            label: 'Pedidos',
            data: [] as number[],
            backgroundColor: '#4f46e5',
        }],
    });
    const [formaPagamentoData, setFormaPagamentoData] = useState({
        labels: [] as string[],
        datasets: [{
            data: [] as number[],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
        }],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    totalPedidosData,
                    rendimentoMensalData,
                    pedidosMensais,
                    formaPagamento,
                ] = await Promise.all([
                    getTotalOrders(),
                    getMonthlyRevenue(),
                    getMonthlyOrderCounts(),
                    getPaymentMethodDistribution(),
                ]);

                // Atualiza o estado dos KPIs
                setTotalPedidos(totalPedidosData);
                setRendimentoMensal(rendimentoMensalData.totalRevenue);

                // Processa os dados para o Gráfico de Barras
                const monthlyLabels = pedidosMensais.map((item: any) => {
                    const date = new Date(item.month);
                    return date.toLocaleString('default', { month: 'short' });
                });
                const monthlyCounts = pedidosMensais.map((item: any) => item.count);
                setPedidosMensaisData({
                    labels: monthlyLabels,
                    datasets: [{
                        label: 'Pedidos',
                        data: monthlyCounts,
                        backgroundColor: '#4f46e5',
                    }],
                });

                // Processa os dados para o Gráfico de Pizza
                const paymentLabels = formaPagamento.map((item: any) => item.label);
                const paymentValues = formaPagamento.map((item: any) => item.value);
                setFormaPagamentoData({
                    labels: paymentLabels,
                    datasets: [{
                        data: paymentValues,
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
                    }],
                });

            } catch (err) {
                console.error("Erro ao buscar dados do dashboard:", err);
                setError("Não foi possível carregar os dados do dashboard.");
                toast.error("Erro ao carregar dados do dashboard.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando dados...</p>
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
            <title>Dashboard</title>

            <main className="flex flex-1 bg-gray-100">
                <Sidebar />
                <div className='flex-1 p-6'>

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

                    {/* Cards de KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-gray-500 text-sm font-medium">Total de Pedidos</h2>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{totalPedidos}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-gray-500 text-sm font-medium">Rendimento Mensal</h2>
                            <p className="text-2xl font-bold text-gray-800 mt-2">R$ {rendimentoMensal.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico de Barras */}
                        <div className="bg-white rounded-xl shadow p-6 h-[300px] flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pedidos por Mês</h3>
                            <div className="flex-1">
                                <Bar
                                    data={pedidosMensaisData}
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
            <ToastContainer />
        </div>
    );
}