import { useState } from "react";
import "./App.css";
import Cardapio from "./pages/Cardapio/Cardapio";
import Checkout from "./pages/Checkout/Checkout";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'cardapio' | 'checkout'>('cardapio');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Função para esvaziar carrinho após confirmação do pedido
  const handleConfirm = () => {
    setCart([]);
    setCurrentScreen('cardapio');
  };

  // Aqui você deve passar a função para adicionar no carrinho para o Cardapio,
  // que vai controlar o carrinho no App
  return (
    <div className="min-h-screen">
      {currentScreen === 'cardapio' && (
        <Cardapio
          cart={cart}
          setCart={setCart}
          goToCheckout={() => setCurrentScreen('checkout')}
        />
      )}

      {currentScreen === 'checkout' && (
        <Checkout
          cart={cart}
          onConfirm={handleConfirm}
          goBack={() => setCurrentScreen('cardapio')}
        />
      )}
    </div>
  );
}
