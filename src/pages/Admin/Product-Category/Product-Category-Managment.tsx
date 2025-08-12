import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { type CategoriaProduto } from "../../../types/interfaces-types";
import {
    getAllCategoriasProdutos,
    updateCategoriaProduto,
    deleteCategoriaProduto
} from "../../../services/categoriaProdutoService";

export default function ProductCategoryManagment() {
    const [categories, setCategories] = useState<CategoriaProduto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [editingCategory, setEditingCategory] = useState<CategoriaProduto | null>(null);
    const [editedName, setEditedName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const categoriesData = await getAllCategoriasProdutos();
            setCategories(categoriesData);
        } catch (err) {
            console.error("Erro ao buscar categorias:", err);
            setError("Não foi possível carregar as categorias.");
            toast.error("Erro ao carregar categorias.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEditClick = (category: CategoriaProduto) => {
        setEditingCategory(category);
        setEditedName(category.nomeCategoriaProduto);
    };

    const handleSaveEdit = async () => {
        if (!editingCategory) return;
        setIsSubmitting(true);

        try {
            await updateCategoriaProduto(editingCategory.id, { nomeCategoriaProduto: editedName });
            toast.success(`Categoria "${editedName}" atualizada com sucesso.`);
            setEditingCategory(null);
            setEditedName("");
            fetchCategories();
        } catch (err) {
            console.error("Erro ao salvar edição:", err);
            toast.error("Erro ao salvar as alterações da categoria.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta categoria?")) {
            try {
                await deleteCategoriaProduto(id);
                toast.success("Categoria excluída com sucesso.");
                fetchCategories();
            } catch (err) {
                console.error("Erro ao excluir categoria:", err);
                toast.error("Erro ao excluir a categoria.");
            }
        }
    };

    const filteredCategories = categories.filter((cat) =>
        cat.nomeCategoriaProduto.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando categorias...</p>
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
                    <h1 className="text-2xl font-bold mb-4">Gerenciamento de Categorias de Produto</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <input
                            type="text"
                            placeholder="Filtrar categorias"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-64"
                        />
                    </div>

                    <button
                        className="bg-blue-600 mb-4 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => {navigate('/admin/category-product/new')}}
                    >
                        Cadastrar Nova Categoria
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="border border-gray-300 rounded-md p-4 flex justify-between items-center"
                                >
                                    <span className="font-medium">{category.nomeCategoriaProduto}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(category)}
                                            className="p-2 rounded hover:bg-gray-100"
                                            title="Editar"
                                        >
                                            <Pencil className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(category.id)}
                                            className="p-2 rounded hover:bg-gray-100"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Nenhuma categoria encontrada.</p>
                        )}
                    </div>

                    {/* Modal de Edição */}
                    {editingCategory && (
                        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.70)] z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-semibold mb-4">Editar Categoria</h2>
                                <div className="mb-4">
                                    <label className="block mb-1 text-sm font-medium">Nome da Categoria</label>
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setEditingCategory(null)}
                                        className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSubmitting}
                                        className={`px-4 py-2 rounded-md text-white hover:bg-green-700 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'}`}
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <ToastContainer />
        </div>
    );
}