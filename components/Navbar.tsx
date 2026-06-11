"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/tipps",
      label: "Tipps",
    },
    {
      href: "/bonusfragen",
      label: "Bonusfragen",
    },
    {
      href: "/tabelle",
      label: "Tabelle",
    },
  ];

  return (
    <header className="border-b border-zinc-800">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex gap-6 text-lg">
        {links.map((link) => {
          const active =
            pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "text-blue-400 font-semibold"
                  : "text-zinc-300 hover:text-white transition"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}