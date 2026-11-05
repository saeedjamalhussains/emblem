import type { Prisma } from "@prisma/client";
import { PRODUCT, SELLER } from "@/config/status";

// Only approved products from active sellers are visible to customers.
export const publicProduct = {
  status: PRODUCT.APPROVED,
  seller: { status: SELLER.ACTIVE },
} satisfies Prisma.ProductWhereInput;

export const productCardSelect = {
  id: true,
  title: true,
  pricePaise: true,
  customizable: true,
  identity: { select: { name: true, color: true } },
  seller: { select: { storeName: true } },
  category: { select: { slug: true } },
} satisfies Prisma.ProductSelect;
