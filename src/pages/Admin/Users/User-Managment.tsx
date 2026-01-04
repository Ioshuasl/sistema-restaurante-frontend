
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Users as UsersIcon,
  Bell,
  ShieldAlert
} from 'lucide-react';
import Sidebar from '../../../components/Admin/Sidebar';
import UserList from '../../../components/Admin/Users/UserList';
import UserForm from '../../../components/Admin/Users/UserForm';
import ConfirmationModal from '../../../components/Common/ConfirmationModal';
import { getUsers, deleteUser } from '../../../services/userService';
import { type User } from '../../../types';
import { toast } from 'react-toastify';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UserManagment: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Estados para o Modal de Confirmação
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erro ao carregar lista de usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    // Validador: verifica se o usuário ou o ID são inválidos
    if (!userToDelete || userToDelete.id === null || userToDelete.id === undefined) {
      toast.error("Erro: Identificador do usuário inválido.");
      setIsDeleteModalOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      toast.success(`Acesso de "${userToDelete.nome}" removido!`);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao remover usuário.");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-8 shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Controle de Acessos</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors transition-colors">Super Admin</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest transition-colors transition-colors">Master Control</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold transition-colors">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-orange-500/20 transition-all">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md transition-all">
                     <UsersIcon size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Equipe & Acessos</h2>
                    <p className="text-orange-100 text-sm font-medium">Gerencie quem pode operar o sistema.</p>
                  </div>
               </div>
               <button 
                  onClick={handleAdd}
                  className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-orange-50 transition-all shadow-xl active:scale-95"
                >
                  <Plus size={16} className="inline mr-2" /> Novo Usuário
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou usuário..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-2 transition-colors">
                   <ShieldAlert size={16} className="text-slate-400" />
                   <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">{users.length} Registros</span>
                </div>
                <button 
                  onClick={fetchUsers}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin text-orange-500' : ''} />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px] transition-all transition-colors">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verificando credenciais...</p>
                </div>
              ) : (
                <UserList 
                  users={filteredUsers} 
                  onEdit={handleEdit} 
                  onDelete={handleDeleteClick}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <UserForm 
          user={editingUser} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchUsers();
          }} 
        />
      )}

      {/* Modal de Confirmação de Exclusão de Usuário */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir Usuário?"
        description={`Você está prestes a remover o acesso de "${userToDelete?.nome}". Esta pessoa não poderá mais entrar no sistema. Deseja continuar?`}
        confirmText="Sim, Remover Acesso"
        cancelText="Manter Usuário"
        variant="danger"
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default UserManagment;
