
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  Trash2, 
  Layers,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Settings,
  Upload,
  CloudUpload,
  AlertCircle
} from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { 
    type Produto, 
    type CategoriaProduto, 
    type GrupoOpcaoPayload,
    type OpcaoPayload
} from '../../../types';
import { getAllCategoriasProdutos } from '../../../services/categoriaProdutoService';
import { createProduto, updateProduto } from '../../../services/produtoService';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import CategoriaModal from './CategoriaModal';

interface ProductFormProps {
  product: Produto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [nome, setNome] = useState(product?.nomeProduto || '');
  // Iniciamos o preço formatado se houver produto
  const [preco, setPreco] = useState(product?.valorProduto?.toString().replace('.', ',') || '');
  const [image, setImage] = useState(product?.image || '');
  const [descricao, setDescricao] = useState(product?.descricao || '');
  const [categoriaId, setCategoriaId] = useState(product?.categoriaProduto_id?.toString() || '');
  const [isAtivo, setIsAtivo] = useState(product?.isAtivo ?? true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [grupos, setGrupos] = useState<GrupoOpcaoPayload[]>(() => {
    if (product?.gruposOpcoes) {
      return product.gruposOpcoes.map(g => ({
        id: g.id,
        nomeGrupo: g.nomeGrupo,
        minEscolhas: g.minEscolhas,
        maxEscolhas: g.maxEscolhas,
        opcoes: g.opcoes?.map(o => ({
          id: o.id,
          nomeSubProduto: (o as any).nomeSubProduto || (o as any).nome,
          valorAdicional: Number(o.valorAdicional),
          isAtivo: (o as any).isAtivo ?? true
        })) || []
      }));
    }
    return [];
  });

  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'options'>('basic');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategorias = async () => {
    try {
      const data = await getAllCategoriasProdutos();
      setCategorias(data);
    } catch (error) {
      toast.error("Erro ao carregar categorias.");
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.imageUrl;
    } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        throw new Error("Erro ao fazer upload da imagem.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem válido.");
        return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Enviando imagem...");

    try {
        const imageUrl = await uploadImage(file);
        setImage(imageUrl);
        toast.update(loadingToast, { 
            render: "Imagem enviada com sucesso!", 
            type: "success", 
            isLoading: false, 
            autoClose: 2000 
        });
    } catch (error: any) {
        toast.update(loadingToast, { 
            render: error.message || "Falha no upload.", 
            type: "error", 
            isLoading: false, 
            autoClose: 3000 
        });
    } finally {
        setIsUploading(false);
    }
  };

  const addGrupo = () => {
    setGrupos([...grupos, { nomeGrupo: '', minEscolhas: 0, maxEscolhas: 1, opcoes: [] }]);
    setActiveTab('options');
  };

  const removeGrupo = (index: number) => {
    const newGrupos = [...grupos];
    newGrupos.splice(index, 1);
    setGrupos(newGrupos);
  };

  const updateGrupo = (index: number, field: keyof GrupoOpcaoPayload, value: any) => {
    const newGrupos = [...grupos];
    newGrupos[index] = { ...newGrupos[index], [field]: value };
    setGrupos(newGrupos);
  };

  const addOpcao = (grupoIndex: number) => {
    const newGrupos = [...grupos];
    newGrupos[grupoIndex].opcoes.push({ nomeSubProduto: '', valorAdicional: 0, isAtivo: true });
    setGrupos(newGrupos);
  };

  const removeOpcao = (grupoIndex: number, opcaoIndex: number) => {
    const newGrupos = [...grupos];
    newGrupos[grupoIndex].opcoes.splice(opcaoIndex, 1);
    setGrupos(newGrupos);
  };

  const updateOpcao = (grupoIndex: number, opcaoIndex: number, field: keyof OpcaoPayload, value: any) => {
    const newGrupos = [...grupos];
    newGrupos[grupoIndex].opcoes[opcaoIndex] = { ...newGrupos[grupoIndex].opcoes[opcaoIndex], [field]: value };
    setGrupos(newGrupos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações Obrigatórias
    if (!image) {
        return toast.warning("A imagem do produto é obrigatória!", {
            icon: <AlertCircle className="text-orange-500" />
        });
    }
    
    if (!categoriaId) return toast.warning("Selecione uma categoria.");
    if (isUploading) return toast.info("Aguarde o upload da imagem terminar.");

    setSaving(true);
    
    // Converte o preço da máscara (virgula para ponto)
    const valorNumerico = parseFloat(preco.replace(/\./g, '').replace(',', '.'));

    const payload: any = {
      nomeProduto: nome,
      valorProduto: valorNumerico,
      image: image,
      descricao: descricao,
      isAtivo: isAtivo,
      categoriaProduto_id: Number(categoriaId),
      gruposOpcoes: grupos
    };

    try {
      if (product) {
        await updateProduto(product.id, payload);
        toast.success("Produto atualizado!");
      } else {
        await createProduto(payload);
        toast.success("Produto criado!");
      }
      onSuccess();
    } catch (error) {
      toast.error("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up transition-colors">
        
        {/* Header com Abas */}
        <div className="px-8 pt-8 pb-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                  {product ? 'Configurar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Sessão Administrativa</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-300 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-100 transition-all">
              <X size={28} />
            </button>
          </div>

          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('basic')}
              className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === 'basic' ? 'border-orange-500 text-orange-600 dark:text-orange-500' : 'border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                <Settings2 size={16} /> Dados Básicos
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('options')}
              className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === 'options' ? 'border-orange-500 text-orange-600 dark:text-orange-500' : 'border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                <Layers size={16} /> Grupos e Opções ({grupos.length})
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar relative transition-colors">
          
          {isCategoryModalOpen && (
            <CategoriaModal 
              onClose={() => setIsCategoryModalOpen(false)} 
              onRefresh={fetchCategorias} 
            />
          )}

          {activeTab === 'basic' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className={labelClasses}>Nome do Produto *</label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      required 
                      value={nome} 
                      onChange={(e) => setNome(e.target.value)} 
                      placeholder="Ex: Marmita G"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Preço Base (R$) *</label>
                      <IMaskInput
                        mask={Number}
                        scale={2}
                        radix=","
                        thousandsSeparator="."
                        padFractionalZeros={true}
                        normalizeZeros={true}
                        mapToRadix={['.']}
                        className={inputClasses}
                        required
                        value={preco}
                        onAccept={(value) => setPreco(value as string)}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                        <button 
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase hover:underline flex items-center gap-1 transition-colors"
                        >
                          <Settings size={10} /> Gerenciar
                        </button>
                      </div>
                      <select 
                          className={inputClasses} 
                          required 
                          value={categoriaId} 
                          onChange={(e) => setCategoriaId(e.target.value)}
                      >
                          <option value="">Selecione...</option>
                          {categorias.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.nomeCategoriaProduto}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Descrição do Cardápio</label>
                    <textarea 
                      className={`${inputClasses} h-32 resize-none`}
                      value={descricao} 
                      onChange={(e) => setDescricao(e.target.value)} 
                      placeholder="Descreva os itens inclusos ou detalhes..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`${labelClasses} ${!image ? 'text-orange-500 font-black' : ''}`}>
                        Imagem do Produto * {!image && '(Obrigatória)'}
                    </label>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative aspect-video w-full rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner cursor-pointer
                            ${image ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-orange-400 dark:hover:border-orange-600'}
                            ${!image ? 'border-orange-300' : ''}
                            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-orange-500" size={32} />
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Enviando...</span>
                            </div>
                        ) : image ? (
                            <>
                                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                    <CloudUpload className="text-white" size={32} />
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Trocar Imagem</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <Upload size={32} className="text-orange-500" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Upload de Foto</span>
                                <p className="text-[8px] text-slate-300 dark:text-slate-700 mt-2 font-bold">PNG, JPG ou WEBP (Max 5MB)</p>
                            </>
                        )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800 transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isAtivo} 
                        onChange={(e) => setIsAtivo(e.target.checked)} 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-orange-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      <span className="text-sm font-black text-orange-800 dark:text-orange-500 uppercase tracking-tighter transition-colors">Produto disponível no cardápio</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest transition-colors">Configuração de Adicionais</h3>
                <button 
                  type="button"
                  onClick={addGrupo}
                  className="text-xs font-black text-orange-600 dark:text-orange-500 uppercase flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all shadow-sm"
                >
                  <Plus size={16} /> Adicionar Grupo
                </button>
              </div>

              {grupos.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] transition-colors">
                  <Layers size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-4 transition-colors" />
                  <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhum adicional configurado</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-700 mt-1">Produtos sem grupos serão adicionados diretamente ao carrinho.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {grupos.map((grupo, gIndex) => (
                    <div key={gIndex} className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative group/card transition-colors">
                      <button 
                        type="button"
                        onClick={() => removeGrupo(gIndex)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/card:opacity-100 transition-all hover:scale-110 active:scale-90"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                        <div className="md:col-span-6">
                          <label className={labelClasses}>Nome do Grupo</label>
                          <input 
                            type="text" 
                            className={inputClasses} 
                            placeholder="Ex: Escolha as Carnes"
                            value={grupo.nomeGrupo}
                            onChange={(e) => updateGrupo(gIndex, 'nomeGrupo', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className={labelClasses}>Mínimo</label>
                          <input 
                            type="number" 
                            className={inputClasses} 
                            value={grupo.minEscolhas}
                            onChange={(e) => updateGrupo(gIndex, 'minEscolhas', Number(e.target.value))}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className={labelClasses}>Máximo</label>
                          <input 
                            type="number" 
                            className={inputClasses} 
                            value={grupo.maxEscolhas}
                            onChange={(e) => updateGrupo(gIndex, 'maxEscolhas', Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
                        <div className="flex items-center justify-between mb-2 px-2">
                          <h4 className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] transition-colors">Opções de Escolha</h4>
                          <button 
                            type="button"
                            onClick={() => addOpcao(gIndex)}
                            className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <Plus size={12} /> Novo Item
                          </button>
                        </div>

                        {grupo.opcoes.map((opcao, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                            <input 
                              type="text" 
                              className="flex-1 bg-transparent border-none text-sm font-bold p-1 outline-none focus:ring-0 dark:text-slate-100" 
                              placeholder="Nome do Item"
                              value={opcao.nomeSubProduto}
                              onChange={(e) => updateOpcao(gIndex, oIndex, 'nomeSubProduto', e.target.value)}
                            />
                            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 shadow-sm transition-colors">
                              <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 mr-1">R$</span>
                              <input 
                                type="number" 
                                step="0.01"
                                className="w-16 bg-transparent border-none text-xs font-black p-1 outline-none text-right dark:text-slate-100"
                                value={opcao.valorAdicional}
                                onChange={(e) => updateOpcao(gIndex, oIndex, 'valorAdicional', Number(e.target.value))}
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={() => updateOpcao(gIndex, oIndex, 'isAtivo', !opcao.isAtivo)}
                              className={`p-1.5 rounded-lg transition-all ${opcao.isAtivo ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-300 bg-slate-100 dark:text-slate-600 dark:bg-slate-800'}`}
                            >
                              {opcao.isAtivo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            </button>
                            <button 
                              type="button"
                              onClick={() => removeOpcao(gIndex, oIndex)}
                              className="p-1.5 text-slate-200 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0 transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hidden sm:block transition-colors">
            {activeTab === 'basic' ? 'Próximo: Configure os adicionais' : 'Revise os grupos antes de salvar'}
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-8 py-3 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              disabled={saving || isUploading}
              className="flex-1 sm:flex-none bg-orange-500 text-white px-10 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 dark:hover:bg-orange-600 shadow-xl shadow-orange-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
              {product ? 'Salvar Tudo' : 'Criar Produto'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default ProductForm;
