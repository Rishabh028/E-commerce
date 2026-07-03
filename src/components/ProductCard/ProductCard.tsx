import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { getVariantStock } from '../../utils/mockData';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Find the first available variant
    const { colors, stockByColorSize } = product.variants;
    let chosenColor = colors[0].name;
    let chosenSize = product.variants.sizes[0].size;

    outer:
    for (const c of colors) {
      for (const s of product.variants.sizes) {
        if (stockByColorSize[c.name][s.size] !== 'out') {
          chosenColor = c.name;
          chosenSize = s.size;
          break outer;
        }
      }
    }

    addItem({
      productId: product.id,
      title: product.title,
      image: product.image,
      color: chosenColor,
      size: chosenSize,
      unitPrice: product.salePrice ?? product.price,
    });
  };

  const navigateToProduct = () => navigate(`/product/${product.id}`);

  return (
    <article className={styles.card}>
      <div
        className={styles.imageWrap}
        onClick={navigateToProduct}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigateToProduct()}
      >
        <img src={product.image} alt={product.title} loading="lazy" />
        {product.salePrice && <span className={styles.saleBadge}>Sale</span>}
      </div>

      <div className={styles.body}>
        <p
          className={styles.category}
        >
          {product.category}
        </p>
        <h3
          className={styles.title}
          onClick={navigateToProduct}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigateToProduct()}
        >
          {product.title}
        </h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            ${(product.salePrice ?? product.price).toFixed(2)}
          </span>
          {product.salePrice && (
            <span className={styles.original}>
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <button className={styles.addBtn} onClick={handleQuickAdd}>
        Quick Add
      </button>
    </article>
  );
}
