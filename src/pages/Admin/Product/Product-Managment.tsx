import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Pencil, Trash2 } from "lucide-react";
import ToggleSwitch from "../Components/ToggleSwitch";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    isAtivo: boolean;
    imageUrl: string;
};

type Category = {
    id: number;
    name: string;
};

type StatusFilter = "all" | "active" | "inactive";

export default function ProductManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | "">("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [products, setProducts] = useState<Product[]>([]);

    async function fetchProducts(){
        try {
            const data = await getAllProducts()
            console.log(data)
            setProducts(data)
        } catch (error) {
            console.error(error)
        }
    }

    const [categories, setCategories] = useState<Category[]>([]);

    async function fetchCategories(){
        try {
            const data = await getAllCategories()
            console.log(data)
            setCategories(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    })

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filteredProducts = products.filter((product) => {
        const matchName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === "" || product.categoryId === selectedCategory;

        // Filtra conforme status selecionado
        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && product.isAtivo) ||
            (statusFilter === "inactive" && !product.isAtivo);

        return matchName && matchCategory && matchStatus;
    });

    const toggleProductStatus = (productId: number) => {
        console.log(`Simulando PUT para alternar status do produto ${productId}...`);
        setTimeout(() => {
            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product.id === productId ? { ...product, isAtivo: !product.isAtivo } : product
                )
            );
            alert(`Status do produto ${productId} atualizado (simulação).`);
        }, 1000);
    };

    const handleEditSave = () => {
        if (editingProduct) {
            console.log(`Simulando PUT para editar produto ${editingProduct.id}...`);
            setTimeout(() => {
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product.id === editingProduct.id ? editingProduct : product
                    )
                );
                alert(`Produto ${editingProduct.id} atualizado (simulação).`);
                setEditingProduct(null);
            }, 1000);
        }
    };

    const getCategoryName = (categoryId: number) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : "Categoria Desconhecida";
    };

    const navigate = useNavigate()

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
                                    {category.name}
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
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white shadow-md rounded-xl p-5 border border-gray-100 flex flex-col justify-between"
                            >
                                {/* IMAGEM */}
                                <div className="mb-4 flex justify-center">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                </div>

                                {/* Informações do produto */}
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h2 className="text-lg font-semibold text-indigo-600">{product.name}</h2>
                                        <span className="text-gray-600 text-sm">
                                            {getCategoryName(product.categoryId)}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <ToggleSwitch
                                            checked={product.isAtivo}
                                            onChange={() => toggleProductStatus(product.id)}
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                <p className="text-gray-800 font-semibold mb-4">
                                    Preço: R$ {product.price.toFixed(2)}
                                </p>

                                {/* Ações */}
                                <div className="flex justify-end gap-2 mt-auto">
                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-1"
                                    >
                                        <Pencil size={16} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => alert(`Excluir produto ${product.id} (simulação).`)}
                                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-1"
                                    >
                                        <Trash2 size={16} />
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Modal de edição */}
            {editingProduct && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.70)] z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-250 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Editar {editingProduct.name}</h2>

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
                                    value={editingProduct.name}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </label>

                            {/* Imagem */}
                            <label className="text-gray-600">
                                Imagem do Produto:
                                <div className="flex items-center gap-4 mt-2">
                                    {/* Pré-visualização da imagem */}
                                    {editingProduct.imageUrl && (
                                        <img
                                            src={editingProduct.imageUrl}
                                            alt={editingProduct.name}
                                            className="w-30 h-30 object-cover rounded-md border"
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const imageUrl = URL.createObjectURL(file);
                                                setEditingProduct({
                                                    ...editingProduct,
                                                    imageUrl: imageUrl,
                                                });
                                            }
                                        }}
                                        className="text-gray-600"
                                    />
                                </div>
                            </label>

                            {/* Descrição */}
                            <label className="text-gray-600">
                                Descrição:
                                <textarea
                                    value={editingProduct.description}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </label>

                            {/* Preço */}
                            <label className="text-gray-600">
                                Preço:
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editingProduct.price}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            price: parseFloat(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </label>

                            {/* Categoria */}
                            <label className="text-gray-600">
                                Categoria:
                                <select
                                    value={editingProduct.categoryId}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            categoryId: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </label>


                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditSave}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
