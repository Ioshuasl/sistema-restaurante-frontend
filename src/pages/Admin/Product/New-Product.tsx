import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../Components/ToggleSwitch';
import Sidebar from '../Components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IMaskInput } from 'react-imask';

import { type CategoriaProduto, type CreateProdutoPayload } from '../../../types/interfaces-types';
import { createProduto } from '../../../services/produtoService';
import { getAllCategoriasProdutos } from '../../../services/categoriaProdutoService';
import api from '../../../services/api';

export default function NewProduct() {
  const navigate = useNavigate();

  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [categoriaProduto_id, setCategoriaProduto_id] = useState('');
  const [isAtivo, setIsAtivo] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<CategoriaProduto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategoriasProdutos();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        toast.error("Não foi possível carregar as categorias.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

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

  const handleCreateProduct = async () => {
    if (!nomeProduto || !valorProduto || !categoriaProduto_id || !imageFile) {
      toast.error('Por favor, preencha todos os campos e selecione uma imagem.');
      return;
    }

    setIsSubmitting(true);
    let uploadedImageUrl = '';

    try {
      uploadedImageUrl = await uploadImage(imageFile);

      const newProductPayload: CreateProdutoPayload = {
        nomeProduto,
        valorProduto: parseFloat(valorProduto),
        categoriaProduto_id: parseInt(categoriaProduto_id),
        isAtivo,
        image: uploadedImageUrl,
      };

      await createProduto(newProductPayload);
      toast.success('Produto cadastrado com sucesso!');
      navigate('/admin/product/consult');
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      toast.error('Erro ao cadastrar produto. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/product/consult');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <title>Gerenciamento de Produtos</title>
      <main className="flex flex-1 bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full flex-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Cadastrar Produto
            </h2>
            <form className="flex flex-col gap-4">
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                <div className='flex flex-col flex-2 gap-4'>
                  <label className="text-sm text-gray-600">
                    Nome:
                    <input
                      type="text"
                      value={nomeProduto}
                      placeholder='Nome'
                      onChange={(e) => setNomeProduto(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </label>
                </div>
                <div className='flex flex-col flex-1 gap-4'>
                  <label className="text-sm text-gray-600">
                    Categoria:
                    <select
                      value={categoriaProduto_id}
                      onChange={(e) => setCategoriaProduto_id(e.target.value)}
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
                <div className='flex flex-col flex-0.5 gap-4'>
                  <label className="text-sm text-gray-600">
                    Preço:
                    <IMaskInput
                      mask="R$ num" // Adiciona o prefixo
                      blocks={{
                        num: {
                          mask: Number,
                          radix: ",",
                          scale: 2,
                          thousandsSeparator: ".",
                          padFractionalZeros: true,
                          normalizeZeros: true,
                        },
                      }}
                      placeholder='R$ 0,00'
                      value={valorProduto}
                      onAccept={(value) => setValorProduto(value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </label>
                </div>
              </div>

              <label className="text-sm text-gray-600">
                Ativo:
                <div className="flex items-center mt-1">
                  <ToggleSwitch
                    checked={isAtivo}
                    onChange={() => setIsAtivo(!isAtivo)}
                  />
                </div>
              </label>

              <label className="text-sm text-gray-600">
                Imagem:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
                  onClick={handleCreateProduct}
                  disabled={isSubmitting}
                  className={`flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}