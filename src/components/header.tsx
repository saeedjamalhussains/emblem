import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SITE } from "@/config/site";
import { logout } from "@/app/actions/auth";
import { BagIcon, UserIcon } from "./icons";
import { Logo } from "./logo";
import { routes } from "@/lib/routes";
import { ROLE } from "@/config/status";

export async function Header() {
  const user = await currentUser();
  const cartCount = user
    ? (await db.cartItem.aggregate({ where: { userId: user.id }, _sum: { quantity: true } }))._sum.quantity ?? 0
    : 0;

  return (
    <header className="sticky top-0 z-20">
      <div className="bg-black px-4 py-3 text-center text-[11px] tracking-[0.04em] text-white">
        {SITE.announcement}
      </div>
      <div className="border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1400px] items-center gap-6 px-4 sm:gap-10 sm:h-[68px] sm:px-8">
          <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
            <Logo height={30} />
          </Link>
          <nav className="flex-1 text-[13px]">
            <Link href={routes.shop} className="hover:opacity-60">Shop</Link>
          </nav>
          <div className="ml-auto flex items-center gap-5 text-[13px] whitespace-nowrap">
            {user?.role === ROLE.ADMIN && <Link href={routes.admin.home} className="underline-offset-4 hover:underline">Admin</Link>}
            {user?.role === ROLE.SELLER && <Link href={routes.seller.home} className="underline-offset-4 hover:underline">Seller hub</Link>}
            {!user && <Link href={routes.sell} className="hidden hover:opacity-60 xl:inline">Sell with us</Link>}
            {user ? (
              <>
                <Link href={routes.orders} className="hidden hover:opacity-60 sm:inline">Orders</Link>
                <form action={logout}>
                  <button className="flex items-center gap-1.5 hover:opacity-60" title={`Signed in as ${user.name}`}>
                    <UserIcon /> <span className="hidden sm:inline">Sign out</span>
                  </button>
                </form>
              </>
            ) : (
              <Link href={routes.login()} className="flex items-center gap-1.5 hover:opacity-60" aria-label="Sign in">
                <UserIcon /> <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
            <Link href={routes.cart} className="flex items-center gap-1 hover:opacity-60" aria-label={`Cart, ${cartCount} items`}>
              <BagIcon /> {cartCount}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
