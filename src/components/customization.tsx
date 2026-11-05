import { type Customization, parseJson } from "@/lib/format";

export function CustomizationNote({ value }: { value: string | null }) {
  const c = parseJson<Customization>(value);
  if (!c) return null;
  return (
    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
      Personalised:
      {c.text && <span className="font-mono text-fg">{c.text}</span>}
      {c.color && <span className="inline-block h-3 w-3 rounded-full ring-1 ring-line" style={{ background: c.color }} />}
    </div>
  );
}
