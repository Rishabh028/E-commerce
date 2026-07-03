// ─── API Response Types ───
export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

// ─── Variant & Stock Types ───
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type StockState = 'available' | 'low' | 'out';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface SizeOption {
  size: Size;
  stock: StockState;
}

export interface VariantMatrix {
  colors: ColorOption[];
  sizes: SizeOption[];
  /** Lookup: stockByColorSize[colorName][size] → StockState */
  stockByColorSize: Record<string, Record<Size, StockState>>;
}

// ─── Enriched Product (API + Mock) ───
export interface Product extends ApiProduct {
  brand: string;
  originalPrice: number;
  salePrice: number | null;
  thumbnails: string[];
  variants: VariantMatrix;
}

// ─── Cart Types ───
export interface CartItem {
  productId: number;
  title: string;
  image: string;
  color: string;
  size: Size;
  unitPrice: number;
  quantity: number;
}
