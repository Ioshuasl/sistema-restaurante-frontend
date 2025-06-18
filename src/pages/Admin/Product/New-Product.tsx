import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // para redirecionar
import ToggleSwitch from '../Components/ToggleSwitch';
import Sidebar from '../Components/Sidebar';

// Interface para categoria
type Category = {
  id: number;
  name: string;
};

// Interface para produto
interface Product {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  isAtivo: boolean;
  image: File | null;
}

export default function NewProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAtivo, setIsAtivo] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  const [categories] = useState<Category[]>([
    { id: 1, name: 'Pizza' },
    { id: 2, name: 'Bebida' },
    { id: 3, name: 'Lanche' },
  ]);

  const handleCreateProduct = async () => {
    // Validação simples
    if (!name || !description || !price || !categoryId || !image) {
      alert('Preencha todos os campos!');
      return;
    }

    const newProduct: Product = {
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      isAtivo,
      image,
    };

    try {
      console.log('Enviando produto:', newProduct);
      // Aqui poderia ser uma requisição real:
      // await api.post('/products', newProduct);

      setTimeout(() => {
        alert('Produto cadastrado com sucesso!');
        navigate('/admin/product/consult'); // volta para a listagem de produtos
      }, 1000);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard'); // redireciona para a listagem de produtos
  };

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
                      value={name}
                      placeholder='Nome'
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </label>
                </div>
                <div className='flex flex-col flex-1 gap-4'>
                  <label className="text-sm text-gray-600">
                    Categoria:
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
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
                <div className='flex flex-col flex-0.5 gap-4'>
                  <label className="text-sm text-gray-600">
                    Preço:
                    <input
                      type="number"
                      step="0.01"
                      placeholder='00.00'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </label>
                </div>
              </div>
              <label className="text-sm text-gray-600">
                Descrição:
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </label>


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
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
