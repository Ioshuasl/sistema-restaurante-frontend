
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from '../../../components/Public/Header';
import CartDrawer from '../../../components/Public/CartDrawer';
import OptionsModal from '../../../components/Public/OptionsModal';
import { getMenu } from '../../../services/menuService';
import { getConfig } from '../../../services/configService';
import { type Menu, type Produto, type CartItem, type SubProduto } from '../../../types/';
import { Loader2, WifiOff, SearchX, Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';

interface CardapioProps {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    isDarkMode: boolean;
    toggleTheme: () => void;
    onCheckout: () => void;
}

const CATEGORY_STORAGE_KEY = 'gs-sabores-last-category';
const LAYOUT_STORAGE_KEY = 'gs-sabores-menu-layout';

export default function Cardapio({ cart, setCart, isDarkMode, toggleTheme, onCheckout }: CardapioProps) {
    const [menuData, setMenuData] = useState<Menu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [menuLayout, setMenuLayout] = useState<'modern' | 'compact' | 'minimalist'>(() => {
        const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
        return (saved as any) || 'modern';
    });
    
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    const categoryRefs = useRef<Record<number, HTMLElement | null>>({});
    const isFirstMount = useRef(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [menu, config] = await Promise.all([
                getMenu(),
                getConfig()
            ]);

            const normalizedMenu = menu.map((cat: any) => ({
                ...cat,
                Produtos: cat.Produtos || cat.produtos || []
            }));
            
            setMenuData(normalizedMenu);
            setIsOffline(false);
            
            if (config && config.menuLayout) {
                setMenuLayout(config.menuLayout);
                localStorage.setItem(LAYOUT_STORAGE_KEY, config.menuLayout);
            }
            
        } catch (err: any) {
            console.warn('Erro ao carregar dados do servidor', err);
            setIsOffline(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === LAYOUT_STORAGE_KEY && e.newValue) {
                setMenuLayout(e.newValue as any);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        fetchData();
        if (isFirstMount.current && cart.length > 0) {
            toast.info('Seu carrinho foi recuperado!', {
                icon: <RefreshCcw className="text-blue-500" />,
                autoClose: 3000
            });
        }
        isFirstMount.current = false;
    }, []);

    useEffect(() => {
        if (!isLoading && menuData.length > 0) {
            const lastCat = localStorage.getItem(CATEGORY_STORAGE_KEY);
            if (lastCat && categoryRefs.current[Number(lastCat)]) {
                setTimeout(() => {
                    categoryRefs.current[Number(lastCat)]?.scrollIntoView({ behavior: 'auto', block: 'start' });
                }, 100);
            }
        }
    }, [isLoading, menuData]);

    useEffect(() => {
        if (isLoading || menuData.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = Number(entry.target.id.split('-')[1]);
                        setActiveCategory(id);
                        localStorage.setItem(CATEGORY_STORAGE_KEY, id.toString());
                    }
                });
            },
            { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' }
        );

        Object.values(categoryRefs.current).forEach((ref) => {
            if (ref) observer.observe(ref as Element);
        });

        return () => observer.disconnect();
    }, [menuData, isLoading]);

    const filteredMenu = useMemo(() => {
        return menuData.map(category => {
            const products = category.Produtos || [];
            return {
                ...category,
                Produtos: products.filter(product =>
                    product.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase())
                )
            };
        }).filter(category => category.Produtos && category.Produtos.length > 0);
    }, [searchTerm, menuData]);

    const cartTotal = useMemo(() => 
        cart.reduce((sum, item) => sum + item.unitPriceWithSubProducts * item.quantity, 0),
    [cart]);

    const addToCart = (
        product: Produto,
        selectedSubProducts: SubProduto[],
        quantity: number,
        unitPriceWithSubProducts: number,
        observation?: string
    ) => {
        setCart(prev => {
            const subProductIds = selectedSubProducts.map(op => op.id).sort().join('-');
            const cartItemId = `${product.id}-${subProductIds}-${observation || ''}`;
            const existing = prev.find(item => item.cartItemId === cartItemId);

            if (existing) {
                return prev.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { 
                cartItemId, 
                product, 
                quantity, 
                selectedSubProducts, 
                unitPriceWithSubProducts,
                observation
            }];
        });
        setIsCartOpen(true);
        setIsOptionsModalOpen(false);
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart(prev => 
            prev.map(item => 
                item.cartItemId === cartItemId 
                    ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    const handleProductClick = (product: Produto) => {
        const hasOptions = (product.gruposOpcoes && product.gruposOpcoes.length > 0);
        
        if (hasOptions) {
            setSelectedProduct(product);
            setIsOptionsModalOpen(true);
        } else {
            addToCart(product, [], 1, Number(product.valorProduto));
        }
    };

    const renderProductCard = (product: Produto) => {
        if (menuLayout === 'compact') {
            return (
                <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className="group bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-4 cursor-pointer border border-transparent dark:border-slate-800"
                >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                        <img 
                            src={product.image || `https://picsum.photos/seed/${product.id}/200`} 
                            alt={product.nomeProduto} 
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate mb-0.5">{product.nomeProduto}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2 font-medium">{product.descricao}</p>
                        <span className="text-base font-black text-red-600 dark:text-red-400">R$ {Number(product.valorProduto).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                        <Plus size={20} />
                    </div>
                </div>
            );
        }

        if (menuLayout === 'minimalist') {
            return (
                <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className="group py-6 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-4 -mx-4 rounded-2xl transition-all duration-300"
                >
                    <div className="flex-1 space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 transition-colors duration-300">{product.nomeProduto}</h4>
                            <div className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-700 mb-1.5" />
                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                R$ {Number(product.valorProduto).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        {product.descricao && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-2 max-w-2xl">
                                {product.descricao}
                            </p>
                        )}
                    </div>
                    {product.image && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <img 
                                src={product.image} 
                                alt={product.nomeProduto} 
                                className="w-full h-full group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                            />
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div key={product.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-slate-950 transition-all duration-300 flex flex-col border border-transparent dark:border-slate-800">
                <div className="relative mb-6 overflow-hidden rounded-[2rem] aspect-[4/3]">
                    <img 
                        src={product.image || `https://picsum.photos/seed/${product.id}/400/300`} 
                        alt={product.nomeProduto} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                        }}
                    />
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">{product.nomeProduto}</h4>
                    {product.descricao && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{product.descricao}</p>}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 transition-colors duration-300">R$ {Number(product.valorProduto).toFixed(2).replace('.', ',')}</span>
                    <button onClick={() => handleProductClick(product)} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 hover:bg-red-600 text-slate-900 dark:text-slate-100 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                        <Plus size={24} />
                    </button>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">GS Sabores</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 sm:pb-0 transition-colors duration-300">
            {isOffline && (
                <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center flex items-center justify-center gap-2">
                    <WifiOff size={12} /> Servidor Offline - Verifique sua conexão
                </div>
            )}
            
            <Header 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
                onOpenCart={() => setIsCartOpen(true)}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
            />

            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 sm:top-20 z-40 overflow-x-auto hide-scrollbar transition-colors duration-300">
                <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 sm:px-8 py-3">
                    {menuData.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => {
                                categoryRefs.current[cat.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className={`px-6 py-2 rounded-full text-sm font-black whitespace-nowrap transition-all duration-300 ${activeCategory === cat.id ? 'bg-red-600 text-white shadow-lg shadow-red-100 dark:shadow-none translate-y-[-2px]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'}`}
                        >
                            {cat.nomeCategoriaProduto}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
                {filteredMenu.length > 0 ? (
                    filteredMenu.map(category => (
                        <section key={category.id} id={`cat-${category.id}`} ref={(el) => { categoryRefs.current[category.id] = el; }} className="mb-16 scroll-mt-32 sm:scroll-mt-40">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 bg-red-600 rounded-full" />
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-300">{category.nomeCategoriaProduto}</h3>
                                </div>
                            </div>

                            <div className={`
                                ${menuLayout === 'modern' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : ''}
                                ${menuLayout === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}
                                ${menuLayout === 'minimalist' ? 'grid grid-cols-1 lg:grid-cols-2 gap-x-12' : ''}
                            `}>
                                {category.Produtos.map(product => renderProductCard(product))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 transition-colors duration-300">
                            <SearchX size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">Ops! Nada encontrado</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">Não encontramos nenhum item com o nome "<span className="text-red-600">{searchTerm}</span>".</p>
                    </div>
                )}
            </main>

            <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                cart={cart} 
                onIncrement={(id) => updateQuantity(id, 1)} 
                onDecrement={(id) => updateQuantity(id, -1)} 
                total={cartTotal} 
                onCheckout={onCheckout} 
            />

            {isOptionsModalOpen && selectedProduct && (
                <OptionsModal 
                    product={selectedProduct} 
                    onClose={() => setIsOptionsModalOpen(false)} 
                    onSave={addToCart} 
                />
            )}
        </div>
    );
}
