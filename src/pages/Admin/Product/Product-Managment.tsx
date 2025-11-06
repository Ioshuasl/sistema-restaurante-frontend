import { IMaskInput } from 'react-imask';
import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Trash2, PlusCircle } from "lucide-react";
import ToggleSwitch from "../Components/ToggleSwitch";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- TIPOS ATUALIZADOS ---
import {
    type Produto,
    type CategoriaProduto,
    type SubProduto,
    type GrupoOpcao, // Importa o novo tipo
    type CreateProdutoPayload, // Importa os tipos de payload
    type UpdateProdutoPayload
} from "../../../types/interfaces-types";
// --- (imports de service inalterados) ---
import {
    getAllProdutos,
    updateProduto,
    createProduto,
    toggleProdutoAtivo,
    deleteProduto
} from "../../../services/produtoService";
import { getAllCategoriasProdutos } from "../../../services/categoriaProdutoService";
import api from '../../../services/api';

type StatusFilter = "all" | "active" | "inactive";

// --- ESTADO INICIAL ATUALIZADO ---
const initialProductState: Produto = {
    id: 0,
    nomeProduto: "",
    valorProduto: 0,
    image: "",
    isAtivo: true,
    categoriaProduto_id: 0,
    gruposOpcoes: [], // <--- ATUALIZADO
    createdAt: '',
    updatedAt: ''
};

export default function ProductManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | "">("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [products, setProducts] = useState<Produto[]>([]);
    const [categories, setCategories] = useState<CategoriaProduto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeProduct, setActiveProduct] = useState<Produto | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    // --- ESTADOS DE SUBPRODUTO REMOVIDOS ---
    // const [subProdutosInModal, setSubProdutosInModal] = useState<SubProduto[]>([]);
    // const [newSubProdutoName, setNewSubProdutoName] = useState("");
    // const [newSubProdutoValue, setNewSubProdutoValue] = useState(0);

    // --- NOVO ESTADO ---
    // Gerencia os inputs de "nova opção" para cada grupo (mapeado pelo índice do grupo)
    const [newOpcaoInputs, setNewOpcaoInputs] = useState<Record<number, { nome: string, valor: number }>>({});


    const fetchProductsAndCategories = async () => {
        try {
            setIsLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                getAllProdutos(),
                getAllCategoriasProdutos(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
            setError("Não foi possível carregar os produtos e categorias.");
            toast.error("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductsAndCategories();
    }, []);

    // --- FUNÇÃO ATUALIZADA ---
    const handleOpenModal = (productData: Produto) => {
        setActiveProduct(productData);
        // setSubProdutosInModal(productData.subprodutos || []); // REMOVIDO

        // Inicializa o estado dos inputs de "nova opção" para os grupos existentes
        const initialOpcaoInputs: Record<number, { nome: string, valor: number }> = {};
        (productData.gruposOpcoes || []).forEach((_, index) => {
            initialOpcaoInputs[index] = { nome: '', valor: 0 };
        });
        setNewOpcaoInputs(initialOpcaoInputs);
    };

    // --- FUNÇÃO ATUALIZADA ---
    const handleCloseModal = () => {
        setActiveProduct(null);
        setNewImageFile(null);
        // setSubProdutosInModal([]); // REMOVIDO
        // setNewSubProdutoName(""); // REMOVIDO
        // setNewSubProdutoValue(0); // REMOVIDO
        setNewOpcaoInputs({}); // ADICIONADO
    };

    const filteredProducts = products.filter((product) => {
        const matchName = product.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === "" || product.categoriaProduto_id === selectedCategory;
        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && product.isAtivo) ||
            (statusFilter === "inactive" && !product.isAtivo);
        return matchName && matchCategory && matchStatus;
    });

    const toggleProductStatus = async (productId: number) => {
        try {
            await toggleProdutoAtivo(productId);
            toast.success(`Status do produto #${productId} atualizado.`);
            fetchProductsAndCategories();
        } catch (err) {
            console.error("Erro ao alternar status:", err);
            toast.error("Erro ao alternar o status do produto.");
        }
    };

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

    // --- FUNÇÃO ATUALIZADA ---
    const handleSave = async () => {
        if (!activeProduct) return;
        setIsSubmitting(true);

        if (!activeProduct.nomeProduto || activeProduct.categoriaProduto_id === 0) {
            toast.error("Nome do produto e categoria são obrigatórios.");
            setIsSubmitting(false);
            return;
        }

        let imageUrl = activeProduct.image;
        if (newImageFile) {
            imageUrl = await uploadImage(newImageFile);
        }

        if (!imageUrl && !activeProduct.id) {
            toast.error("A imagem é obrigatória para cadastrar um novo produto.");
            setIsSubmitting(false);
            return;
        }

        // --- PAYLOAD ATUALIZADO ---
        // A estrutura 'gruposOpcoes' já está dentro de 'activeProduct'
        // Removemos 'subprodutos: subProdutosInModal'
        const payload = {
            ...activeProduct,
            image: imageUrl,
        };

        try {
            if (activeProduct.id) {
                // O payload já contém os gruposOpcoes vindos do estado 'activeProduct'
                await updateProduto(activeProduct.id, payload as UpdateProdutoPayload);
                toast.success(`Produto #${activeProduct.id} atualizado com sucesso.`);
            } else {
                await createProduto(payload as CreateProdutoPayload);
                toast.success(`Produto "${payload.nomeProduto}" criado com sucesso.`);
            }
            handleCloseModal();
            fetchProductsAndCategories();
        } catch (err) {
            console.error("Erro ao salvar o produto:", err);
            toast.error("Erro ao salvar o produto.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja excluir este produto?")) {
            try {
                await deleteProduto(productId);
                toast.success(`Produto #${productId} excluído com sucesso.`);
                fetchProductsAndCategories();
            } catch (err) {
                console.error("Erro ao excluir produto:", err);
                toast.error("Erro ao excluir o produto.");
            }
        }
    };

    const getCategoryName = (categoryId: number) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.nomeCategoriaProduto : "Categoria Desconhecida";
    };

    // --- LÓGICA DE SUBPRODUTO REMOVIDA ---
    // const handleAddSubProduto = () => { ... };
    // const handleUpdateSubProduto = (index: number, ...) => { ... };
    // const handleDeleteSubProduto = (index: number) => { ... };


    // --- NOVAS FUNÇÕES DE GRUPO E OPÇÃO ---

    // Atualiza o estado dos inputs de "nova opção"
    const handleNewOpcaoInputChange = (grupoIndex: number, field: 'nome' | 'valor', value: string | number) => {
        setNewOpcaoInputs(prev => ({
            ...prev,
            [grupoIndex]: {
                ...prev[grupoIndex],
                [field]: value
            }
        }));
    };

    // --- Funções para GRUPOS ---
    const handleAddGrupo = () => {
        if (!activeProduct) return;
        const newGrupo: GrupoOpcao = {
            id: 0, // 0 ou um ID temporário (ex: Date.now())
            nomeGrupo: "Novo Grupo",
            minEscolhas: 1,
            maxEscolhas: 1,
            produto_id: activeProduct.id,
            opcoes: []
        };

        const newIndex = (activeProduct.gruposOpcoes || []).length;

        setActiveProduct({
            ...activeProduct,
            gruposOpcoes: [...(activeProduct.gruposOpcoes || []), newGrupo]
        });

        // Inicializa o estado do input para o novo grupo
        setNewOpcaoInputs(prev => ({
            ...prev,
            [newIndex]: { nome: '', valor: 0 }
        }));
    };

    const handleDeleteGrupo = (grupoIndex: number) => {
        if (!activeProduct) return;
        if (!window.confirm("Tem certeza que deseja excluir este grupo e todas as suas opções?")) return;

        setActiveProduct({
            ...activeProduct,
            gruposOpcoes: (activeProduct.gruposOpcoes || []).filter((_, i) => i !== grupoIndex)
            // (A re-indexação do state newOpcaoInputs é complexa, mas ao fechar/reabrir o modal ele se corrige)
        });
    };

    const handleUpdateGrupo = (grupoIndex: number, field: keyof GrupoOpcao, value: string | number) => {
        if (!activeProduct || !activeProduct.gruposOpcoes) return;
        const updatedGrupos = [...activeProduct.gruposOpcoes];
        (updatedGrupos[grupoIndex] as any)[field] = value;
        setActiveProduct({ ...activeProduct, gruposOpcoes: updatedGrupos });
    };

    // --- Funções para OPÇÕES (SubProdutos) ---
    const handleAddOpcao = (grupoIndex: number) => {
        if (!activeProduct || !activeProduct.gruposOpcoes) return;

        const { nome, valor } = newOpcaoInputs[grupoIndex];
        if (!nome.trim()) {
            toast.warn("O nome da opção não pode ser vazio.");
            return;
        }

        const newOpcao: SubProduto = {
            id: 0, // ID temporário
            nomeSubProduto: nome,
            valorAdicional: valor,
            isAtivo: true,
            grupoOpcao_id: activeProduct.gruposOpcoes[grupoIndex].id
        };

        const updatedGrupos = [...activeProduct.gruposOpcoes];
        updatedGrupos[grupoIndex] = {
            ...updatedGrupos[grupoIndex],
            opcoes: [...(updatedGrupos[grupoIndex].opcoes || []), newOpcao]
        };

        setActiveProduct({ ...activeProduct, gruposOpcoes: updatedGrupos });

        // Reseta os inputs para aquele grupo
        handleNewOpcaoInputChange(grupoIndex, 'nome', '');
        handleNewOpcaoInputChange(grupoIndex, 'valor', 0);
    };

    const handleDeleteOpcao = (grupoIndex: number, opcaoIndex: number) => {
        if (!activeProduct || !activeProduct.gruposOpcoes) return;

        const updatedGrupos = [...activeProduct.gruposOpcoes];
        const updatedOpcoes = (updatedGrupos[grupoIndex].opcoes || []).filter((_, i) => i !== opcaoIndex);
        updatedGrupos[grupoIndex] = { ...updatedGrupos[grupoIndex], opcoes: updatedOpcoes };

        setActiveProduct({ ...activeProduct, gruposOpcoes: updatedGrupos });
    };

    const handleUpdateOpcao = (grupoIndex: number, opcaoIndex: number, field: keyof SubProduto, value: string | number | boolean) => {
        if (!activeProduct || !activeProduct.gruposOpcoes || !activeProduct.gruposOpcoes[grupoIndex].opcoes) return;

        const updatedGrupos = [...activeProduct.gruposOpcoes];
        const updatedOpcoes = [...updatedGrupos[grupoIndex].opcoes!];
        (updatedOpcoes[opcaoIndex] as any)[field] = value;
        updatedGrupos[grupoIndex] = { ...updatedGrupos[grupoIndex], opcoes: updatedOpcoes };

        setActiveProduct({ ...activeProduct, gruposOpcoes: updatedGrupos });
    };


    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Carregando...</p></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>{error}</p></div>;
    }

    return (
        <div className="min-h-screen flex">
            <title>Gerenciamento de Produtos</title>
            <main className="flex flex-1">
                <Sidebar />
                <div className="flex-1 p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Produtos</h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        <input type="text" placeholder="Buscar por nome do produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value === "" ? "" : parseInt(e.target.value))} className="px-4 py-2 border rounded-lg w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500" >
                            <option value="">Todas as categorias</option>
                            {categories.map((category) => (<option key={category.id} value={category.id}>{category.nomeCategoriaProduto}</option>))}
                        </select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="px-4 py-2 border rounded-lg w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500" >
                            <option value="all">Todos os status</option>
                            <option value="active">Somente ativos</option>
                            <option value="inactive">Somente inativos</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <button onClick={() => handleOpenModal(initialProductState)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                            Cadastrar Produto
                        </button>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white shadow-md rounded-xl p-5 border border-gray-100 flex flex-col justify-between cursor-pointer" onClick={() => handleOpenModal(product)}>
                                    <div className="mb-4 flex justify-center"><img src={product.image} alt={product.nomeProduto} className="w-32 h-32 object-cover rounded-lg" /></div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h2 className="text-lg font-semibold text-indigo-600">{product.nomeProduto}</h2>
                                            <span className="text-gray-600 text-sm">{getCategoryName(product.categoriaProduto_id)}</span>
                                        </div>
                                        <div className="flex items-center"><ToggleSwitch checked={product.isAtivo} onChange={() => toggleProductStatus(product.id)} /></div>
                                    </div>
                                    <p className="text-gray-800 font-semibold mb-4">Preço: R$ {Number(product.valorProduto).toFixed(2)}</p>
                                    <div className="flex justify-end gap-2 mt-auto"><button onClick={(e) => handleDeleteProduct(e, product.id)} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-1"><Trash2 size={16} />Excluir</button></div>
                                </div>
                            ))
                        ) : (<p className="text-gray-500 col-span-full">Nenhum produto encontrado.</p>)}
                    </div>
                </div>
            </main>


            {/* --- MODAL COMPLETAMENTE REFATORADO --- */}
            {activeProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]"> {/* Aumentei para max-w-2xl */}
                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {activeProduct.id ? `Editar ${activeProduct.nomeProduto}` : 'Cadastrar Novo Produto'}
                        </h2>
                        <div className="flex flex-col gap-6">

                            {/* --- Dados do Produto (inalterado, exceto IMask) --- */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Dados do Produto</h3>
                                <label className="text-gray-600">Ativo:</label>
                                <ToggleSwitch checked={activeProduct.isAtivo} onChange={() => setActiveProduct({ ...activeProduct, isAtivo: !activeProduct.isAtivo })} />
                                <label className="text-gray-600">Nome:<input type="text" value={activeProduct.nomeProduto} onChange={(e) => setActiveProduct({ ...activeProduct, nomeProduto: e.target.value })} className="w-full px-3 py-2 border rounded-lg mt-1" /></label>
                                <label className="text-gray-600">Imagem Atual:<div className="flex flex-col items-center gap-4 mt-1"><img src={newImageFile ? URL.createObjectURL(newImageFile) : activeProduct.image} alt={activeProduct.nomeProduto} className="w-32 h-32 object-cover rounded-md border" /><input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /></div></label>
                                <label className="text-gray-600">
                                    Preço:
                                    <IMaskInput
                                        mask={Number}
                                        radix=","
                                        scale={2}
                                        thousandsSeparator="."
                                        padFractionalZeros={true}
                                        unmask='typed'
                                        placeholder='R$ 0,00'
                                        value={String(activeProduct.valorProduto)} // Garantir que é string
                                        onAccept={(value) =>
                                            setActiveProduct({ ...activeProduct, valorProduto: Number(value) || 0 })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg mt-1"
                                    />
                                </label>
                                <label className="text-gray-600">Categoria:<select value={activeProduct.categoriaProduto_id} onChange={(e) => setActiveProduct({ ...activeProduct, categoriaProduto_id: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg mt-1" ><option value={0}>Selecione uma categoria</option>{categories.map((category) => (<option key={category.id} value={category.id}>{category.nomeCategoriaProduto}</option>))}</select></label>
                            </div>

                            {/* --- SEÇÃO DE GRUPOS E OPÇÕES (REFATORADA) --- */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="text-lg font-semibold text-gray-700">Grupos de Opções (Ingredientes)</h3>
                                    <button onClick={handleAddGrupo} className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1 rounded-lg transition flex items-center gap-1">
                                        <PlusCircle size={16} /> Adicionar Grupo
                                    </button>
                                </div>

                                {/* Loop dos Grupos */}
                                <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-2">
                                    {(activeProduct.gruposOpcoes || []).map((grupo, grupoIndex) => (
                                        <div key={grupo.id || grupoIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-4">

                                            {/* --- Inputs do Grupo --- */}
                                            <div className="flex items-center gap-3">
                                                <label className="flex-1 text-gray-600 text-sm">Nome do Grupo:
                                                    <input type="text" value={grupo.nomeGrupo} onChange={(e) => handleUpdateGrupo(grupoIndex, 'nomeGrupo', e.target.value)} className="w-full px-3 py-2 border rounded-lg mt-1" />
                                                </label>
                                                <label className="w-24 text-gray-600 text-sm">Mín.:
                                                    <input type="number" value={grupo.minEscolhas} onChange={(e) => handleUpdateGrupo(grupoIndex, 'minEscolhas', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg mt-1" />
                                                </label>
                                                <label className="w-24 text-gray-600 text-sm">Máx.:
                                                    <input type="number" value={grupo.maxEscolhas} onChange={(e) => handleUpdateGrupo(grupoIndex, 'maxEscolhas', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg mt-1" />
                                                </label>
                                                <button onClick={() => handleDeleteGrupo(grupoIndex)} className="text-red-500 hover:text-red-700 self-end mb-2"><Trash2 size={16} /></button>
                                            </div>

                                            {/* --- Lista de Opções (SubProdutos) --- */}
                                            <div className="flex flex-col gap-2">
                                                <h4 className="text-sm font-semibold text-gray-600">Opções deste Grupo:</h4>
                                                {(grupo.opcoes || []).map((opcao, opcaoIndex) => (
                                                    <div key={opcao.id || opcaoIndex} className="flex items-center gap-2 p-2 border rounded-md bg-white">
                                                        <input type="text" value={opcao.nomeSubProduto} onChange={(e) => handleUpdateOpcao(grupoIndex, opcaoIndex, 'nomeSubProduto', e.target.value)} className="flex-grow px-2 py-1 border-transparent focus:border-gray-300 rounded text-sm" />
                                                        <IMaskInput
                                                            mask={Number}
                                                            radix=","
                                                            scale={2}
                                                            padFractionalZeros={true}
                                                            unmask='typed'
                                                            value={String(opcao.valorAdicional)}
                                                            onAccept={(value) => handleUpdateOpcao(grupoIndex, opcaoIndex, 'valorAdicional', Number(value) || 0)}
                                                            className="w-24 text-center px-2 py-1 border-transparent focus:border-gray-300 rounded text-sm"
                                                        />
                                                        <div className="w-12 flex justify-center"><ToggleSwitch checked={opcao.isAtivo} onChange={() => handleUpdateOpcao(grupoIndex, opcaoIndex, 'isAtivo', !opcao.isAtivo)} /></div>
                                                        <div className="w-8 flex justify-center"><button onClick={() => handleDeleteOpcao(grupoIndex, opcaoIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></div>
                                                    </div>
                                                ))}
                                                {(!grupo.opcoes || grupo.opcoes.length === 0) && (<p className="text-sm text-gray-500 text-center py-2">Nenhuma opção cadastrada.</p>)}
                                            </div>

                                            {/* --- Formulário "Adicionar Opção" --- */}
                                            <div className="p-3 bg-indigo-50 rounded-lg flex items-end gap-3 border border-indigo-200">
                                                <label className="flex-1 text-sm font-medium text-gray-700">Nome da Opção
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Arroz Branco"
                                                        value={newOpcaoInputs[grupoIndex]?.nome || ''}
                                                        onChange={(e) => handleNewOpcaoInputChange(grupoIndex, 'nome', e.target.value)}
                                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                                                    />
                                                </label>
                                                <label className="w-32 text-sm font-medium text-gray-700">
                                                    Valor Adicional (R$)
                                                    <IMaskInput
                                                        mask={Number}
                                                        radix=","
                                                        scale={2}
                                                        thousandsSeparator="."
                                                        padFractionalZeros={true}
                                                        unmask='typed'
                                                        placeholder='R$ 0,00'
                                                        value={String(newOpcaoInputs[grupoIndex]?.valor || 0)}
                                                        onAccept={(value) =>
                                                            handleNewOpcaoInputChange(grupoIndex, 'valor', Number(value) || 0)
                                                        }
                                                        className="w-full px-3 py-2 border rounded-lg mt-1 text-sm"
                                                    />
                                                </label>
                                                <button onClick={() => handleAddOpcao(grupoIndex)} className="h-10 flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold px-4 py-2 rounded-lg transition"><PlusCircle size={16} />Adicionar</button>
                                            </div>
                                        </div>
                                    ))}
                                    {(activeProduct.gruposOpcoes || []).length === 0 && (
                                        <p className="text-gray-500 text-center py-4">Nenhum grupo de opções cadastrado para este produto.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- Botões (inalterados) --- */}
                        <div className="flex justify-end mt-6 gap-2">
                            <button onClick={handleCloseModal} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition">Cancelar</button>
                            <button onClick={handleSave} disabled={isSubmitting} className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>{activeProduct.id ? 'Salvar Alterações' : 'Cadastrar Produto'}</button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}