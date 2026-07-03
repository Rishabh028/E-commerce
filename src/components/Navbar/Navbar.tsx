import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const { cartCount, toggleDrawer } = useCart();

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          MiniShop
        </Link>

        <button
          className={styles.cartBtn}
          onClick={toggleDrawer}
          aria-label={`Cart with ${cartCount} items`}
        >
          <ShoppingCart size={22} strokeWidth={2} />
          {cartCount > 0 && (
            <span className={styles.badge}>{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
