
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Loader2, 
  User as UserIcon, 
  Lock, 
  Key, 
  Settings,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { 
  type User, 
  type Cargo, 
  type CreateUserPayload, 
  type UpdateUserPayload 
} from '../../../types';
import { getCargos } from '../../../services/cargoService';
import { createUser, updateUser } from '../../../services/userService';
import { toast } from 'react-toastify';
import CargoModal from './CargoModal';

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const [nome, setNome] = useState(user?.nome || '');
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [cargoId, setCargoId] = useState(user?.cargo_id?.toString() || '');
  
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCargos = async () => {
    try {
      const data = await getCargos();
      setCargos(data);
    } catch (err) {
      toast.error("Erro ao carregar cargos.");
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoId) return toast.warning("Selecione o cargo do usuário.");

    setSaving(true);
    try {
      if (user) {
        const payload: UpdateUserPayload = { 
          nome, 
          username, 
          cargo_id: Number(cargoId) 
        };
        if (password) payload.password = password;
        await updateUser(user.id, payload);
        toast.success("Usuário atualizado!");
      } else {
        if (!password) {
            toast.warning("Senha é obrigatória para novos usuários.");
            setSaving(false);
            return;
        }
        const payload: CreateUserPayload = { 
          nome, 
          username, 
          password, 
          cargo_id: Number(cargoId) 
        };
        await createUser(payload);
        toast.success("Usuário criado!");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao salvar usuário.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up transition-colors">
        
        {isCargoModalOpen && (
          <CargoModal 
            onClose={() => setIsCargoModalOpen(false)} 
            onRefresh={fetchCargos} 
          />
        )}

        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 dark:shadow-none transition-colors">
               <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight transition-colors">
                {user ? 'Editar Acesso' : 'Novo Acesso'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Gestão de Usuários</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-100 transition-all">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Nome Completo</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  className={inputClasses} 
                  required 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  placeholder="Ex: Pedro Alvares"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Nome de Usuário (Login)</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  className={inputClasses} 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Ex: pedro_admin"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2 transition-colors">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Cargo</label>
                    <button 
                      type="button" 
                      onClick={() => setIsCargoModalOpen(true)}
                      className="text-[10px] font-black text-orange-600 dark:text-orange-500 hover:underline flex items-center gap-1 transition-colors"
                    >
                      <Settings size={10} /> Editar
                    </button>
                </div>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <select 
                    className={`${inputClasses} appearance-none`}
                    required 
                    value={cargoId} 
                    onChange={(e) => setCargoId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {cargos.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClasses}>{user ? 'Nova Senha (Opcional)' : 'Senha de Acesso'}</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    className={inputClasses} 
                    required={!user}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl flex items-start gap-4 border border-orange-100 dark:border-orange-900/30 transition-colors">
             <ShieldCheck className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
             <div>
                <p className="text-[10px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-tight transition-colors">Segurança de Acesso</p>
                <p className="text-[10px] text-orange-600 dark:text-orange-500/60 font-medium leading-relaxed transition-colors">As permissões de cada usuário são herdadas diretamente do cargo selecionado.</p>
             </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-[2] bg-orange-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 shadow-xl shadow-orange-100 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {user ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
