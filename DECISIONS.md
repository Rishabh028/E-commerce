# DECISIONS.md

## One Architectural Decision I Could Have Gone Either Way On

**Decision: How to handle the missing variant data from the Fake Store API.**

The spec requires color swatches, size selectors, and stock states (available / low stock / sold out) — none of which the Fake Store API provides. I considered three approaches:

1. **Hardcoded mock JSON file** — replace the API entirely with a local dataset that includes full variant data.
2. **Separate "variant API" mock** — create a second fetch layer that returns variant data keyed by product ID.
3. **Client-side enrichment pipeline** — fetch from the real API, then run each product through an `enrichProduct()` function that deterministically generates variant data seeded by the product ID.

I picked option 3. The assignment explicitly requires using the Fake Store API, so dropping it wasn't an option. A separate mock API adds complexity without teaching anything new. The enrichment pipeline is the simplest approach that satisfies both constraints: we hit the live API and still get consistent, reproducible variant data. The seeded random generator (`seededRandom`) ensures that product #5 always gets the same colors and stock states, which means deep-linked URLs work correctly across sessions and devices.

The trade-off is that "stock" is purely decorative — there's no backend to actually validate against. In a production app, the enrichment step would be replaced by a real API response, and the component code wouldn't need to change at all, which I consider a sign of good separation.

## What I'd Clean Up With More Time

1. **Split the Context**: Right now `CartContext` owns both the cart items (data) and the drawer open/close state (UI). These re-render different parts of the tree. With more time I'd split them into `CartDataContext` and `DrawerUIContext` so toggling the drawer doesn't re-render the product listing.

2. **API Caching**: I'd introduce React Query (TanStack Query) for data fetching. The current `useEffect` + local state pattern is fine for a small app, but it doesn't handle cache invalidation, background refetching, or race conditions as gracefully.

3. **Error Boundaries**: The app has inline error handling but no React Error Boundary. A top-level boundary would catch unexpected rendering errors instead of white-screening.

4. **Accessibility Audit**: I've added `aria-label` attributes and keyboard handlers in key places, but a full a11y pass with a screen reader and `axe-core` would catch gaps I've missed.
