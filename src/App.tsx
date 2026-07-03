import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar/Navbar';
import CartDrawer from './components/CartDrawer/CartDrawer';
import AppRouter from './router/AppRouter';
import './styles/global.scss';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <CartDrawer />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem' }}>
          <AppRouter />
        </main>
      </BrowserRouter>
    </CartProvider>
  );
}
