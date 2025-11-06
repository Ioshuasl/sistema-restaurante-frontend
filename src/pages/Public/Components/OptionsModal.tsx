import { useState } from 'react';
// 1. Importar tipos e Toast
import { type Produto, type SubProduto, type CartItem, type GrupoOpcao } from '../../../types/interfaces-types';
import { toast } from 'react-toastify'; 
// (Assumindo que o ToastContainer já está no Checkout.tsx)

type OptionsModalProps = {
    product: Produto;
    initialItem?: CartItem; // Opcional: o item que estamos editando
    onClose: () => void;
    onSave: (product: Produto, subProducts: SubProduto[], quantity: number) => void;
};

export default function OptionsModal({ product, initialItem, onClose, onSave }: OptionsModalProps) {
    const [quantity, setQuantity] = useState(initialItem?.quantity || 1);
    const [selectedSubProducts, setSelectedSubProducts] = useState<SubProduto[]>(initialItem?.selectedSubProducts || []);

    // 2. LÓGICA DE SELEÇÃO ATUALIZADA
    const handleSelectionChange = (opcao: SubProduto, grupo: GrupoOpcao) => {
        setSelectedSubProducts((prevSelected) => {
            const isRadio = grupo.maxEscolhas === 1;
            const isSelected = prevSelected.some(sp => sp.id === opcao.id);
            
            const otherGroupOptions = prevSelected.filter(sp => sp.grupoOpcao_id !== grupo.id);
            const currentGroupOptions = prevSelected.filter(sp => sp.grupoOpcao_id === grupo.id);

            if (isRadio) {
                // Lógica de Rádio: substitui
                return [...otherGroupOptions, opcao];
            } else {
                // Lógica de Checkbox
                if (isSelected) {
                    // Remove
                    return [...otherGroupOptions, ...currentGroupOptions.filter(sp => sp.id !== opcao.id)];
                } else {
                    // Adiciona, se houver espaço
                    if (currentGroupOptions.length < grupo.maxEscolhas) {
                        return [...prevSelected, opcao];
                    } else {
                        toast.warn(`Você só pode escolher até ${grupo.maxEscolhas} opções do grupo "${grupo.nomeGrupo}".`);
                        return prevSelected; // Retorna o estado anterior (não adiciona)
                    }
                }
            }
        });
    };

    const subProductsTotal = selectedSubProducts.reduce((total, sp) => total + Number(sp.valorAdicional), 0);
    const totalItemPrice = (Number(product.valorProduto) + subProductsTotal) * quantity;

    // 3. LÓGICA DE CONFIRMAÇÃO ATUALIZADA (com validação)
    const handleConfirm = () => {
        // Validar 'minEscolhas' antes de salvar
        let isValid = true;
        product.gruposOpcoes?.forEach(grupo => {
            const selectedCount = selectedSubProducts.filter(sp => sp.grupoOpcao_id === grupo.id).length;
            if (selectedCount < grupo.minEscolhas) {
                isValid = false;
                toast.error(`Escolha pelo menos ${grupo.minEscolhas} opção(ões) do grupo "${grupo.nomeGrupo}".`);
            }
        });

        if (isValid) {
            onSave(product, selectedSubProducts, quantity);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800">{product.nomeProduto}</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                
                <p className="text-gray-600">Ajuste os ingredientes e a quantidade como desejar.</p>

                {/* --- 4. JSX ATUALIZADO PARA GRUPOS --- */}
                <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                    {product.gruposOpcoes?.map(grupo => (
                        <div key={grupo.id} className="border rounded-lg p-3">
                            <h3 className="font-bold text-gray-700">{grupo.nomeGrupo}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                                (Escolha {grupo.minEscolhas === grupo.maxEscolhas 
                                    ? `exatamente ${grupo.minEscolhas}` 
                                    : `de ${grupo.minEscolhas} até ${grupo.maxEscolhas}`
                                } {grupo.maxEscolhas === 1 ? 'opção' : 'opções'})
                            </p>
                            
                            <div className='space-y-2'>
                                {grupo.opcoes?.map(opcao => (
                                    <label key={opcao.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <div>
                                            <p className="font-semibold">{opcao.nomeSubProduto}</p>
                                            {Number(opcao.valorAdicional) > 0 && (
                                                <p className="text-sm text-red-600">
                                                    + R$ {Number(opcao.valorAdicional).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <input
                                            type={grupo.maxEscolhas === 1 ? 'radio' : 'checkbox'}
                                            name={grupo.id.toString()} // Agrupa os radio buttons
                                            // 'defaultChecked' não funciona bem com estado, usamos 'checked'
                                            checked={selectedSubProducts.some(sp => sp.id === opcao.id)}
                                            onChange={() => handleSelectionChange(opcao, grupo)}
                                            className="h-5 w-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {/* --- Fim da Iteração de Grupos --- */}


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