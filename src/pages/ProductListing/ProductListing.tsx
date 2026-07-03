import { useEffect, useState } from 'react';
import type { Product } from '../../types';
import { fetchAllProducts } from '../../utils/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './ProductListing.module.scss';

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAllProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.status}>
        <div className={styles.spinner} />
        <p>Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.status}>
        <p className={styles.error}>⚠ {error}</p>
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>Our Collection</h1>
      <p className={styles.subheading}>{products.length} products</p>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
