import Image from "next/image";
import { SITE } from "@/config/site";
import logo from "../../public/logo.png";

/** Wordmark: black artwork on transparent, inverted to white in dark mode. */
export function Logo({ height = 30, className = "" }: { height?: number; className?: string }) {
  return (
    <Image
      src={logo}
      alt={SITE.name}
      height={height}
      style={{ width: "auto", height }}
      className={`dark:invert ${className}`}
      priority
    />
  );
}
