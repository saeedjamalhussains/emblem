// Every page URL in the app. Rename a route here (and its folder) and all links follow.

export const routes = {
  home: "/",
  shop: "/shop",
  category: (slug: string) => `/category/${slug}`,
  product: (id: string) => `/product/${id}`,
  identity: (slug: string) => `/identity/${slug}`,
  store: (slug: string) => `/store/${slug}`,

  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  order: (id: string) => `/orders/${id}`,

  login: (next?: string) => (next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"),
  register: (next?: string) => (next && next !== "/" ? `/register?next=${encodeURIComponent(next)}` : "/register"),

  sell: "/sell",
  sellSubmitted: (id: string) => `/sell/submitted?id=${id}`,
  invite: (token: string) => `/invite/${token}`,

  seller: {
    home: "/seller",
    products: "/seller/products",
    newProduct: "/seller/products/new",
    orders: "/seller/orders",
    identities: "/seller/identities",
  },

  admin: {
    home: "/admin",
    applications: "/admin/applications",
    products: "/admin/products",
    authorizations: "/admin/authorizations",
    orders: "/admin/orders",
    ledger: "/admin/ledger",
  },
} as const;
