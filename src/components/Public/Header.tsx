
import React from 'react';
import { useNavigate } from 'react-router';
import { CookingPot, Truck, Search, User, ShoppingBag, X, Sun, Moon } from 'lucide-react';

interface HeaderProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    cartCount: number;
    onOpenCart: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export default function Header({ searchTerm, setSearchTerm, cartCount, onOpenCart, isDarkMode, toggleTheme }: HeaderProps) {
    // Fix: Use 'react-router' instead of 'react-router-dom' to resolve missing export member error
    const navigate = useNavigate();

    return (
        <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
                    {/* Brand */}
                    <div 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 group cursor-pointer shrink-0"
                    >
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 dark:shadow-none group-hover:scale-110 transition">
                            <CookingPot size={24} />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">GS SABORES</h1>
                            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold transition-colors">
                                <Truck size={12} />
                                <span>ABERTO AGORA</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search */}
                    <div className="flex-1 max-w-xl relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar no cardápio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl py-2.5 pl-12 pr-10 text-sm font-medium dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:border-red-500/20 focus:ring-4 focus:ring-red-500/5 transition-all outline-none"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-400 transition"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Utils */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <button 
                            onClick={toggleTheme}
                            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            aria-label="Alternar Tema"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        <button 
                            onClick={() => navigate('/login')}
                            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            title="Acesso Administrativo"
                        >
                            <User size={20} />
                        </button>
                        
                        <button 
                            onClick={onOpenCart}
                            className="relative p-2.5 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition active:scale-95"
                        >
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-extrabold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}