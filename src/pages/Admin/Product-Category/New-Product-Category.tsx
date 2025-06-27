import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { createCategory } from "@/services/categoryService";

interface Category {
  id: number;
  name: string;
}

export default function NewProductCategory() {
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  const handleSave = () => {
    if (!name.trim()) {
      alert("O nome da categoria não pode estar vazio.");
      return;
    }

    
    // Simular cadastro
    const newCategory: Category = {
        id: Date.now(), // Simulação de ID único
        name,
    };
    
    confirm(`Confirma o cadastro de ${newCategory.name}`)
    console.log("Nova categoria cadastrada:", newCategory);

    // Navegar de volta para a tela de gerenciamento de categorias
    navigate("/admin/category-product/consult");
  };

  const handleCancel = () => {
    navigate("/admin/category-product/consult");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex flex-1">
        <Sidebar />

        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Cadastrar Nova Categoria de Produto</h1>

          <div className="flex flex-col bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <div className="mb-4">
              <label className="block mb-1 font-medium">Nome da Categoria</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Digite o nome da categoria"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
