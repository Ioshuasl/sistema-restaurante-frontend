
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
// Fix: Use 'react-router' instead of 'react-router-dom' to resolve missing export members errors
import { Link, useLocation, useNavigate } from 'react-router';

interface SidebarProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = () => {
      const val = localStorage.getItem(UNREAD_ORDERS_KEY);
      setHasUnread(val === 'true');
    };

    checkUnread();
    window.addEventListener('storage', checkUnread);
    window.addEventListener('storage-update', checkUnread);
    
    return () => {
      window.removeEventListener('storage', checkUnread);
      window.removeEventListener('storage-update', checkUnread);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/order', icon: Package, label: 'Pedidos', alert: true },
    { path: '/admin/product', icon: ShoppingBag, label: 'Produtos' },
    { path: '/admin/user/consult', icon: Users, label: 'Usuários' },
    { path: '/admin/config', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-screen sticky top-0 shrink-0 transition-colors duration-300">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
            <ShoppingBag className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors">S&G Admin</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all group relative ${
                isActive 
                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.alert && hasUnread && !isActive && (
                  <span className="w-2 h-2 bg-red-500 rounded-full shadow-sm shadow-red-200 animate-pulse"></span>
                )}
                {isActive && <ChevronRight size={14} />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
        {toggleTheme && (
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all font-bold text-sm"
          >
            {isDarkMode ? (
              <><Sun size={20} className="text-amber-500" /> Modo Claro</>
            ) : (
              <><Moon size={20} className="text-indigo-500" /> Modo Escuro</>
            )}
          </button>
        )}
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut className="h-5 w-5" /> Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;