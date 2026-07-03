import type { ApiProduct, Product } from '../types';
import { enrichProduct } from './mockData';

const BASE_URL = 'https://fakestoreapi.com';

/**
 * Fetches all products and enriches them with mock variant data.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }
  const raw: ApiProduct[] = await res.json();
  return raw.map(enrichProduct);
}

/**
 * Fetches a single product by ID and enriches it.
 */
export async function fetchProductById(id: string | number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product #${id} (${res.status})`);
  }
  const raw: ApiProduct = await res.json();
  return enrichProduct(raw);
}

/**
 * Simulates an async "Add to Cart" API call.
 * Introduces a 1-second delay and a 20% chance of failure.
 */
export async function mockAddToCartRequest(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error('Failed to add item. Please try again.'));
      } else {
        resolve();
      }
    }, 1000);
  });
}
