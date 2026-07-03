import { useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './CartDrawer.module.scss';

export default function CartDrawer() {
  const {
    items, isDrawerOpen, closeDrawer,
    updateQuantity, removeItem, subtotal,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Trap focus / close on Escape
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isDrawerOpen ? styles.open : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${isDrawerOpen ? styles.open : ''}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2>Your Cart ({items.length})</h2>
          <button onClick={closeDrawer} className={styles.closeBtn} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <p className={styles.empty}>Your cart is empty.</p>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => {
                const key = `${item.productId}-${item.color}-${item.size}`;
                return (
                  <li key={key} className={styles.item}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.thumb}
                    />
                    <div className={styles.details}>
                      <p className={styles.title}>{item.title}</p>
                      <p className={styles.variant}>
                        {item.color} / {item.size}
                      </p>
                      <p className={styles.price}>
                        ${item.unitPrice.toFixed(2)}
                      </p>

                      <div className={styles.actions}>
                        <div className={styles.qtyGroup}>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.color, item.size, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.color, item.size, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeItem(item.productId, item.color, item.size)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span className={styles.muted}>Calculated at checkout</span>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button className={styles.checkoutBtn}>Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
}
