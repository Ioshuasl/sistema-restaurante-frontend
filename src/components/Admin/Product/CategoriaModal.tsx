
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Check, Loader2 } from 'lucide-react';
import { 
  getAllCategoriasProdutos, 
  createCategoriaProduto, 
  updateCategoriaProduto, 
  deleteCategoriaProduto 
} from '../../../services/categoriaProdutoService';
import { type CategoriaProduto } from '../../../types';
import { toast } from 'react-toastify';

interface CategoriaModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

const CategoriaModal: React.FC<CategoriaModalProps> = ({ onClose, onRefresh }) => {
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoriasProdutos();
      setCategorias(data);
    } catch (error) {
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleAdd = async () => {
    if (!newCatName.trim()) return;
    setIsProcessing(true);
    try {
      await createCategoriaProduto({ nomeCategoriaProduto: newCatName });
      setNewCatName('');
      toast.success("Categoria criada!");
      fetchCategorias();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao criar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    setIsProcessing(true);
    try {
      await updateCategoriaProduto(id, { nomeCategoriaProduto: editingName });
      setEditingId(null);
      toast.success("Categoria atualizada!");
      fetchCategorias();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao atualizar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Atenção: excluir uma categoria pode ocultar produtos vinculados a ela. Deseja continuar?")) return;
    try {
      await deleteCategoriaProduto(id);
      toast.success("Categoria removida.");
      fetchCategorias();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all";

  return (
    <div className="absolute inset-0 z-[110] bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up transition-colors">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-lg">Categorias</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Organização do Cardápio</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-100 transition-all rounded-full hover:bg-white dark:hover:bg-slate-800">
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar transition-colors">
          <div className="flex gap-2">
            <input 
              type="text" 
              className={inputClasses} 
              placeholder="Nome da nova categoria..." 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              disabled={isProcessing}
            />
            <button 
              type="button"
              onClick={handleAdd}
              disabled={isProcessing || !newCatName.trim()}
              className="bg-orange-500 text-white p-3.5 rounded-xl hover:bg-orange-600 dark:hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 dark:shadow-none disabled:opacity-50"
            >
              {isProcessing && !editingId ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300 dark:text-slate-700" /></div>
            ) : categorias.length === 0 ? (
              <div className="py-10 text-center text-slate-300 dark:text-slate-700 text-xs font-bold uppercase">Nenhuma categoria encontrada</div>
            ) : (
              categorias.map(cat => (
                <div key={cat.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-slate-300 dark:hover:border-slate-600">
                  {editingId === cat.id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 bg-white dark:bg-slate-800 border border-orange-500 rounded-xl px-3 py-1.5 text-sm outline-none font-bold dark:text-slate-100"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                      <button type="button" onClick={() => handleUpdate(cat.id)} className="text-emerald-500 p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg"><Check size={20}/></button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 dark:text-slate-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X size={20}/></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 ml-2 transition-colors">{cat.nomeCategoriaProduto}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          type="button"
                          onClick={() => { setEditingId(cat.id); setEditingName(cat.nomeCategoriaProduto); }}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-slate-800 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black dark:hover:bg-black transition-all shadow-xl shadow-slate-200 dark:shadow-none"
          >
            Concluir e Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriaModal;
