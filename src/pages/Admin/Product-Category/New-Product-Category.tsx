import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { createCategoriaProduto } from '../../../services/categoriaProdutoService';

export default function NewProductCategory() {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('O nome da categoria não pode ser vazio.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createCategoriaProduto({ nomeCategoriaProduto: categoryName });
      toast.success(`Categoria "${categoryName}" cadastrada com sucesso!`);
      setCategoryName('');
      navigate('/admin/category-product');
    } catch (error) {
      console.error('Erro ao cadastrar categoria:', error);
      toast.error('Erro ao cadastrar categoria. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/category-product');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <title>Gerenciamento de Produtos</title>
      <main className="flex flex-1 bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Cadastrar Nova Categoria
            </h2>
            <div className="flex flex-col gap-4">
              <label className="text-sm text-gray-600">
                Nome da Categoria:
                <input
                  type="text"
                  value={categoryName}
                  placeholder="Ex: Pizzas, Bebidas, Lanches..."
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isSubmitting}
                  className={`flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}