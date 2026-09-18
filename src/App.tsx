import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './App.css';

import { SellerAuthProvider } from './context/SellerAuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';

import SellerAppLayout from './Seller/SellerComponent/Layout/SellerAppLayout';
import SellerDashboard from './Seller/SellerPages/SellerDashboard';
import SellerProducts from './Seller/SellerPages/SellerProducts';
import SellerProductForm from './Seller/SellerPages/SellerProductForm';
import SellerOrders from './Seller/SellerPages/SellerOrders';
import SellerReviews from './Seller/SellerPages/SellerReviews';
import SellerAuthPage from './Seller/SellerPages/SellerAuthPage';
import ProtectedSellerRoute from './Seller/SellerComponent/ProtectedSellerRoute';
import NotFound from './Client/ClientsComponent/NotFound';

const router = createBrowserRouter([
  {
    path: "/seller/auth",
    element: <SellerAuthPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedSellerRoute>
        <SellerAppLayout />
      </ProtectedSellerRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/seller/dashboard" replace /> },
      { path: "/seller", element: <Navigate to="/seller/dashboard" replace /> },
      { path: "/seller/dashboard", element: <SellerDashboard /> },
      { path: "/seller/products", element: <SellerProducts /> },
      { path: "/seller/products/new", element: <SellerProductForm /> },
      { path: "/seller/products/:productId/edit", element: <SellerProductForm /> },
      { path: "/seller/orders", element: <SellerOrders /> },
      { path: "/seller/reviews", element: <SellerReviews /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <SellerAuthProvider>
      <ProductProvider>
        <OrderProvider>
          <RouterProvider router={router} />
        </OrderProvider>
      </ProductProvider>
    </SellerAuthProvider>
  );
}

export default App;