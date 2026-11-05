"use client";

import { useState } from "react";
import { addToCart } from "@/app/actions/shop";
import { ActionForm, Submit } from "@/components/action-form";
import { ProductArt } from "@/components/product-art";
import type { CustomOptions } from "@/lib/format";
import { MAX_QUANTITY } from "@/config/rules";

/** Product artwork with a live personalisation preview, plus the add-to-bag form. */
export function AddToCart({
  product,
  options,
  children,
}: {
  product: { id: string; title: string; color: string; identity: string; category: string; stock: number };
  options: CustomOptions | null;
  children: React.ReactNode;
}) {
  const [text, setText] = useState("");
  const [color, setColor] = useState(options?.colors[0] ?? "");

  return (
    <>
      <ProductArt
        title={product.title}
        color={color || product.color}
        identity={product.identity}
        category={product.category}
        mark={options?.text ? text || undefined : undefined}
        className="aspect-[4/5] w-full"
      >
        {options && <span className="absolute top-4 left-4 bg-bg/90 px-2 py-0.5 text-[11px]">Live preview</span>}
      </ProductArt>

      <div className="lg:sticky lg:top-40 lg:self-start">
        {children}
        <ActionForm action={addToCart} className="mt-8 space-y-6 border-t border-line pt-8">
          <input type="hidden" name="productId" value={product.id} />
          {options && options.colors.length > 0 && (
            <fieldset>
              <legend className="mb-2.5 text-[13px]">
                Colour <span className="text-muted">— {color}</span>
              </legend>
              <div className="flex gap-2.5">
                {options.colors.map((c) => (
                  <label key={c} className="cursor-pointer">
                    <input type="radio" name="customColor" value={c} checked={color === c} onChange={() => setColor(c)} className="peer sr-only" />
                    <span
                      className="block h-6 w-6 rounded-full ring-1 ring-line ring-offset-2 ring-offset-bg peer-checked:ring-fg peer-focus-visible:ring-2"
                      style={{ background: c }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {options?.text && (
            <div>
              <label className="mb-2.5 block text-[13px]" htmlFor="customText">
                {options.text.label} <span className="text-muted">— up to {options.text.maxLength} characters</span>
              </label>
              <input
                id="customText"
                name="customText"
                maxLength={options.text.maxLength}
                value={text}
                onChange={(e) => setText(e.target.value.toUpperCase())}
                className="input uppercase"
                required
              />
            </div>
          )}
          <div className="flex items-stretch gap-3">
            <label className="sr-only" htmlFor="quantity">Quantity</label>
            <input id="quantity" name="quantity" type="number" min={1} max={Math.min(MAX_QUANTITY, product.stock)} defaultValue={1} className="input w-20 text-center" />
            <Submit className="btn-primary flex-1">{product.stock > 0 ? "Add to bag" : "Out of stock"}</Submit>
          </div>
          {options && (
            <p className="text-[11px] leading-4 text-muted">
              Personalised items can&apos;t be returned for change of mind, but are covered by the guarantee if made incorrectly.
            </p>
          )}
        </ActionForm>
      </div>
    </>
  );
}
