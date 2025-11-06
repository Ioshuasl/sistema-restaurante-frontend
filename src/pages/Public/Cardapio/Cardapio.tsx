import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu } from '../../../services/menuService';
// 1. Importando GrupoOpcao e toast
import { type Menu, type Produto, type SubProduto, type CartItem, type GrupoOpcao } from '../../../types/interfaces-types';
import { Lock, Truck, CookingPotIcon } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type CardapioProps = {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export default function Cardapio({ cart, setCart }: CardapioProps) {
    const [menu, setMenu] = useState<Menu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // --- ESTADOS PARA O MODAL DE OPÇÕES ---
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const menuData = await getMenu();
                setMenu(menuData);
            } catch (err) {
                setError("Não foi possível carregar o cardápio. Tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMenu();
    }, []);

    // --- LÓGICA DO MODAL E DO CARRINHO ATUALIZADA ---

    const openOptionsModal = (product: Produto) => {
        setSelectedProduct(product);
        setIsOptionsModalOpen(true);
    };

    const closeOptionsModal = () => {
        setSelectedProduct(null);
        setIsOptionsModalOpen(false);
    };

    const handleAddToCartClick = (product: Produto) => {
        // 2. LÓGICA ATUALIZADA: Checa 'gruposOpcoes'
        if (product.gruposOpcoes && product.gruposOpcoes.length > 0) {
            openOptionsModal(product);
        } else {
            addToCart(product, [], 1);
        }
    };

    const addToCart = (product: Produto, subProducts: SubProduto[], quantity: number) => {
        setCart((prevCart) => {
            const subProductIds = subProducts.map(sp => sp.id).sort().join('-');
            const cartItemId = `${product.id}-${subProductIds}`;

            const existingItem = prevCart.find((item) => item.cartItemId === cartItemId);

            if (existingItem) {
                return prevCart.map((item) =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                const subProductsTotal = subProducts.reduce((total, sp) => total + Number(sp.valorAdicional), 0);
                const unitPriceWithSubProducts = Number(product.valorProduto) + subProductsTotal;
                
                const newItem: CartItem = {
                    cartItemId,
                    product,
                    quantity,
                    selectedSubProducts: subProducts,
                    unitPriceWithSubProducts,
                };
                return [...prevCart, newItem];
            }
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const incrementCartItem = (cartItemId: string) => {
        setCart((prevCart) => 
            prevCart.map(item => 
                item.cartItemId === cartItemId 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }

    const cartTotal = cart.reduce(
        (total, item) => total + item.unitPriceWithSubProducts * item.quantity,
        0
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-xl text-gray-700">Carregando cardápio...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    const filteredMenu = menu
        .map(category => ({
            ...category,
            produtos: category.produtos.filter(product =>
                product.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }))
        .filter(category => category.produtos.length > 0);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
            <title>GS Sabores</title>
            
            <header className="bg-gradient-to-r from-red-600 to-red-500 text-white py-6 shadow-lg relative">
                <div className='flex flex-1 justify-between items-center px-4'>
                    <div className='max-w-7xl mx-auto text-center'>
                        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 tracking-wide"><CookingPotIcon size={36} /> GS Sabores</h1>
                        <p className="text-sm mt-1 flex items-center justify-center gap-2">
                            <Truck size={16} color='yellow' /> Entregamos sabor até você!
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/login')}
                            aria-label="Acesso administrativo"
                            className="absolute top-1/2 right-6 cursor-pointer -translate-y-1/2 text-white hover:text-gray-200 transition"
                        >
                            <Lock size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <nav className="bg-white shadow-md sticky top-0 z-30 border-b border-gray-200">
                <ul className="flex justify-center gap-6 py-4 font-medium text-gray-700 overflow-x-auto whitespace-nowrap px-4">
                    {menu.map((category) => (
                        <li key={category.id}>
                            <a href={`#${category.nomeCategoriaProduto}`} className="hover:text-red-600 transition duration-200">
                                {category.nomeCategoriaProduto}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="px-4 py-4">
                <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
            </div>

            <main className="w-full px-4 py-8 flex-grow">
                {!isCartOpen && cart.length > 0 && (
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-full shadow-xl hover:bg-red-700 transition z-50 flex items-center gap-2"
                    >
                        🛒 Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </button>
                )}

                {filteredMenu.map((category) => (
                    <section key={category.id} id={category.nomeCategoriaProduto} className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-bold mb-6 text-red-600 border-b pb-2">
                            {category.nomeCategoriaProduto}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {category.produtos.map((product) => (
                                <div key={product.id} className="bg-white rounded-2xl border border-gray-300 shadow-xl p-5 flex flex-col items-center text-center hover:shadow-xl transition">
                                    <img src={product.image} alt={product.nomeProduto} className="w-32 h-32 object-cover rounded-xl mb-3" />
                                    <h3 className="text-lg font-semibold">{product.nomeProduto}</h3>
                                    <p className="text-red-600 font-bold text-lg mt-2">
                                        {/* 3. LÓGICA ATUALIZADA: Checa 'gruposOpcoes' */}
                                        {product.gruposOpcoes && product.gruposOpcoes.length > 0 ? 'A partir de ' : ''}
                                        R$ {Number(product.valorProduto).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => handleAddToCartClick(product)}
                                        className="mt-4 bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105"
                                    >
                                        {/* 4. LÓGICA ATUALIZADA: Checa 'gruposOpcoes' */}
                                        {product.gruposOpcoes && product.gruposOpcoes.length > 0 ? 'Selecionar Opções' : 'Adicionar ao carrinho'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl rounded-l-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-between items-center px-6 py-5">
                        <h2 className="text-xl font-bold flex items-center gap-2"><span className="text-red-600">🛒</span> Seu Carrinho</h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-600 hover:text-red-600 text-2xl">&times;</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center mt-10">Seu carrinho está vazio.</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.cartItemId} className="flex gap-4 p-3 shadow-md rounded-lg border border-gray-300">
                                    <img src={item.product.image} alt={item.product.nomeProduto} className="w-16 h-16 object-cover rounded-md" />
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.product.nomeProduto}</h3>
                                        {item.selectedSubProducts.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {item.selectedSubProducts.map(sp => (<p key={sp.id}>+ {sp.nomeSubProduto}</p>))}
                                            </div>
                                        )}
                                        <p className="text-sm font-bold text-gray-800 mt-1">
                                            R$ {(item.unitPriceWithSubProducts * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => removeFromCart(item.cartItemId)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">−</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => incrementCartItem(item.cartItemId)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">+</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-300 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-xl font-bold text-blue-600">R$ {cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => navigate('/checkout')}
                            disabled={cart.length === 0}
                            className={`w-full py-3 rounded-lg text-white font-semibold transition ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Finalizar Pedido
                        </button>
                    </div>
                </aside>
                
                {/* O Modal agora usa a definição local refatorada */}
                {isOptionsModalOpen && selectedProduct && (
                    <OptionsModal
                        product={selectedProduct}
                        onClose={closeOptionsModal}
                        onAddToCart={addToCart}
                    />
                )}
            </main>

            <footer className="bg-red-600 text-white text-center py-4">
                <p>© 2025 GS Sabores. Todos os direitos reservados.</p>
                <p className="text-sm mt-1">Contato: contato@gssabores.com | (11) 99999-9999</p>
            </footer>
            
            {/* 5. Adicionar ToastContainer para os avisos do modal */}
            <ToastContainer />
        </div>
    );
}

// ==================================================================
// --- MODAL LOCAL (DENTRO DE Cardapio.tsx) REFATORADO ---
// ==================================================================

type OptionsModalProps = {
    product: Produto;
    onClose: () => void;
    onAddToCart: (product: Produto, subProducts: SubProduto[], quantity: number) => void;
};

function OptionsModal({ product, onClose, onAddToCart }: OptionsModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedSubProducts, setSelectedSubProducts] = useState<SubProduto[]>([]);

    const handleSelectionChange = (opcao: SubProduto, grupo: GrupoOpcao) => {
        setSelectedSubProducts((prevSelected) => {
            const isRadio = grupo.maxEscolhas === 1;
            const isSelected = prevSelected.some(sp => sp.id === opcao.id);
            
            // 1. Filtra opções de *outros* grupos
            const otherGroupOptions = prevSelected.filter(sp => sp.grupoOpcao_id !== grupo.id);
            
            // 2. Filtra opções *deste* grupo
            const currentGroupOptions = prevSelected.filter(sp => sp.grupoOpcao_id === grupo.id);

            if (isRadio) {
                // Lógica de Rádio: substitui qualquer seleção neste grupo
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

    const handleConfirm = () => {
        // Validar 'minEscolhas' antes de adicionar
        let isValid = true;
        product.gruposOpcoes?.forEach(grupo => {
            const selectedCount = selectedSubProducts.filter(sp => sp.grupoOpcao_id === grupo.id).length;
            if (selectedCount < grupo.minEscolhas) {
                isValid = false;
                toast.error(`Escolha pelo menos ${grupo.minEscolhas} opção(ões) do grupo "${grupo.nomeGrupo}".`);
            }
        });

        if (isValid) {
            onAddToCart(product, selectedSubProducts, quantity);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800">{product.nomeProduto}</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                
                <p className="text-gray-600">Selecione os ingredientes como desejar.</p>

                {/* --- Início da Iteração de Grupos --- */}
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
                    Adicionar ao Carrinho - R$ {totalItemPrice.toFixed(2)}
                </button>
            </div>
        </div>
    );
}