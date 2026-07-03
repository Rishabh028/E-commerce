# MiniShop — Mini E-Commerce Web App

A production-quality mini e-commerce application built as a frontend developer assignment.

## Tech Stack

| Layer            | Choice                          |
|------------------|---------------------------------|
| Framework        | React 18 (Hooks, Strict Mode)   |
| Build Tool       | Vite                            |
| Language         | TypeScript (strict)             |
| Styling          | SCSS Modules                    |
| State            | Context API + localStorage      |
| Routing          | React Router v6                 |
| Icons            | Lucide React                    |
| API              | Fake Store API                  |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Build for production
npm run build

# 4. Run unit tests
npx vitest run
```

Requires **Node 18+**. After `npm install`, `npm run dev` works out of the box.

## Folder Structure

```
src/
├── components/        # Reusable UI (Navbar, CartDrawer, ProductCard)
│   ├── Navbar/
│   ├── CartDrawer/
│   └── ProductCard/
├── context/           # CartContext (Context API provider)
├── pages/             # Route-level components
│   ├── ProductListing/
│   └── ProductDetail/
├── styles/            # Global SCSS variables, mixins, resets
├── types/             # TypeScript interfaces
└── utils/             # API, mock data enrichment, localStorage helpers
```

## Design Decisions

- **Data Enrichment Pipeline**: The Fake Store API lacks variants. Instead of faking a separate API, I intercept the response in `enrichProduct()` and inject deterministic variant data (colors, sizes, stock states) seeded by the product ID. This keeps data consistent across reloads and makes deep-linking work reliably.

- **Context API over Redux/Zustand**: The cart is the only piece of global state. Context + useCallback/useMemo keeps the provider fast and the bundle small.

- **SCSS `@use` over `@import`**: All SCSS files use the modern `@use` syntax to avoid Dart Sass deprecation warnings and ensure proper module scoping.

- **Mock Async Add-to-Cart**: The "Add to Cart" action wraps in a 1-second simulated API call with a 20% chance of failure. This exercises loading, success, and error states in the UI.

## Known Trade-offs

- **No server-side stock validation**: Stock states are generated client-side. A real app would validate against a backend before confirming the add-to-cart.
- **Thumbnail images**: Extra thumbnails use picsum.photos placeholders since the Fake Store API only provides a single image per product.

## Live URL

*(Deploy to Vercel/Netlify and update here)*
