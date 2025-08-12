import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Pencil, Trash2 } from "lucide-react";
import ToggleSwitch from "../Components/ToggleSwitch";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { type Produto, type CategoriaProduto } from "../../../types/interfaces-types";
import {
    getAllProdutos,
    updateProduto,
    toggleProdutoAtivo,
    deleteProduto
} from "../../../services/produtoService";
import { getAllCategoriasProdutos } from "../../../services/categoriaProdutoService";
import api from '../../../services/api';

type StatusFilter = "all" | "active" | "inactive";

export default function ProductManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | "">("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [products, setProducts] = useState<Produto[]>([]);
    const [categories, setCategories] = useState<CategoriaProduto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Novo estado para a nova imagem
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    const navigate = useNavigate();

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
            fetchProductsAndCategories(); // Recarrega para obter os dados mais recentes
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
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.imageUrl;
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            throw new Error("Erro ao fazer upload da imagem.");
        }
    };

    const handleEditSave = async () => {
        if (!editingProduct) return;
        setIsSubmitting(true);
        let updatedImageUrl = editingProduct.image;

        try {
            // Se um novo arquivo de imagem foi selecionado, faça o upload primeiro
            if (newImageFile) {
                updatedImageUrl = await uploadImage(newImageFile);
            }

            await updateProduto(editingProduct.id, {
                nomeProduto: editingProduct.nomeProduto,
                valorProduto: editingProduct.valorProduto,
                image: updatedImageUrl, // Usa a nova URL ou a original
                isAtivo: editingProduct.isAtivo,
                categoriaProduto_id: editingProduct.categoriaProduto_id,
            });
            toast.success(`Produto #${editingProduct.id} atualizado com sucesso.`);
            setEditingProduct(null);
            setNewImageFile(null); // Limpa o estado da nova imagem
            fetchProductsAndCategories();
        } catch (err) {
            console.error("Erro ao salvar edição:", err);
            toast.error("Erro ao salvar as alterações do produto.");
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando produtos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Produtos</title>

            <main className="flex flex-1">
                <Sidebar />
                <div className="flex-1 p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Produtos</h1>

                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        {/* Campo de busca */}
                        <input
                            type="text"
                            placeholder="Buscar por nome do produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {/* Filtro de categoria */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value === "" ? "" : parseInt(e.target.value))}
                            className="px-4 py-2 border rounded-lg w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todas as categorias</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.nomeCategoriaProduto}
                                </option>
                            ))}
                        </select>

                        {/* Filtro de status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            className="px-4 py-2 border rounded-lg w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">Todos os status</option>
                            <option value="active">Somente ativos</option>
                            <option value="inactive">Somente inativos</option>
                        </select>
                    </div>

                    {/* Botão de Cadastrar Produto */}
                    <div className="mb-4">
                        <button
                            onClick={() => navigate("/admin/product/new")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            Cadastrar Produto
                        </button>
                    </div>

                    {/* Lista de Produtos */}
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white shadow-md rounded-xl p-5 border border-gray-100 flex flex-col justify-between cursor-pointer"
                                    onClick={() => setEditingProduct(product)}
                                >
                                    {/* IMAGEM */}
                                    <div className="mb-4 flex justify-center">
                                        <img
                                            src={product.image}
                                            alt={product.nomeProduto}
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Informações do produto */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h2 className="text-lg font-semibold text-indigo-600">{product.nomeProduto}</h2>
                                            <span className="text-gray-600 text-sm">
                                                {getCategoryName(product.categoriaProduto_id)}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <ToggleSwitch
                                                checked={product.isAtivo}
                                                onChange={() => toggleProductStatus(product.id)}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-gray-800 font-semibold mb-4">
                                        Preço: R$ {Number(product.valorProduto).toFixed(2)}
                                    </p>

                                    {/* Ações */}
                                    <div className="flex justify-end gap-2 mt-auto">
                                        <button
                                            onClick={(e) => handleDeleteProduct(e, product.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-1"
                                        >
                                            <Trash2 size={16} />
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Nenhum produto encontrado.</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de edição */}
            {editingProduct && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-250 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Editar {editingProduct.nomeProduto}</h2>

                        <div className="flex flex-col gap-3">
                            {/* Ativo */}
                            <label className="text-gray-600">Ativo:</label>
                            <ToggleSwitch
                                checked={editingProduct.isAtivo}
                                onChange={() =>
                                    setEditingProduct({
                                        ...editingProduct,
                                        isAtivo: !editingProduct.isAtivo,
                                    })
                                }
                            />
                            {/* Nome */}
                            <label className="text-gray-600">
                                Nome:
                                <input
                                    type="text"
                                    value={editingProduct.nomeProduto}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            nomeProduto: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </label>

                            {/* Imagem */}
                            <label className="text-gray-600">
                                Imagem Atual:
                                <div className="flex flex-col items-center gap-4 mt-2">
                                    <img
                                        src={newImageFile ? URL.createObjectURL(newImageFile) : editingProduct.image}
                                        alt={editingProduct.nomeProduto}
                                        className="w-30 h-30 object-cover rounded-md border"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                                        className="w-full text-gray-600"
                                    />
                                </div>
                            </label>

                            {/* Preço */}
                            <label className="text-gray-600">
                                Preço:
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editingProduct.valorProduto}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            valorProduto: parseFloat(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </label>

                            {/* Categoria */}
                            <label className="text-gray-600">
                                Categoria:
                                <select
                                    value={editingProduct.categoriaProduto_id}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            categoriaProduto_id: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.nomeCategoriaProduto}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setNewImageFile(null); // Limpa a imagem ao fechar
                                }}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={isSubmitting}
                                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}