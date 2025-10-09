import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css'; // Importando os estilos do Toastify
import Cardapio from "./pages/Public/Cardapio/Cardapio";
import Checkout from "./pages/Public/Checkout/Checkout";
import PedidoConfirmado from "./pages/Public/Pedido-Confirmado/Pedido-Confirmado";
import Login from "./pages/Auth/Login/Login";
import Dashboard from "./pages/Admin/Dashboard/DashBoard";
import OrderManagment from "./pages/Admin/Order/Order-Managment";
import ProductManagment from "./pages/Admin/Product/Product-Managment";
import NewUser from "./pages/Admin/Users/New-User";
import UserManagment from "./pages/Admin/Users/User-Managment";
import ProductCategoryManagment from "./pages/Admin/Product-Category/Product-Category-Managment";
import Config from "./pages/Admin/Config/Config";
import RoleManagment from "./pages/Admin/Users/Role-Managment";
import PaymentMethod from "./pages/Admin/Payment-Method/Payment-Method";
import { type Produto, type SubProduto, type CartItem } from './types/interfaces-types';
import { toast } from "react-toastify";

// Tipo CartItem agora usa o tipo Produto vindo da sua API

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Aumentar quantidade
  const handleIncreaseQuantity = (cartItemId: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Diminuir quantidade
  const handleDecreaseQuantity = (cartItemId: string) => {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  // Confirmar pedido e esvaziar carrinho
  const handleConfirmOrder = () => {
    setCart([]);
  };

  const handleUpdateItem = (
    cartItemId: string,
    newConfig: { product: Produto, subProducts: SubProduto[], quantity: number }
  ) => {
    setCart(prevCart => {
      // Remove o item antigo
      const filteredCart = prevCart.filter(item => item.cartItemId !== cartItemId);

      // Cria o novo item com base na nova configuração
      const { product, subProducts, quantity } = newConfig;
      const subProductsTotal = subProducts.reduce((total, sp) => total + Number(sp.valorAdicional), 0);
      const unitPriceWithSubProducts = Number(product.valorProduto) + subProductsTotal;

      const updatedItem: CartItem = {
        cartItemId, // Mantém o mesmo ID para consistência, se desejar
        product,
        quantity,
        selectedSubProducts: subProducts,
        unitPriceWithSubProducts,
      };

      // Adiciona o item atualizado de volta ao carrinho
      return [...filteredCart, updatedItem];
    });
    toast.success("Item atualizado com sucesso!");
  };

  return (

    <Routes>
      <Route
        path="/"
        element={<Cardapio cart={cart} setCart={setCart} />}
      />
      <Route
        path="/checkout"
        element={
          <Checkout
            cart={cart}
            onConfirm={handleConfirmOrder}
            onIncrease={handleIncreaseQuantity}
            onDecrease={handleDecreaseQuantity}
            onUpdateItem={handleUpdateItem}
          />
        }
      />
      <Route
        path="/pedido-confirmado"
        element={<PedidoConfirmado />}
      />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/admin/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/admin/order"
        element={<OrderManagment />}
      />
      <Route
        path="/admin/product"
        element={<ProductManagment />}
      />
      <Route
        path="/admin/category-product/"
        element={<ProductCategoryManagment />}
      />
      <Route
        path="/admin/payment-method"
        element={<PaymentMethod />}
      />
      <Route
        path="/admin/user/new"
        element={<NewUser />}
      />
      <Route
        path="/admin/user/consult"
        element={<UserManagment />}
      />
      <Route
        path="/admin/config"
        element={<Config />}
      />
      <Route
        path="/admin/user/role"
        element={<RoleManagment />}
      />
    </Routes>
  );
}