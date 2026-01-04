
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Check, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { 
  getCargos, 
  createCargo, 
  updateCargo, 
  deleteCargo 
} from '../../../services/cargoService';
import { type Cargo } from '../../../types';
import { toast } from 'react-toastify';

interface CargoModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

const CargoModal: React.FC<CargoModalProps> = ({ onClose, onRefresh }) => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [editingIsAdmin, setEditingIsAdmin] = useState(false);

  const fetchCargos = async () => {
    setLoading(true);
    try {
      const data = await getCargos();
      setCargos(data);
    } catch (error) {
      toast.error("Erro ao carregar cargos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsProcessing(true);
    try {
      await createCargo({ nome: newName, descricao: newDesc, admin: newIsAdmin });
      setNewName(''); setNewDesc(''); setNewIsAdmin(false);
      toast.success("Cargo criado!");
      fetchCargos();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao criar cargo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    setIsProcessing(true);
    try {
      await updateCargo(id, { nome: editingName, descricao: editingDesc, admin: editingIsAdmin });
      setEditingId(null);
      toast.success("Cargo atualizado!");
      fetchCargos();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao atualizar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Atenção: excluir um cargo afetará todos os usuários vinculados. Continuar?")) return;
    try {
      await deleteCargo(id);
      toast.success("Cargo removido.");
      fetchCargos();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all";

  return (
    <div className="absolute inset-0 z-[110] bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in transition-colors">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up transition-colors">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-lg transition-colors">Gerenciar Cargos</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Níveis de Acesso ao Sistema</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-100 transition-all rounded-full hover:bg-white dark:hover:bg-slate-800">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar transition-colors">
          {/* Add New Section */}
          <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-[2rem] border border-orange-100 dark:border-orange-900/30 space-y-4 transition-colors">
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                className={inputClasses} 
                placeholder="Nome do cargo..." 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 transition-colors">
                 <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-orange-500 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600" 
                      checked={newIsAdmin} 
                      onChange={(e) => setNewIsAdmin(e.target.checked)} 
                    />
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 transition-colors">Acesso Admin</span>
                 </label>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                className={inputClasses} 
                placeholder="Breve descrição..." 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <button 
                type="button"
                onClick={handleAdd}
                disabled={isProcessing || !newName.trim()}
                className="bg-orange-500 text-white px-6 rounded-xl hover:bg-orange-600 dark:hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing && !editingId ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              </button>
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300 dark:text-slate-700" /></div>
            ) : cargos.map(cargo => (
              <div key={cargo.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 group hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                {editingId === cargo.id ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClasses} value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                      <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 border border-slate-200 dark:border-slate-700 transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-orange-500" checked={editingIsAdmin} onChange={(e) => setEditingIsAdmin(e.target.checked)} />
                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Admin</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input className={inputClasses} value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)} />
                      <button onClick={() => handleUpdate(cargo.id)} className="text-emerald-500 p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"><Check size={20}/></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${cargo.admin ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {cargo.admin ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">{cargo.nome}</span>
                          {cargo.admin && <span className="text-[8px] font-black bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-500 px-1.5 py-0.5 rounded uppercase transition-colors">Master</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium transition-colors">{cargo.descricao || 'Sem descrição'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingId(cargo.id); setEditingName(cargo.nome); setEditingDesc(cargo.descricao); setEditingIsAdmin(cargo.admin); }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cargo.id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-slate-800 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black dark:hover:bg-black transition-all shadow-xl shadow-slate-200 dark:shadow-none"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default CargoModal;
