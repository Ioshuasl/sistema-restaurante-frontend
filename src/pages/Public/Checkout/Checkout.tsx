import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'; // Importar ícone de Editar
import { buscarCEP } from '@/functions/buscarCEP';
import { IMaskInput } from 'react-imask';
import { ToastContainer, toast } from 'react-toastify';
import { type CartItem, type Produto, type SubProduto } from '../../../types/interfaces-types';
import 'react-toastify/dist/ReactToastify.css';

// Importando o modal que acabamos de criar
import OptionsModal from '../Components/OptionsModal';

import { /*... seus outros tipos ...*/ } from "../../../types/interfaces-types";

// ... Seus tipos CartItem e Props ...
type Props = {
    cart: CartItem[];
    onConfirm: () => void;
    onIncrease: (cartItemId: string) => void;
    onDecrease: (cartItemId: string) => void;
    // NOVO: Prop para atualizar um item
    onUpdateItem: (cartItemId: string, newConfig: { product: Produto, subProducts: SubProduto[], quantity: number }) => void;
};

export default function Checkout({ cart, onConfirm, onIncrease, onDecrease, onUpdateItem }: Props) {
    // ... Seus estados existentes ...
    
    // NOVO: Estado para controlar o modal de edição
    const [itemToEdit, setItemToEdit] = useState<CartItem | null>(null);

    // ... Suas funções existentes (handleSubmit, buscarCEP, etc.) ...

    const handleSaveEdit = (product: Produto, subProducts: SubProduto[], quantity: number) => {
        if (itemToEdit) {
            onUpdateItem(itemToEdit.cartItemId, { product, subProducts, quantity });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
                <h1 className="text-2xl ...">Finalizar Pedido</h1>
                
                <div className="mb-8">
                    <h2 className="text-lg ...">Resumo do Pedido:</h2>
                    <ul className="divide-y divide-gray-200">
                        {cart.map((item) => (
                            <li key={item.cartItemId} className="py-4 flex justify-between items-start">
                                <div className="flex items-start gap-4 flex-1">
                                    <img src={item.product.image} alt={item.product.nomeProduto} className="w-16 h-16 object-cover rounded" />
                                    <div>
                                        <p className="font-medium text-gray-800">{item.product.nomeProduto}</p>
                                        {item.selectedSubProducts.length > 0 && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                {item.selectedSubProducts.map(sp => (
                                                    <p key={sp.id}>+ {sp.nomeSubProduto}</p>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => onDecrease(item.cartItemId)} className="px-2 ...">−</button>
                                            <span className="font-medium">{item.quantity}</span>
                                            <button onClick={() => onIncrease(item.cartItemId)} className="px-2 ...">+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-md font-semibold text-gray-700 whitespace-nowrap">
                                        R$ {(item.unitPriceWithSubProducts * item.quantity).toFixed(2)}
                                    </p>
                                    
                                    {/* NOVO: Botão de Editar */}
                                    <button onClick={() => setItemToEdit(item)} className="text-xs text-blue-600 hover:underline mt-2 flex items-center gap-1">
                                        <Edit size={12} /> Editar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {/* ... Restante do resumo ... */}
                </div>

                {/* ... Formulário e outros botões ... */}
            </div>

            {/* NOVO: Renderização do modal de edição */}
            {itemToEdit && (
                <OptionsModal
                    product={itemToEdit.product}
                    initialItem={itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    onSave={handleSaveEdit}
                />
            )}
            
            <ToastContainer />
        </div>
    );
}