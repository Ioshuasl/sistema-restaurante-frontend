
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  Bell,
  Volume2,
  VolumeX,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  FilterX
} from 'lucide-react';
import { getAllPedidos } from '../../../services/pedidoService';
import { type Pedido } from '../../../types';
import OrderList from '../../../components/Admin/Order/OrderList';
import OrderGrid from '../../../components/Admin/Order/OrderGrid';
import OrderDetail from '../../../components/Admin/Order/OrderDetail';
import Sidebar from '../../../components/Admin/Sidebar';
import DateRangePicker from '../../../components/Common/DateRangePicker';
import { toast } from 'react-toastify';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';
const VIEW_MODE_KEY = 'gs-sabores-order-view-mode';
const ITEMS_PER_PAGE = 8;

export default function OrderManagment({ isDarkMode, toggleTheme }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [silentLoading, setSilentLoading] = useState(false);
  
  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Estados de Visualização com Persistência
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return (saved as 'table' | 'grid') || 'grid';
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const lastOrderIds = useRef<Set<number>>(new Set());
  const isInitialLoad = useRef(true);

  // Salvar preferência de visualização
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    localStorage.setItem(UNREAD_ORDERS_KEY, 'false');
    window.dispatchEvent(new Event('storage-update'));
    setHasUnread(false);
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) { console.error(e); }
  }, [soundEnabled]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (silent) setSilentLoading(true);
    else setLoading(true);

    try {
      const data = await getAllPedidos();
      const ordersArray = Array.isArray(data) ? data : (data as any).rows || [];
      const sorted = [...ordersArray].sort((a, b) => Number(b.id) - Number(a.id));

      const currentIds = new Set(sorted.map(p => p.id));
      
      if (!isInitialLoad.current && lastOrderIds.current.size > 0) {
        const newOrders = sorted.filter(p => !lastOrderIds.current.has(p.id));
        if (newOrders.length > 0) {
          playNotificationSound();
          toast.info('🔔 Novo pedido recebido!', { autoClose: 5000 });
          localStorage.setItem(UNREAD_ORDERS_KEY, 'true');
          window.dispatchEvent(new Event('storage-update'));
          setHasUnread(true);
        }
      }

      lastOrderIds.current = currentIds;
      isInitialLoad.current = false;
      setPedidos(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setSilentLoading(false);
    }
  }, [playNotificationSound]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Lógica de Filtragem Multi-Critério
  const filteredPedidos = useMemo(() => {
    return pedidos.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        p.nomeCliente?.toLowerCase().includes(term) || 
        p.id.toString().includes(term) ||
        p.telefoneCliente?.includes(term);

      const matchesStatus = statusFilter === 'todos' || p.situacaoPedido === statusFilter;

      let matchesDate = true;
      const orderDate = new Date(p.createdAt).toISOString().split('T')[0];
      
      if (dateRange.start && orderDate < dateRange.start) matchesDate = false;
      if (dateRange.end && orderDate > dateRange.end) matchesDate = false;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [pedidos, searchTerm, statusFilter, dateRange]);

  const totalPages = Math.ceil(filteredPedidos.length / ITEMS_PER_PAGE);
  const currentPedidos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPedidos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPedidos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-8 shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Operação de Pedidos</h1>
            {silentLoading && (
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-orange-500" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Seletor de Visualização Melhorado */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem] flex items-center gap-1 transition-all shadow-inner">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-lg shadow-slate-200/50 dark:shadow-none' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Modo Grade"
              >
                <LayoutGrid size={14} /> <span className="hidden sm:inline">Grade</span>
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-lg shadow-slate-200/50 dark:shadow-none' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Modo Tabela"
              >
                <List size={14} /> <span className="hidden sm:inline">Tabela</span>
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl transition-all border ${soundEnabled ? 'text-orange-500 border-orange-100 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800' : 'text-slate-400 border-slate-200 dark:border-slate-800'}`}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 transition-colors">
              <Bell size={22} />
              {hasUnread && <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Barra de Filtros Avançada */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-5 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Busca por Cliente ou ID</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nome, ID ou Telefone..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-orange-500/10 dark:text-slate-100 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <DateRangePicker 
                    range={dateRange}
                    onChange={setDateRange}
                    label="Período de Pedidos"
                  />
                </div>

                <div className="lg:col-span-1">
                  <button 
                    onClick={clearFilters}
                    className="w-full aspect-square bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                    title="Limpar Filtros"
                  >
                    <FilterX size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 border-t border-slate-50 dark:border-slate-800 transition-colors">
                {['todos', 'preparando', 'entrega', 'finalizado', 'cancelado'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      statusFilter === status 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Listagem */}
            <div className="min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <RefreshCw className="animate-spin text-orange-500" size={32} />
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Sincronizando banco de dados...</p>
                </div>
              ) : currentPedidos.length > 0 ? (
                <>
                  <div className="animate-in fade-in duration-500">
                    {viewMode === 'table' ? (
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                        <OrderList pedidos={currentPedidos} onViewDetails={(id) => setSelectedPedido(pedidos.find(p => p.id === id) || null)} />
                      </div>
                    ) : (
                      <OrderGrid pedidos={currentPedidos} onViewDetails={(id) => setSelectedPedido(pedidos.find(p => p.id === id) || null)} />
                    )}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-colors">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest transition-colors">
                        Mostrando {currentPedidos.length} de {filteredPedidos.length} pedidos
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 disabled:opacity-30 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-500 transition-all active:scale-95"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                currentPage === i + 1 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-600'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 disabled:opacity-30 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-500 transition-all active:scale-95"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-slate-900 py-32 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center px-6 transition-colors">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                    <Search size={32} className="text-slate-200 dark:text-slate-700" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors">Nenhum pedido encontrado</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-2 max-w-xs transition-colors">Tente ajustar seus filtros de busca, status ou data para encontrar o que procura.</p>
                  <button onClick={clearFilters} className="mt-6 text-xs font-black uppercase text-orange-500 hover:underline">Limpar filtros</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedPedido && (
        <OrderDetail pedido={selectedPedido} onClose={() => setSelectedPedido(null)} onStatusUpdate={() => fetchOrders(true)} />
      )}
    </div>
  );
}
