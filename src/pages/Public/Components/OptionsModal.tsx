import { useState, useEffect } from 'react';
import { type Produto, type SubProduto, type CartItem } from '../../../types/interfaces-types';

type OptionsModalProps = {
    product: Produto;
    initialItem?: CartItem; // Opcional: o item que estamos editando
    onClose: () => void;
    onSave: (product: Produto, subProducts: SubProduto[], quantity: number) => void;
};

export default function OptionsModal({ product, initialItem, onClose, onSave }: OptionsModalProps) {
    // Se estiver editando, começa com a quantidade do item, senão, 1.
    const [quantity, setQuantity] = useState(initialItem?.quantity || 1);
    // Se estiver editando, já começa com os sub-produtos selecionados.
    const [selectedSubProducts, setSelectedSubProducts] = useState<SubProduto[]>(initialItem?.selectedSubProducts || []);

    const handleSubProductToggle = (subProduct: SubProduto) => {
        setSelectedSubProducts((prev) =>
            prev.some(sp => sp.id === subProduct.id)
                ? prev.filter(sp => sp.id !== subProduct.id)
                : [...prev, subProduct]
        );
    };

    const subProductsTotal = selectedSubProducts.reduce((total, sp) => total + Number(sp.valorAdicional), 0);
    const totalItemPrice = (Number(product.valorProduto) + subProductsTotal) * quantity;

    const handleConfirm = () => {
        onSave(product, selectedSubProducts, quantity);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800">{product.nomeProduto}</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                
                <p className="text-gray-600">Ajuste os ingredientes e a quantidade como desejar.</p>

                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {product.subprodutos?.map(subProduct => (
                        <label key={subProduct.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                            <div>
                                <p className="font-semibold">{subProduct.nomeSubProduto}</p>
                                {Number(subProduct.valorAdicional) > 0 && (
                                    <p className="text-sm text-red-600">+ R$ {Number(subProduct.valorAdicional).toFixed(2)}</p>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                // O checkbox já vem marcado se o sub-produto estiver na lista inicial
                                defaultChecked={selectedSubProducts.some(sp => sp.id === subProduct.id)}
                                onChange={() => handleSubProductToggle(subProduct)}
                                className="h-5 w-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
                            />
                        </label>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <p className="font-semibold text-lg">Quantidade:</p>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-xl bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">-</button>
                        <span className="text-xl font-bold">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="text-xl bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">+</button>
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full bg-red-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-red-700 transition"
                >
                    {initialItem ? 'Atualizar Item' : 'Adicionar ao Carrinho'} - R$ {totalItemPrice.toFixed(2)}
                </button>
            </div>
        </div>
    );
}