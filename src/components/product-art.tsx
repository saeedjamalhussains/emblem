import { initials } from "@/lib/format";

/**
 * Placeholder product imagery until sellers can upload photos: a flat silhouette of the
 * product type, tinted with the identity colour, on the kit's light-grey tile.
 */
type Kind = "tee" | "hoodie" | "cap" | "tote" | "scarf" | "pad" | "pins" | "vinyl" | "ball" | "stickers" | "print" | "mug";

const KEYWORDS: [RegExp, Kind][] = [
  [/hoodie|crewneck|fleece/i, "hoodie"],
  [/jersey|tee|singlet|shirt/i, "tee"],
  [/cap|hat/i, "cap"],
  [/tote|bag/i, "tote"],
  [/scarf/i, "scarf"],
  [/mousepad|pad/i, "pad"],
  [/pin/i, "pins"],
  [/\blp\b|vinyl|record/i, "vinyl"],
  [/ball/i, "ball"],
  [/sticker/i, "stickers"],
  [/print|poster/i, "print"],
  [/mug|cup/i, "mug"],
];

const FALLBACK: Record<string, Kind> = { apparel: "tee", accessories: "tote", collectibles: "vinyl", lifestyle: "mug" };

export function productKind(title: string, category?: string): Kind {
  return KEYWORDS.find(([re]) => re.test(title))?.[1] ?? FALLBACK[category ?? ""] ?? "tee";
}

function Mark({ x, y, size, text, fill }: { x: number; y: number; size: number; text: string; fill: string }) {
  if (!text) return null;
  // Personalised names can be long: squeeze anything wider than the print area.
  const max = 84;
  const natural = text.length * size * 0.62;
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="700" fill={fill} fontFamily="ui-sans-serif, system-ui"
      {...(natural > max ? { textLength: max, lengthAdjust: "spacingAndGlyphs" } : {})}>
      {text}
    </text>
  );
}

function Shape({ kind, color, mark }: { kind: Kind; color: string; mark: string }) {
  const shade = "rgba(0,0,0,.14)";
  const ink = "rgba(255,255,255,.92)";
  switch (kind) {
    case "tee":
    case "hoodie":
      return (
        <g>
          {/* Hood sits behind the shoulders so the body overlaps its lower edge. */}
          {kind === "hoodie" && <path d="M66 66c0-24 15-38 34-38s34 14 34 38Z" fill={color} />}
          <path d="M70 52 48 60 22 92l20 18 14-12v100h88V98l14 12 20-18-26-32-22-8c-4 12-15 19-30 19s-26-7-30-19Z" fill={color} />
          {kind === "hoodie" ? (
            <>
              <path d="M74 42c4 18 14 28 26 28s22-10 26-28" fill="none" stroke={shade} strokeWidth="3" />
              <path d="M92 70v22M108 70v22" stroke={shade} strokeWidth="2" />
              <path d="M72 186v-22c0-6 4-10 10-12h36c6 2 10 6 10 12v22" fill="none" stroke={shade} strokeWidth="3" />
            </>
          ) : (
            <path d="M70 52c4 12 15 19 30 19s26-7 30-19" fill="none" stroke={shade} strokeWidth="3" />
          )}
          <Mark x={100} y={128} size={20} text={mark} fill={ink} />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M48 140c0-40 23-66 52-66s52 26 52 66Z" fill={color} />
          <path d="M40 140h120c8 0 10 12 0 14-30 6-90 6-120 0-10-2-8-14 0-14Z" fill={color} stroke={shade} strokeWidth="2" />
          <circle cx="100" cy="74" r="4" fill={shade} />
          <Mark x={100} y={124} size={18} text={mark} fill={ink} />
        </g>
      );
    case "tote":
      return (
        <g>
          <path d="M76 86V70a24 24 0 0 1 48 0v16" fill="none" stroke={color} strokeWidth="6" />
          <path d="M52 86h96l8 112H44Z" fill={color} />
          <Mark x={100} y={150} size={20} text={mark} fill={ink} />
        </g>
      );
    case "scarf":
      return (
        <g>
          <rect x="82" y="30" width="36" height="180" fill={color} />
          {[52, 92, 132, 172].map((y) => <rect key={y} x="82" y={y} width="36" height="10" fill={ink} opacity=".75" />)}
          {[86, 94, 102, 110].map((x) => <rect key={x} x={x} y="210" width="3" height="14" fill={color} />)}
        </g>
      );
    case "pad":
      return (
        <g>
          <rect x="24" y="96" width="152" height="68" rx="8" fill={color} />
          <Mark x={100} y={138} size={20} text={mark} fill={ink} />
        </g>
      );
    case "pins":
      return (
        <g>
          <circle cx="72" cy="100" r="28" fill={color} />
          <path d="m128 74 9 18 20 3-14 14 3 20-18-9-18 9 3-20-14-14 20-3Z" fill={color} />
          <rect x="78" y="140" width="48" height="48" rx="12" fill={color} />
          <Mark x={72} y={106} size={16} text={mark} fill={ink} />
        </g>
      );
    case "vinyl":
      return (
        <g>
          <rect x="34" y="54" width="110" height="132" fill={color} />
          <circle cx="132" cy="120" r="54" fill="#111" />
          <circle cx="132" cy="120" r="40" fill="none" stroke="#333" strokeWidth="1.5" />
          <circle cx="132" cy="120" r="16" fill={color} />
          <Mark x={72} y={126} size={18} text={mark} fill={ink} />
        </g>
      );
    case "ball":
      return (
        <g>
          <circle cx="100" cy="120" r="58" fill={color} />
          <path d="M42 120h116M100 62v116M60 78c18 22 18 62 0 84M140 78c-18 22-18 62 0 84" fill="none" stroke={shade} strokeWidth="3" />
        </g>
      );
    case "stickers":
      return (
        <g>
          <rect x="44" y="64" width="72" height="72" rx="10" fill={color} transform="rotate(-8 80 100)" />
          <circle cx="132" cy="96" r="30" fill={color} opacity=".75" />
          <rect x="82" y="130" width="70" height="44" rx="22" fill={color} />
          <Mark x={80} y={108} size={18} text={mark} fill={ink} />
        </g>
      );
    case "print":
      return (
        <g>
          <rect x="50" y="44" width="100" height="140" fill="#fff" stroke="#222" strokeWidth="4" />
          <rect x="62" y="56" width="76" height="116" fill={color} />
          <path d="M62 150l22-26 16 16 14-20 24 30v22H62Z" fill={shade} />
        </g>
      );
    case "mug":
      return (
        <g>
          <path d="M138 96h10a20 20 0 0 1 0 40h-10" fill="none" stroke={color} strokeWidth="10" />
          <rect x="58" y="80" width="84" height="104" rx="6" fill={color} />
          <Mark x={100} y={138} size={20} text={mark} fill={ink} />
        </g>
      );
  }
}

/** Bare silhouette for banners and heroes, scaled to fill its parent. */
export function Silhouette({ title, category, color, mark = "", className = "" }: { title: string; category?: string; color: string; mark?: string; className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <Shape kind={productKind(title, category)} color={color} mark={mark} />
    </svg>
  );
}

export function ProductArt({
  title,
  color,
  identity,
  category,
  mark,
  className = "",
  children,
}: {
  title: string;
  color: string;
  identity: string;
  category?: string;
  /** Text printed on the item; defaults to the identity's initials. */
  mark?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-tile ${className}`}>
      <svg viewBox="0 0 200 240" className="absolute inset-0 h-full w-full p-[8%]" role="img" aria-label={title}>
        <Shape kind={productKind(title, category)} color={color} mark={mark ?? initials(identity)} />
      </svg>
      {children}
    </div>
  );
}
