import { IMaskInput } from 'react-imask';
import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Trash2, PlusCircle, ShieldAlert } from "lucide-react";
import ToggleSwitch from "../Components/ToggleSwitch";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    type Produto,
    type CategoriaProduto,
    type IGrupoOpcao,
    type IItemOpcao
} from "../../../types/interfaces-types";
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

const initialProductState: Produto = {
    id: 0,
    nomeProduto: "",
    valorProduto: 0,
    image: "",
    isAtivo: true,
    categoriaProduto_id: 0,
    grupos: [],
    createdAt: '',
    updatedAt: ''
};

const newGroupTemplate: IGrupoOpcao = {
    id: -(Date.now()),
    nome: "Novo Grupo",
    minEscolhas: 1,
    maxEscolhas: 1,
    produto_id: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itens: []
};

const newItemTemplate = (groupId: number): IItemOpcao => ({
    id: -(Date.now()),
    nome: "Novo Item",
    valorAdicional: 0,
    isAtivo: true,
    grupoOpcao_id: groupId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});


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

    const handleOpenModal = (productData: Produto) => {
        setActiveProduct({ ...productData, grupos: productData.grupos || [] });
    };

    const handleCloseModal = () => {
        setActiveProduct(null);
        setNewImageFile(null);
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

    const handleSave = async () => {
        if (!activeProduct) return;
        setIsSubmitting(true);

        if (!activeProduct.nomeProduto || activeProduct.categoriaProduto_id === 0) {
            toast.error("Nome do produto e categoria são obrigatórios.");
            setIsSubmitting(false);
            return;
        }

        // Validação dos grupos (já estava correta com || [])
        for (const grupo of (activeProduct.grupos || [])) {
            if (grupo.maxEscolhas < grupo.minEscolhas) {
                toast.error(`No grupo "${grupo.nome}", o máximo de escolhas não pode ser menor que o mínimo.`);
                setIsSubmitting(false);
                return;
            }
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

        // Monta o PAYLOAD (já estava correta com || [])
        const payload = {
            ...activeProduct,
            image: imageUrl,
            grupos: (activeProduct.grupos || []).map(group => ({
                id: group.id > 0 ? group.id : undefined,
                nome: group.nome,
                minEscolhas: group.minEscolhas,
                maxEscolhas: group.maxEscolhas,
                itens: group.itens.map(item => ({
                    id: item.id > 0 ? item.id : undefined,
                    nome: item.nome,
                    valorAdicional: item.valorAdicional,
                    isAtivo: item.isAtivo
                }))
            }))
        };

        try {
            if (activeProduct.id) {
                // @ts-ignore
                await updateProduto(activeProduct.id, payload);
                toast.success(`Produto #${activeProduct.id} atualizado com sucesso.`);
            } else {
                // @ts-ignore
                await createProduto(payload);
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


    // --- FUNÇÕES DE GRUPO/ITEM CORRIGIDAS ---

    const handleAddGroup = () => {
        if (!activeProduct) return;
        const newGroup = {
            ...newGroupTemplate,
            id: -(Date.now()),
            produto_id: activeProduct.id
        };
        setActiveProduct(prev => ({
            ...prev!,
            // Correção: Garante que grupos não seja undefined
            grupos: [...(prev!.grupos || []), newGroup]
        }));
    };

    const handleUpdateGroup = (groupIndex: number, field: keyof IGrupoOpcao, value: any) => {
        if (!activeProduct) return;
        // Correção: Garante que grupos não seja undefined
        const updatedGrupos = [...(activeProduct.grupos || [])];
        if (!updatedGrupos[groupIndex]) return; // Proteção extra

        const groupToUpdate = { ...updatedGrupos[groupIndex] };
        (groupToUpdate as any)[field] = value;
        updatedGrupos[groupIndex] = groupToUpdate;
        setActiveProduct(prev => ({ ...prev!, grupos: updatedGrupos }));
    };

    const handleDeleteGroup = (groupIndex: number) => {
        if (!activeProduct) return;
        if (window.confirm("Tem certeza que deseja excluir este grupo e todos os seus itens?")) {
            // Correção: Garante que grupos não seja undefined e tipa os parâmetros do filter
            const updatedGrupos = (activeProduct.grupos || []).filter((_: IGrupoOpcao, idx: number) => idx !== groupIndex);
            setActiveProduct(prev => ({ ...prev!, grupos: updatedGrupos }));
        }
    };

    const handleAddItem = (groupIndex: number) => {
        if (!activeProduct || !(activeProduct.grupos || [])[groupIndex]) return;
        
        const newItem = {
             // Correção: Garante que grupos não seja undefined
            ...newItemTemplate((activeProduct.grupos || [])[groupIndex].id),
            id: -(Date.now()),
        };
        
        // Correção: Garante que grupos não seja undefined
        const updatedGrupos = [...(activeProduct.grupos || [])];
        const groupToUpdate = { ...updatedGrupos[groupIndex] };
        groupToUpdate.itens = [...groupToUpdate.itens, newItem];
        updatedGrupos[groupIndex] = groupToUpdate;
        setActiveProduct(prev => ({ ...prev!, grupos: updatedGrupos }));
    };

    const handleUpdateItem = (groupIndex: number, itemIndex: number, field: keyof IItemOpcao, value: any) => {
        if (!activeProduct) return;
        
        // Correção: Garante que grupos não seja undefined
        const updatedGrupos = [...(activeProduct.grupos || [])];
        if (!updatedGrupos[groupIndex] || !updatedGrupos[groupIndex].itens[itemIndex]) return; // Proteção extra

        const groupToUpdate = { ...updatedGrupos[groupIndex] };
        const itemToUpdate = { ...groupToUpdate.itens[itemIndex] };
        (itemToUpdate as any)[field] = value;
        groupToUpdate.itens[itemIndex] = itemToUpdate;
        updatedGrupos[groupIndex] = groupToUpdate;
        setActiveProduct(prev => ({ ...prev!, grupos: updatedGrupos }));
    };

    const handleDeleteItem = (groupIndex: number, itemIndex: number) => {
        if (!activeProduct) return;
        
        // Correção: Garante que grupos não seja undefined
        const updatedGrupos = [...(activeProduct.grupos || [])];
        if (!updatedGrupos[groupIndex]) return; // Proteção extra

        const groupToUpdate = { ...updatedGrupos[groupIndex] };
        groupToUpdate.itens = groupToUpdate.itens.filter((_: IItemOpcao, idx: number) => idx !== itemIndex);
        updatedGrupos[groupIndex] = groupToUpdate;
        setActiveProduct(prev => ({ ...prev!, grupos: updatedGrupos }));
    };


    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Carregando...</p></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>{error}</p></div>;
    }

    // --- JSX CORRIGIDO ---
    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Produtos</title>
            <main className="flex flex-1">
                <Sidebar />
                <div className="flex-1 p-6">
                    {/* ... (O conteúdo principal da página não muda) ... */}
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

            {activeProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {activeProduct.id ? `Editar ${activeProduct.nomeProduto}` : 'Cadastrar Novo Produto'}
                        </h2>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Dados do Produto</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <label className="text-gray-600">Ativo:</label>
                                        <ToggleSwitch checked={activeProduct.isAtivo} onChange={() => setActiveProduct({ ...activeProduct, isAtivo: !activeProduct.isAtivo })} />
                                    </div>
                                    <label className="text-gray-600 col-span-2">Nome:<input type="text" value={activeProduct.nomeProduto} onChange={(e) => setActiveProduct({ ...activeProduct, nomeProduto: e.target.value })} className="w-full px-3 py-2 border rounded-lg mt-1" /></label>
                                    <label className="text-gray-600">
                                        Preço:
                                        <IMaskInput mask={Number} radix="," scale={2} thousandsSeparator="." padFractionalZeros={true} unmask='typed' placeholder='R$ 0,00' value={activeProduct.valorProduto.toString()} onAccept={(value) => setActiveProduct({ ...activeProduct, valorProduto: Number(value) || 0 })} className="w-full px-3 py-2 border rounded-lg mt-1" />
                                    </label>
                                    <label className="text-gray-600">Categoria:<select value={activeProduct.categoriaProduto_id} onChange={(e) => setActiveProduct({ ...activeProduct, categoriaProduto_id: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg mt-1" ><option value={0}>Selecione uma categoria</option>{categories.map((category) => (<option key={category.id} value={category.id}>{category.nomeCategoriaProduto}</option>))}</select></label>
                                    <label className="text-gray-600 col-span-2">Imagem:<div className="flex flex-col items-center gap-4 mt-1"><img src={newImageFile ? URL.createObjectURL(newImageFile) : activeProduct.image} alt={activeProduct.nomeProduto} className="w-32 h-32 object-cover rounded-md border" /><input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /></div></label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="text-lg font-semibold text-gray-700">Grupos de Opções</h3>
                                    <button onClick={handleAddGroup} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-semibold px-3 py-1 rounded-lg transition flex items-center gap-1"><PlusCircle size={16} />Add Grupo</button>
                                </div>

                                {/* Correção: Garante que grupos não seja undefined */}
                                {(!activeProduct.grupos || activeProduct.grupos.length === 0) && (
                                    <p className="text-sm text-gray-500 text-center py-4">Nenhum grupo de opções cadastrado.</p>
                                )}

                                <div className="flex flex-col gap-4">
                                     {/* Correção: Garante que grupos não seja undefined */}
                                    {(activeProduct.grupos || []).map((grupo, groupIndex) => (
                                        <div key={grupo.id} className="bg-gray-50 rounded-lg p-4 border">
                                            <div className="flex items-center justify-between gap-2 pb-3 border-b mb-3">
                                                <input
                                                    type="text"
                                                    value={grupo.nome}
                                                    onChange={(e) => handleUpdateGroup(groupIndex, 'nome', e.target.value)}
                                                    className="text-md font-semibold text-indigo-700 bg-transparent border-0 border-b-2 border-transparent focus:border-indigo-300 focus:ring-0 p-0"
                                                    placeholder='Nome do Grupo'
                                                />
                                                <button onClick={() => handleDeleteGroup(groupIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <label className="text-sm font-medium text-gray-700">Mínimo de escolhas
                                                    <IMaskInput
                                                        mask={Number}
                                                        scale={0}
                                                        value={String(grupo.minEscolhas)}
                                                        onAccept={(value) => handleUpdateGroup(groupIndex, 'minEscolhas', Number(value))}
                                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                                                    />
                                                </label>
                                                <label className="text-sm font-medium text-gray-700">Máximo de escolhas
                                                    <IMaskInput
                                                        mask={Number}
                                                        scale={0}
                                                        value={String(grupo.maxEscolhas)}
                                                        onAccept={(value) => handleUpdateGroup(groupIndex, 'maxEscolhas', Number(value))}
                                                        className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                                                    />
                                                </label>
                                                {grupo.maxEscolhas < grupo.minEscolhas && (
                                                    <p className='col-span-2 text-xs text-red-600 flex items-center gap-1'><ShieldAlert size={14} />O máximo não pode ser menor que o mínimo.</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <h4 className="text-sm font-semibold text-gray-600 mb-1">Itens do Grupo</h4>
                                                
                                                <div className="flex items-center gap-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                                                    <span className="flex-grow">Descrição</span>
                                                    <span className="w-28 text-center">Valor Adic.</span>
                                                    <span className="w-16 text-center">Ativo</span>
                                                    <span className="w-10 text-center">Ação</span>
                                                </div>

                                                <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                                                    {grupo.itens.map((item, itemIndex) => (
                                                        <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-white">
                                                            <input
                                                                type="text"
                                                                value={item.nome}
                                                                onChange={(e) => handleUpdateItem(groupIndex, itemIndex, 'nome', e.target.value)}
                                                                className="flex-grow px-2 py-1 border rounded"
                                                                placeholder='Nome do Item'
                                                            />
                                                            <IMaskInput
                                                                mask={Number}
                                                                radix=","
                                                                scale={2}
                                                                thousandsSeparator="."
                                                                padFractionalZeros={true}
                                                                unmask='typed'
                                                                value={String(item.valorAdicional)}
                                                                onAccept={(value) => handleUpdateItem(groupIndex, itemIndex, 'valorAdicional', Number(value))}
                                                                className="w-28 text-center px-2 py-1 border rounded"
                                                            />
                                                            <div className="w-16 flex justify-center">
                                                                <ToggleSwitch checked={item.isAtivo} onChange={() => handleUpdateItem(groupIndex, itemIndex, 'isAtivo', !item.isAtivo)} />
                                                            </div>
                                                            <div className="w-10 flex justify-center">
                                                                <button onClick={() => handleDeleteItem(groupIndex, itemIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {grupo.itens.length === 0 && (
                                                    <p className="text-sm text-gray-500 text-center py-4">Nenhum item cadastrado neste grupo.</p>
                                                )}
                                                
                                                <button onClick={() => handleAddItem(groupIndex)} className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-semibold px-3 py-2 rounded-lg transition"><PlusCircle size={16} />Adicionar Item</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

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