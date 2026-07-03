import { Routes, Route } from 'react-router-dom';
import ProductListing from '../pages/ProductListing/ProductListing';
import ProductDetail from '../pages/ProductDetail/ProductDetail';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProductListing />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  );
}
