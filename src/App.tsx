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
import NewProductCategory from "./pages/Admin/Product-Category/New-Product-Category";
import NewUser from "./pages/Admin/Users/New-User";
import UserManagment from "./pages/Admin/Users/User-Managment";
import ProductCategoryManagment from "./pages/Admin/Product-Category/Product-Category-Managment";
import Config from "./pages/Admin/Config/Config";
import RoleManagment from "./pages/Admin/Users/Role-Managment";
import PaymentMethod from "./pages/Admin/Payment-Method/Payment-Method";
import { type Produto, type SubProduto, type CartItem } from './types/interfaces-types';

// Tipo CartItem agora usa o tipo Produto vindo da sua API

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Aumentar quantidade
  const handleIncreaseQuantity = (productId: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Diminuir quantidade
  const handleDecreaseQuantity = (productId: number) => {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0) // Remove item se a quantidade for 0
    );
  };

  // Confirmar pedido e esvaziar carrinho
  const handleConfirmOrder = () => {
    setCart([]);
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
          />
        }
      />
      <Route
        path="/pedido-confirmado"
        element={<PedidoConfirmado/>}
      />
      <Route
        path="/login"
        element={<Login/>}
      />
      <Route
        path="/admin/dashboard"
        element={<Dashboard/>}
      />
      <Route
        path="/admin/order"
        element={<OrderManagment/>}
      />
      <Route
        path="/admin/product"
        element={<ProductManagment/>}
      />
      <Route
        path="/admin/category-product/new"
        element = {<NewProductCategory/>}
      />
      <Route
        path="/admin/category-product/"
        element = {<ProductCategoryManagment/>}
      />
      <Route
        path="/admin/payment-method"
        element = {<PaymentMethod/>}
      />
      <Route
        path="/admin/user/new"
        element = {<NewUser/>}
      />
      <Route
        path="/admin/user/consult"
        element = {<UserManagment/>}
      />
      <Route
        path="/admin/config"
        element = {<Config/>}
      />
      <Route
        path="/admin/user/role"
        element = {<RoleManagment/>}
      />
    </Routes>
  );
}