import Link from "next/link";
import { db } from "@/lib/db";
import { requireSeller } from "@/lib/auth";
import { createProduct } from "@/app/actions/seller";
import { ActionForm, Submit } from "@/components/action-form";
import { PageTitle } from "@/components/cards";
import { routes } from "@/lib/routes";
import { AUTHORIZATION } from "@/config/status";

export default async function NewProduct() {
  const { seller } = await requireSeller();
  const [authorizations, categories] = await Promise.all([
    db.identityAuthorization.findMany({ where: { sellerId: seller.id, status: AUTHORIZATION.APPROVED }, include: { identity: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (authorizations.length === 0) {
    return (
      <>
        <PageTitle title="New product" />
        <p className="text-muted">
          You need an approved identity authorisation before listing products.{" "}
          <Link href={routes.seller.identities} className="text-fg hover:opacity-60">Request one</Link>.
        </p>
      </>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageTitle title="New product" sub="Products are reviewed by the marketplace before they go live." />
      <ActionForm action={createProduct} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} required className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="identityId">Identity</label>
            <select id="identityId" name="identityId" className="input">
              {authorizations.map((a) => <option key={a.identityId} value={a.identityId}>{a.identity.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" className="input">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">Price (₹)</label>
            <input id="price" name="price" type="number" step="0.01" min="1" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="stock">Stock</label>
            <input id="stock" name="stock" type="number" min="0" required className="input" />
          </div>
        </div>
        <details className="border border-line p-4">
          <summary className="cursor-pointer text-[13px]">Personalisation options</summary>
          <label className="mt-4 flex items-center gap-2 text-[13px]">
            <input type="checkbox" name="customizable" /> Customers can personalise this product
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="textLabel">Text field label</label>
              <input id="textLabel" name="textLabel" placeholder="e.g. Name & number" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="textMax">Max characters</label>
              <input id="textMax" name="textMax" type="number" min={1} max={40} defaultValue={12} className="input" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="colors">Colour choices (hex, comma-separated)</label>
            <input id="colors" name="colors" placeholder="#111827, #f5f5f4" className="input font-mono" />
          </div>
        </details>
        <Submit>Submit for review</Submit>
      </ActionForm>
    </div>
  );
}
