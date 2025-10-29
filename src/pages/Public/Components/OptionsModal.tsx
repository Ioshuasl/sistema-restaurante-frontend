import React, { useState, useMemo } from 'react';
import { type Produto, type IGrupoOpcao, type IItemOpcao } from '../../../types/interfaces-types';
import { type SelectedOption, type CartItem } from '../Cardapio/Cardapio';
import { toast } from 'react-toastify';
import { ShieldAlert } from 'lucide-react';

type OptionsModalProps = {
    product: Produto;
    initialItem?: CartItem; 
    onClose: () => void;
    onSave: (
        product: Produto,
        selectedOptions: SelectedOption[],
        quantity: number,
        unitPriceWithOptions: number
    ) => void;
};

// Novo tipo de estado para gerenciar seleções
type Selections = Record<number, IItemOpcao[]>;

export default function OptionsModal({ product, initialItem, onClose, onSave }: OptionsModalProps) {
    // 2. Estado inicial usa 'initialItem' se ele existir
    const [quantity, setQuantity] = useState(initialItem?.quantity || 1);
    const [selections, setSelections] = useState<Selections>(() => {
        const initialState: Selections = {};
        
        // Se estiver editando, preenche com 'initialItem.selectedOptions'
        if (initialItem) {
            (product.grupos || []).forEach(group => {
                initialState[group.id] = group.itens.filter(item => 
                    initialItem.selectedOptions.some(sel => sel.id === item.id)
                );
            });
        } else {
            // Se for novo, usa a lógica padrão (pré-seleciona radio)
            (product.grupos || []).forEach(group => {
                if (group.minEscolhas === 1 && group.maxEscolhas === 1 && group.itens.length > 0) {
                    initialState[group.id] = [group.itens[0]];
                } else {
                    initialState[group.id] = [];
                }
            });
        }
        return initialState;
    });
    
    // Lógica de seleção (sem mudanças)
    const handleSelection = (group: IGrupoOpcao, item: IItemOpcao) => {
        setSelections((prev) => {
            const newSelections = { ...prev };
            const currentGroupSelections = prev[group.id] || [];
            const isSelected = currentGroupSelections.some(i => i.id === item.id);

            if (group.maxEscolhas === 1) {
                newSelections[group.id] = [item];
            } else {
                if (isSelected) {
                    newSelections[group.id] = currentGroupSelections.filter(i => i.id !== item.id);
                } else {
                    if (currentGroupSelections.length < group.maxEscolhas) {
                        newSelections[group.id] = [...currentGroupSelections, item];
                    } else {
                        toast.warn(`Máximo de ${group.maxEscolhas} opções atingido para este grupo.`);
                        return prev; 
                    }
                }
            }
            return newSelections;
        });
    };

    // Lógica de cálculo (sem mudanças)
    const { totalItemPrice, validationError } = useMemo(() => {
        let optionsTotal = 0;
        let error: string | null = null;

        for (const group of (product.grupos || [])) {
            const selectedCount = (selections[group.id] || []).length;
            if (selectedCount < group.minEscolhas) {
                error = `Você precisa escolher pelo menos ${group.minEscolhas} ${group.minEscolhas > 1 ? 'itens' : 'item'} em "${group.nome}".`;
            }
        }

        Object.values(selections).flat().forEach(item => {
            optionsTotal += Number(item.valorAdicional);
        });

        const total = (Number(product.valorProduto) + optionsTotal) * quantity;
        return { totalItemPrice: total, validationError: error };

    }, [selections, quantity, product.grupos, product.valorProduto]);

    // 3. 'handleConfirm' agora chama 'onSave'
    const handleConfirm = () => {
        if (validationError) {
            toast.error(validationError);
            return;
        }

        const allSelectedItems = Object.values(selections).flat();
        const flatSelectedOptions: SelectedOption[] = allSelectedItems.map(item => ({
            id: item.id,
            nome: item.nome,
            valorAdicional: Number(item.valorAdicional)
        }));
        const optionsTotal = flatSelectedOptions.reduce((total, op) => total + op.valorAdicional, 0);
        const unitPriceWithOptions = Number(product.valorProduto) + optionsTotal;

        // Chama 'onSave' (que pode ser o 'onAddToCart' ou 'handleSaveEdit' do Checkout)
        onSave(product, flatSelectedOptions, quantity, unitPriceWithOptions);
        onClose();
    };

    // JSX (sem mudanças, exceto no botão)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800">{product.nomeProduto}</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
                    {(product.grupos || []).map(group => {
                        const currentSelections = selections[group.id] || [];
                        const reachedMax = currentSelections.length >= group.maxEscolhas;

                        return (
                            <div key={group.id} className="border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-800">{group.nome}</h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    {group.minEscolhas === group.maxEscolhas 
                                        ? `Escolha ${group.maxEscolhas}.`
                                        : `Escolha de ${group.minEscolhas} até ${group.maxEscolhas}.`
                                    }
                                    {group.minEscolhas > 0 && <span className="text-red-600 font-medium ml-2">OBRIGATÓRIO</span>}
                                </p>

                                <div className="space-y-3">
                                    {group.itens.map(item => {
                                        const isSelected = currentSelections.some(i => i.id === item.id);
                                        const isDisabled = !isSelected && reachedMax && group.maxEscolhas > 1;

                                        return (
                                            <label 
                                                key={item.id} 
                                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer 
                                                    ${isSelected ? 'bg-red-50 border-red-300' : 'hover:bg-gray-50'}
                                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                <div>
                                                    <p className={`font-semibold ${isDisabled ? 'text-gray-400' : ''}`}>{item.nome}</p>
                                                    {Number(item.valorAdicional) > 0 && (
                                                        <p className="text-sm text-red-600">
                                                            + R$ {Number(item.valorAdicional).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <input
                                                    type={group.maxEscolhas === 1 ? 'radio' : 'checkbox'}
                                                    name={`group-${group.id}`}
                                                    checked={isSelected}
                                                    disabled={isDisabled}
                                                    onChange={() => handleSelection(group, item)}
                                                    className="h-5 w-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <p className="font-semibold text-lg">Quantidade:</p>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-xl bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">-</button>
                        <span className="text-xl font-bold">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="text-xl bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">+</button>
                    </div>
                </div>

                {validationError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 p-2 bg-red-50 rounded-lg">
                        <ShieldAlert size={24} />
                        <span>{validationError}</span>
                    </div>
                )}
                
                <button
                    onClick={handleConfirm}
                    disabled={!!validationError && validationError.includes('pelo menos 1')}
                    className={`w-full bg-red-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-red-700 transition
                        ${!!validationError ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {/* 4. Texto do botão atualiza dinamicamente */}
                    {initialItem ? 'Atualizar Item' : 'Adicionar ao Carrinho'} - R$ {totalItemPrice.toFixed(2)}
                </button>
            </div>
        </div>
    );
}