import Link from "next/link";

export function SubNav({ title, links }: { title: string; links: { href: string; label: string; count?: number }[] }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-3">
      <span className="text-[13px] text-fg">{title}</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-[13px] text-muted hover:text-fg">
          {l.label}
          {!!l.count && <span className="ml-1 rounded-full bg-warn/20 px-1.5 text-[11px] text-warn">{l.count}</span>}
        </Link>
      ))}
    </div>
  );
}
