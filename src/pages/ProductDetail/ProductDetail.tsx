import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { Product } from '../../types';
import { fetchProductById, mockAddToCartRequest } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useVariantSelector } from '../../hooks/useVariantSelector';
import styles from './ProductDetail.module.scss';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Use custom variant selector hook
  const {
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    currentStock,
    isSoldOut,
    isLowStock,
    sizeStocksForColor,
    initFromProduct,
  } = useVariantSelector(product);

  // ─── Fetch product ───
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchProductById(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setMainImage(p.thumbnails[0]);

        // Rehydrate variant from URL params (deep-link)
        initFromProduct(p, searchParams.get('color'), searchParams.get('size'));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Sync variant to URL ───
  useEffect(() => {
    if (!selectedColor || !selectedSize) return;
    setSearchParams(
      { color: selectedColor.toLowerCase(), size: selectedSize.toLowerCase() },
      { replace: true },
    );
  }, [selectedColor, selectedSize, setSearchParams]);

  // ─── Handlers ───
  const handleAddToCart = async () => {
    if (!product || isSoldOut || !selectedSize) return;

    setAdding(true);
    setAddError(null);
    setAddSuccess(false);

    try {
      await mockAddToCartRequest();
      addItem({
        productId: product.id,
        title: product.title,
        image: product.image,
        color: selectedColor,
        size: selectedSize,
        unitPrice: product.salePrice ?? product.price,
      }, quantity);
      setAddSuccess(true);
      setQuantity(1);
      setTimeout(() => setAddSuccess(false), 2000);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAdding(false);
    }
  };

  // ─── Render ───
  if (loading) {
    return (
      <div className={styles.status}>
        <div className={styles.spinner} />
        <p>Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.status}>
        <p className={styles.errorText}>⚠ {error || 'Product not found'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ─── Gallery ─── */}
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <img src={mainImage} alt={product.title} />
        </div>
        <div className={styles.thumbStrip}>
          {product.thumbnails.map((src, i) => (
            <button
              key={i}
              className={`${styles.thumbBtn} ${mainImage === src ? styles.active : ''}`}
              onClick={() => setMainImage(src)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt={`${product.title} thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {/* ─── Info ─── */}
      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <h1 className={styles.title}>{product.title}</h1>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>
            ${(product.salePrice ?? product.price).toFixed(2)}
          </span>
          {product.salePrice && (
            <span className={styles.originalPrice}>
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.salePrice && (
            <span className={styles.discount}>
              {Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Color swatches */}
        <div className={styles.section}>
          <label className={styles.label}>
            Color: <strong>{selectedColor}</strong>
          </label>
          <div className={styles.swatches}>
            {product.variants.colors.map((c) => (
              <button
                key={c.name}
                className={`${styles.swatch} ${selectedColor === c.name ? styles.selected : ''}`}
                style={{ '--swatch-color': c.hex } as React.CSSProperties}
                onClick={() => setSelectedColor(c.name)}
                aria-label={`Color: ${c.name}`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className={styles.section}>
          <label className={styles.label}>
            Size: <strong>{selectedSize}</strong>
          </label>
          <div className={styles.sizes}>
            {product.variants.sizes.map((s) => {
              const stock = sizeStocksForColor[s.size] ?? 'out';
              const isOut = stock === 'out';
              const isLow = stock === 'low';
              const isSelected = selectedSize === s.size;

              return (
                <button
                  key={s.size}
                  className={[
                    styles.sizeBtn,
                    isSelected ? styles.selected : '',
                    isOut ? styles.soldOut : '',
                    isLow && !isSelected ? styles.lowStock : '',
                  ].join(' ')}
                  onClick={() => !isOut && setSelectedSize(s.size)}
                  disabled={isOut}
                  aria-label={`Size ${s.size}${isOut ? ' - Sold out' : isLow ? ' - Low stock' : ''}`}
                >
                  {s.size}
                  {isLow && !isOut && <span className={styles.lowDot} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stock indicator */}
        <div className={styles.stockIndicator}>
          {isSoldOut && <span className={styles.stockOut}>Sold Out</span>}
          {isLowStock && <span className={styles.stockLow}>⚡ Low Stock — Order Soon!</span>}
          {currentStock === 'available' && <span className={styles.stockAvail}>✓ In Stock</span>}
        </div>

        {/* Quantity + Add to Cart */}
        <div className={styles.cartActions}>
          <div className={styles.qtyPicker}>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isSoldOut}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isSoldOut}
              min={1}
              aria-label="Quantity"
            />
            <button
              onClick={() => setQuantity((q) => q + 1)}
              disabled={isSoldOut}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className={`${styles.addToCartBtn} ${adding ? styles.loading : ''} ${addSuccess ? styles.success : ''}`}
            disabled={isSoldOut || adding}
            onClick={handleAddToCart}
          >
            {adding ? 'Adding…' : isSoldOut ? 'Sold Out' : addSuccess ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>

        {addError && <p className={styles.addError}>{addError}</p>}

        {/* Description */}
        <div className={styles.description}>
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  );
}
