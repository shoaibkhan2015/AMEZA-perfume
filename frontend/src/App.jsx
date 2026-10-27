import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Product from './pages/Product.jsx';
import Collection from './pages/Collection.jsx';
import CollectionList from './pages/CollectionList.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Order from './pages/Order.jsx';
import Search from './pages/Search.jsx';
import PageRoute from './pages/Pages.jsx';
import { Article, Blog } from './pages/Blog.jsx';
import NotFound from './pages/NotFound.jsx';
import { Account, Addresses, Login, Register, ResetPassword } from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="admin" element={<Admin />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products/:handle" element={<Product />} />
        <Route path="collections" element={<CollectionList />} />
        <Route path="collections/:handle" element={<Collection />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:id" element={<Order thanks />} />
        <Route path="search" element={<Search />} />
        <Route path="pages/:handle" element={<PageRoute />} />
        <Route path="blogs/:blog" element={<Blog />} />
        <Route path="blogs/:blog/:article" element={<Article />} />
        <Route path="account" element={<Account />} />
        <Route path="account/orders" element={<Account />} />
        <Route path="account/orders/:id" element={<Order />} />
        <Route path="account/login" element={<Login />} />
        <Route path="account/register" element={<Register />} />
        <Route path="account/reset" element={<ResetPassword />} />
        <Route path="account/addresses" element={<Addresses />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
