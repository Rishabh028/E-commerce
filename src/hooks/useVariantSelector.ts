import { useState, useCallback } from 'react';
import type { Product, Size, StockState } from '../types';
import { getVariantStock } from '../utils/mockData';

/**
 * Custom hook encapsulating variant selection logic for a product.
 * Returns current selections, derived stock state, and setters.
 */
export function useVariantSelector(product: Product | null, initialColor?: string, initialSize?: string) {
  const [selectedColor, setSelectedColor] = useState(initialColor ?? '');
  const [selectedSize, setSelectedSize] = useState<Size | ''>(initialSize as Size ?? '');

  // Initialize when product loads
  const initFromProduct = useCallback(
    (p: Product, urlColor?: string | null, urlSize?: string | null) => {
      const validColor = p.variants.colors.find(
        (c) => c.name.toLowerCase() === urlColor?.toLowerCase(),
      );
      setSelectedColor(validColor ? validColor.name : p.variants.colors[0].name);

      const normalizedSize = urlSize?.toUpperCase() as Size;
      const validSize = p.variants.sizes.find((s) => s.size === normalizedSize);
      setSelectedSize(validSize ? validSize.size : p.variants.sizes[0].size);
    },
    [],
  );

  // Derive stock state for current selection
  const currentStock: StockState = (() => {
    if (!product || !selectedColor || !selectedSize) return 'out';
    return getVariantStock(product.variants, selectedColor, selectedSize);
  })();

  const isSoldOut = currentStock === 'out';
  const isLowStock = currentStock === 'low';

  // Get per-size stock for the selected color
  const sizeStocksForColor: Record<string, StockState> = (() => {
    if (!product || !selectedColor) return {};
    const map: Record<string, StockState> = {};
    for (const s of product.variants.sizes) {
      map[s.size] = getVariantStock(product.variants, selectedColor, s.size);
    }
    return map;
  })();

  return {
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    currentStock,
    isSoldOut,
    isLowStock,
    sizeStocksForColor,
    initFromProduct,
  };
}
