import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { useNavigate } from "react-router-dom";

type Category = {
    id: number;
    name: string;
};

export default function ProductCategoryManagment() {
    const [categories, setCategories] = useState<Category[]>([
        { id: 1, name: "Pizza" },
        { id: 2, name: "Bebida" },
        { id: 3, name: "Lanche" },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editedName, setEditedName] = useState("");

    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setEditedName(category.name);
    };

    const handleSaveEdit = () => {
        if (editingCategory) {
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === editingCategory.id ? { ...cat, name: editedName } : cat
                )
            );
            setEditingCategory(null);
            setEditedName("");
        }
    };

    const handleDeleteClick = (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta categoria?")) {
            setCategories((prev) => prev.filter((cat) => cat.id !== id));
        }
    };

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navigate = useNavigate()

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
                        {filteredCategories.map((category) => (
                            <div
                                key={category.id}
                                className="border border-gray-300 rounded-md p-4 flex justify-between items-center"
                            >
                                <span className="font-medium">{category.name}</span>
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
                        ))}
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
                                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
