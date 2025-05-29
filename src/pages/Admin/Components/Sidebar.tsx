import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingCart, Package, LogOut } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "text-indigo-600 font-semibold"
      : "text-gray-700 hover:text-indigo-600";

  return (
    <aside className="w-64 bg-white shadow-lg px-4 py-6 hidden md:flex flex-col h-screen justify-between">
      <div>
        <h2 className="text-2xl font-bold text-indigo-600 mb-8">Painel do Admin</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>Dashboard</Link>
          <Link to="/admin/order" className={isActive("/admin/order")}>Gerenciar Pedidos</Link>
          <Link to="/admin/product" className={isActive("/admin/product")}>Gerenciar Produtos</Link>
          <Link to="/admin/product/new" className={isActive("/admin/product/new")}>Cadastrar Produto</Link>
          <Link to="/admin/category-product" className={isActive("/admin/category-product")}>Gerenciar Categorias de Produto</Link>
          <Link to="/admin/category-product/new" className={isActive("/admin/category-product/new")}>Cadastrar Categoria de Produto</Link>
          <Link to="/admin/user" className={isActive("/admin/user")}>Gerenciar Usuários</Link>
          <Link to="/admin/user/new" className={isActive("/admin/user/new")}>Cadastrar Usuário</Link>
          <Link to="/admin/config" className={isActive("/admin/config")}>Configurações</Link>
        </nav>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button className="w-full text-left flex items-center gap-2 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition text-gray-700">
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
