import { db } from "@/lib/db";
import { GUARANTEE_DAYS, SUBSCRIPTION_TIERS } from "@/config/rules";
import { formatPaise } from "@/lib/format";
import { submitApplication } from "@/app/actions/admission";
import { ActionForm, Submit } from "@/components/action-form";
import { PageTitle } from "@/components/cards";

export default async function SellPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <PageTitle title="Sell with us" sub="Seller places are by application. Every applicant is reviewed by our team." />
        <ul className="space-y-4 text-[13px]">
          <li className="card p-4"><span className="">0% product commission.</span> <span className="text-muted">You keep your product-sale proceeds, less payment processing and taxes.</span></li>
          <li className="card p-4">
            <span className="">A flat monthly platform fee</span>
            <span className="text-muted"> starting at {formatPaise(SUBSCRIPTION_TIERS[0].monthlyFeePaise)}, linked to your rolling 12-month sales on the marketplace.</span>
          </li>
          <li className="card p-4"><span className="">Your own storefront</span> <span className="text-muted">alongside the brands, teams and creators you&apos;re authorised to represent.</span></li>
          <li className="card p-4"><span className="">{GUARANTEE_DAYS}-day guarantee, handled centrally.</span> <span className="text-muted">20% of each delivered order is held until the guarantee period ends.</span></li>
        </ul>
        <p className="mt-6 text-[11px] text-muted">Illustrative terms for the prototype — not final commercial rates.</p>
      </div>

      <ActionForm action={submitApplication} className="card mt-8 space-y-4 p-6">
        <h2 className="text-[18px]">Seller application</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="applicantName">Your name</label>
            <input id="applicantName" name="applicantName" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="businessName">Business / brand name</label>
          <input id="businessName" name="businessName" required className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="gstin">GSTIN (optional)</label>
            <input id="gstin" name="gstin" className="input uppercase" maxLength={15} />
          </div>
          <div>
            <label className="label" htmlFor="pan">PAN (optional)</label>
            <input id="pan" name="pan" className="input uppercase" maxLength={10} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">About your business and merchandise</label>
          <textarea id="description" name="description" rows={4} required minLength={30} className="input" placeholder="What you make, how it's produced, who it's for." />
        </div>
        <fieldset>
          <legend className="label">Product categories</legend>
          <div className="flex flex-wrap gap-3 text-[13px]">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input type="checkbox" name="categories" value={c.name} className="accent-[var(--color-accent)]" /> {c.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="label" htmlFor="portfolioUrl">Portfolio, website or social link</label>
          <input id="portfolioUrl" name="portfolioUrl" type="url" className="input" placeholder="https://" />
        </div>
        <div>
          <label className="label" htmlFor="authorizationNotes">Identities you&apos;re authorised to represent</label>
          <textarea id="authorizationNotes" name="authorizationNotes" rows={2} className="input" placeholder="e.g. Official licensee for XYZ FC — licence ref, expiry date." />
        </div>
        <Submit className="btn-primary w-full">Submit application</Submit>
      </ActionForm>
    </div>
  );
}
