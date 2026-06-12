"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/tipps", label: "Tipps" },
    { href: "/bonusfragen", label: "Bonusfragen" },
    { href: "/tabelle", label: "Tabelle" },
    { href: "/auswertung", label: "Auswertung" },
  ];

  return (
    <header className="border-b border-zinc-800 bg-slate-950">
      <nav className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm md:text-base font-semibold transition ${
                  active
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-900 text-zinc-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}