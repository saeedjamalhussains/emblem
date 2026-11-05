// Demo data. Every identity, seller and product here is fictional.
// Demo accounts (local development only):
//   admin@emblem.test    / admin1234
//   customer@emblem.test / customer1234
//   loomline@emblem.test, hawks@emblem.test, nightfall@emblem.test / seller1234
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const identities = [
  { slug: "loomline", name: "Loomline", type: "BRAND", color: "#c2410c", description: "Heavyweight cotton basics, cut and sewn in Tiruppur." },
  { slug: "northpaw-studio", name: "Northpaw Studio", type: "BRAND", color: "#0f766e", description: "Illustrated streetwear from a two-person studio in Pune." },
  { slug: "kiln-and-thread", name: "Kiln & Thread", type: "BRAND", color: "#a16207", description: "Ceramics and embroidered goods, made in small batches." },
  { slug: "hyderabad-hawks-fc", name: "Hyderabad Hawks FC", type: "TEAM", color: "#1d4ed8", description: "City football club. Official home and away kits." },
  { slug: "coastal-strikers", name: "Coastal Strikers", type: "TEAM", color: "#0891b2", description: "T20 cricket franchise from the west coast." },
  { slug: "deccan-dunkers", name: "Deccan Dunkers", type: "TEAM", color: "#ea580c", description: "Semi-pro basketball, playing out of Bengaluru." },
  { slug: "the-doodle-desk", name: "The Doodle Desk", type: "CREATOR", color: "#db2777", description: "Daily sketch creator with 400k followers." },
  { slug: "chai-and-code", name: "Chai & Code", type: "CREATOR", color: "#65a30d", description: "Programming tutorials and very strong opinions about tea." },
  { slug: "nightfall-esports", name: "Nightfall Esports", type: "GAMING", color: "#7c3aed", description: "Multi-title esports organisation." },
  { slug: "respawn-collective", name: "Respawn Collective", type: "GAMING", color: "#16a34a", description: "Community-run gaming nights and LAN events." },
  { slug: "the-monsoon-notes", name: "The Monsoon Notes", type: "MUSIC", color: "#2563eb", description: "Indie folk band. Tour merch and vinyl." },
  { slug: "static-bloom", name: "Static Bloom", type: "MUSIC", color: "#e11d48", description: "Electronic duo from Shillong." },
  { slug: "campus-robotics-club", name: "Campus Robotics Club", type: "COMMUNITY", color: "#475569", description: "Student robotics society merchandise." },
  { slug: "old-city-runners", name: "Old City Runners", type: "COMMUNITY", color: "#b45309", description: "Weekend running club. Race-day kit." },
];

const categories = [
  { slug: "apparel", name: "Apparel" },
  { slug: "accessories", name: "Accessories" },
  { slug: "collectibles", name: "Collectibles" },
  { slug: "lifestyle", name: "Lifestyle" },
];


const sellers = [
  {
    email: "loomline@emblem.test", name: "Ananya Rao", storeName: "Loomline Store", slug: "loomline-store",
    description: "Loomline's official storefront. We also make kit for local clubs.",
    identities: ["loomline", "old-city-runners", "campus-robotics-club"],
  },
  {
    email: "hawks@emblem.test", name: "Farhan Ali", storeName: "Matchday Supply Co.", slug: "matchday-supply",
    description: "Licensed sports merchandise distributor.",
    identities: ["hyderabad-hawks-fc", "coastal-strikers", "deccan-dunkers"],
  },
  {
    email: "nightfall@emblem.test", name: "Kavya Menon", storeName: "Pixel & Press", slug: "pixel-and-press",
    description: "Print studio for creators, bands and gaming orgs.",
    identities: ["nightfall-esports", "respawn-collective", "the-doodle-desk", "chai-and-code", "the-monsoon-notes", "static-bloom", "northpaw-studio", "kiln-and-thread"],
  },
];

type P = {
  seller: string; identity: string; category: string; title: string; price: number; stock: number;
  custom?: { text: { label: string; maxLength: number } | null; colors: string[] }; status?: string;
};

const products: P[] = [
  { seller: "loomline-store", identity: "loomline", category: "apparel", title: "Heavyweight Box Tee", price: 1299, stock: 80 },
  { seller: "loomline-store", identity: "loomline", category: "apparel", title: "Brushed Fleece Hoodie", price: 2899, stock: 40 },
  { seller: "loomline-store", identity: "loomline", category: "accessories", title: "Canvas Tote", price: 699, stock: 120 },
  { seller: "loomline-store", identity: "old-city-runners", category: "apparel", title: "Race Day Singlet", price: 999, stock: 60, custom: { text: { label: "Name on back", maxLength: 12 }, colors: ["#111827", "#b45309", "#f5f5f4"] } },
  { seller: "loomline-store", identity: "campus-robotics-club", category: "apparel", title: "Robotics Club Crewneck", price: 1699, stock: 35, custom: { text: { label: "Team role", maxLength: 16 }, colors: ["#475569", "#111827"] } },
  { seller: "matchday-supply", identity: "hyderabad-hawks-fc", category: "apparel", title: "Hawks Home Jersey 26/27", price: 2499, stock: 150, custom: { text: { label: "Name & number", maxLength: 14 }, colors: [] } },
  { seller: "matchday-supply", identity: "hyderabad-hawks-fc", category: "apparel", title: "Hawks Away Jersey 26/27", price: 2499, stock: 120 },
  { seller: "matchday-supply", identity: "hyderabad-hawks-fc", category: "accessories", title: "Hawks Knit Scarf", price: 799, stock: 200 },
  { seller: "matchday-supply", identity: "coastal-strikers", category: "apparel", title: "Strikers Training Tee", price: 1199, stock: 90 },
  { seller: "matchday-supply", identity: "coastal-strikers", category: "accessories", title: "Strikers Cap", price: 899, stock: 110 },
  { seller: "matchday-supply", identity: "deccan-dunkers", category: "apparel", title: "Dunkers Swingman Jersey", price: 2199, stock: 70, custom: { text: { label: "Name & number", maxLength: 14 }, colors: [] } },
  { seller: "matchday-supply", identity: "deccan-dunkers", category: "collectibles", title: "Signed Mini Ball", price: 3499, stock: 15 },
  { seller: "pixel-and-press", identity: "nightfall-esports", category: "apparel", title: "Nightfall Pro Jersey", price: 2299, stock: 100, custom: { text: { label: "Gamer tag", maxLength: 12 }, colors: [] } },
  { seller: "pixel-and-press", identity: "nightfall-esports", category: "accessories", title: "Nightfall XL Mousepad", price: 1099, stock: 140 },
  { seller: "pixel-and-press", identity: "respawn-collective", category: "lifestyle", title: "LAN Night Mug", price: 499, stock: 90 },
  { seller: "pixel-and-press", identity: "the-doodle-desk", category: "collectibles", title: "Sketchbook Sticker Pack", price: 349, stock: 300 },
  { seller: "pixel-and-press", identity: "the-doodle-desk", category: "lifestyle", title: "Art Print — Rooftops", price: 899, stock: 50 },
  { seller: "pixel-and-press", identity: "chai-and-code", category: "lifestyle", title: "'It Works on My Machine' Mug", price: 549, stock: 120 },
  { seller: "pixel-and-press", identity: "the-monsoon-notes", category: "apparel", title: "Monsoon Tour Tee 2026", price: 1099, stock: 75 },
  { seller: "pixel-and-press", identity: "the-monsoon-notes", category: "collectibles", title: "Rainfall LP (Vinyl)", price: 2799, stock: 25 },
  { seller: "pixel-and-press", identity: "static-bloom", category: "accessories", title: "Static Bloom Enamel Pin Set", price: 649, stock: 80 },
  { seller: "pixel-and-press", identity: "northpaw-studio", category: "apparel", title: "Northpaw Tiger Hoodie", price: 2599, stock: 30 },
  { seller: "pixel-and-press", identity: "kiln-and-thread", category: "lifestyle", title: "Glazed Stoneware Cup", price: 899, stock: 20 },
  // Waiting in the admin moderation queue.
  { seller: "pixel-and-press", identity: "static-bloom", category: "apparel", title: "Static Bloom Glow Tee", price: 1299, stock: 40, status: "PENDING_REVIEW" },
];

async function main() {
  // Wipe in dependency order so the seed can be re-run.
  await db.ledgerEntry.deleteMany();
  await db.ledgerTransaction.deleteMany();
  await db.orderItem.deleteMany();
  await db.sellerOrder.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.product.deleteMany();
  await db.identityAuthorization.deleteMany();
  await db.seller.deleteMany();
  await db.invitation.deleteMany();
  await db.sellerApplication.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.category.deleteMany();
  await db.identity.deleteMany();
  await db.auditLog.deleteMany();

  const [adminHash, customerHash, sellerHash] = await Promise.all([
    bcrypt.hash("admin1234", 10),
    bcrypt.hash("customer1234", 10),
    bcrypt.hash("seller1234", 10),
  ]);

  await db.user.create({ data: { email: "admin@emblem.test", name: "Marketplace Admin", passwordHash: adminHash, role: "ADMIN" } });
  await db.user.create({ data: { email: "customer@emblem.test", name: "Riya Sharma", passwordHash: customerHash } });

  const identityIds: Record<string, string> = {};
  for (const i of identities) identityIds[i.slug] = (await db.identity.create({ data: i })).id;
  const categoryIds: Record<string, string> = {};
  for (const c of categories) categoryIds[c.slug] = (await db.category.create({ data: c })).id;

  const sellerIds: Record<string, string> = {};
  for (const s of sellers) {
    const app = await db.sellerApplication.create({
      data: {
        applicantName: s.name, email: s.email, businessName: s.storeName, description: s.description,
        categories: "Apparel, Accessories", status: "APPROVED", reviewedAt: new Date(),
      },
    });
    const user = await db.user.create({ data: { email: s.email, name: s.name, passwordHash: sellerHash, role: "SELLER" } });
    const seller = await db.seller.create({
      data: { userId: user.id, applicationId: app.id, storeName: s.storeName, slug: s.slug, description: s.description },
    });
    sellerIds[s.slug] = seller.id;
    for (const slug of s.identities) {
      await db.identityAuthorization.create({
        data: { sellerId: seller.id, identityId: identityIds[slug]!, evidence: "Licence agreement on file (demo)", status: "APPROVED", reviewedAt: new Date() },
      });
    }
  }

  for (const p of products) {
    await db.product.create({
      data: {
        sellerId: sellerIds[p.seller]!, identityId: identityIds[p.identity]!, categoryId: categoryIds[p.category]!,
        title: p.title, description: `${p.title}. Ships in 3–5 working days${p.custom ? "; personalised items take 2 extra days" : ""}.`,
        pricePaise: p.price * 100, stock: p.stock, customizable: !!p.custom,
        customOptions: p.custom ? JSON.stringify(p.custom) : null,
        status: p.status ?? "APPROVED",
      },
    });
  }

  // Applications waiting for review.
  await db.sellerApplication.create({
    data: {
      applicantName: "Meera Iyer", email: "meera@inkwell.test", businessName: "Inkwell Prints", gstin: "29ABCDE1234F1Z5",
      description: "Screen-printing studio producing band and creator merchandise since 2021.",
      categories: "Apparel, Collectibles", portfolioUrl: "https://example.com/inkwell",
      authorizationNotes: "Authorised printer for Static Bloom — letter available on request.",
    },
  });
  await db.sellerApplication.create({
    data: {
      applicantName: "Rohit Desai", email: "rohit@courtside.test", businessName: "Courtside Collectibles",
      description: "Signed memorabilia and limited-edition collectibles.", categories: "Collectibles",
    },
  });

  console.log("Seeded demo data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
