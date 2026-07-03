import type {
  ApiProduct,
  Product,
  ColorOption,
  SizeOption,
  Size,
  StockState,
  VariantMatrix,
} from '../types';

// ─── Color palette for mocking ───
const COLOR_PALETTE: ColorOption[] = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Forest', hex: '#228b22' },
  { name: 'Slate', hex: '#708090' },
];

const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL'];

const BRANDS = [
  'Urban Thread', 'Apex Gear', 'Lumina', 'NovaWear',
  'Heritage Co.', 'Drift Studio', 'Evergreen', 'Pinnacle',
];

/**
 * Deterministic pseudo-random number generator seeded by product ID.
 * Ensures mock data is identical across page loads.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates a deterministic stock state for a color+size combo.
 */
function generateStockState(rand: () => number): StockState {
  const roll = rand();
  if (roll < 0.15) return 'out';      // 15% chance sold out
  if (roll < 0.35) return 'low';      // 20% chance low stock
  return 'available';                  // 65% chance available
}

/**
 * Core function that intercepts an API product and enriches it
 * with deterministic mock variant data.
 */
export function enrichProduct(apiProduct: ApiProduct): Product {
  const rand = seededRandom(apiProduct.id * 1337);

  // Pick 3-4 colors deterministically
  const colorCount = 3 + Math.floor(rand() * 2); // 3 or 4
  const shuffled = [...COLOR_PALETTE].sort(() => rand() - 0.5);
  const colors = shuffled.slice(0, colorCount);

  // Build the stock matrix: color × size → StockState
  const stockByColorSize: Record<string, Record<Size, StockState>> = {};
  const sizeStockMap: Record<Size, StockState[]> = {
    XS: [], S: [], M: [], L: [], XL: [],
  };

  for (const color of colors) {
    stockByColorSize[color.name] = {} as Record<Size, StockState>;
    for (const size of ALL_SIZES) {
      const state = generateStockState(rand);
      stockByColorSize[color.name][size] = state;
      sizeStockMap[size].push(state);
    }
  }

  // The overall size stock shown on the selector = worst case across colors
  // But more usefully, we show per-color stock when a color is selected.
  const sizes: SizeOption[] = ALL_SIZES.map((size) => {
    const states = sizeStockMap[size];
    // Show "out" only if ALL colors are out for this size
    const allOut = states.every((s) => s === 'out');
    // Show "low" if any are low and none are fully available
    const anyLow = states.some((s) => s === 'low');
    const stock: StockState = allOut ? 'out' : anyLow ? 'low' : 'available';
    return { size, stock };
  });

  // Sale price: ~30% of products get a sale
  const hasSale = rand() < 0.3;
  const discountPercent = 10 + Math.floor(rand() * 30); // 10-39%
  const originalPrice = Number((apiProduct.price * (1 + discountPercent / 100)).toFixed(2));
  const salePrice = hasSale ? apiProduct.price : null;

  // Brand
  const brand = BRANDS[apiProduct.id % BRANDS.length];

  // Extra thumbnail images (reusing the product image with placeholder variants)
  const thumbnails = [
    apiProduct.image,
    `https://picsum.photos/seed/${apiProduct.id}a/400/400`,
    `https://picsum.photos/seed/${apiProduct.id}b/400/400`,
    `https://picsum.photos/seed/${apiProduct.id}c/400/400`,
  ];

  return {
    ...apiProduct,
    brand,
    originalPrice: hasSale ? originalPrice : apiProduct.price,
    salePrice,
    thumbnails,
    variants: {
      colors,
      sizes,
      stockByColorSize,
    },
  };
}

/**
 * Gets the stock state for a specific color+size combination.
 */
export function getVariantStock(
  variants: VariantMatrix,
  color: string,
  size: Size,
): StockState {
  return variants.stockByColorSize[color]?.[size] ?? 'out';
}
