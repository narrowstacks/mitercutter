"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/miter", label: "Miter Cut" },
  { href: "/mat", label: "Mat Cut" },
] as const;

export function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-rule bg-paper-deep/60">
      <div className="mx-auto flex max-w-[720px] gap-0 px-[14px] lg:max-w-5xl">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={
                "border-b-2 px-[14px] py-[10px] font-mono text-[11px] uppercase tracking-[0.18em] " +
                (active
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-soft hover:text-ink")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
