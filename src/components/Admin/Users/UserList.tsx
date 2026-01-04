
import React from 'react';
import { Edit2, Trash2, User as UserIcon, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { type User } from '../../../types';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <UserIcon size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Usuário</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Login</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Cargo / Acesso</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Desde</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${user.Cargo?.admin ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">{user.nome}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase transition-colors">ID: {user.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 transition-colors">
                  <Mail size={14} className="text-slate-300 dark:text-slate-700" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors ${user.Cargo?.admin ? 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-500 dark:border-orange-800' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                        {user.Cargo?.nome || 'Sem Cargo'}
                    </span>
                    {user.Cargo?.admin && <ShieldCheck size={14} className="text-orange-500" />}
                </div>
              </td>
              <td className="px-6 py-4">
                 <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 transition-colors">
                   <Calendar size={14} />
                   <span className="text-xs font-medium">
                     {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                   </span>
                 </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => onEdit(user)}
                    className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all border border-slate-100 dark:border-slate-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(user)}
                    className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all border border-slate-100 dark:border-slate-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
