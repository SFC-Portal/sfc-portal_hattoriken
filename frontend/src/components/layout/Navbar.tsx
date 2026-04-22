"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { label: "ホーム", href: "/" },
  { label: "シラバス", href: "/syllabus" },
  { label: "時間割", href: "/timetable" },
  { label: "タスク", href: "/tasks" },
  { label: "SNS", href: "/sns" },
  { label: "バス", href: "/bus" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-sfc-blue text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg">SFC Portal</Link>

        <ul className="hidden md:flex gap-1">
          {NAV.map(({ label, href }) => (
            <li key={href}>
              <Link href={href} className={clsx("px-3 py-1.5 rounded-md text-sm transition-colors", pathname === href ? "bg-white/20 font-semibold" : "hover:bg-white/10")}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="メニュー">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/20 px-4 pb-3">
          <ul className="space-y-1 pt-2">
            {NAV.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)} className={clsx("block px-3 py-2 rounded-md text-sm", pathname === href ? "bg-white/20 font-semibold" : "hover:bg-white/10")}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
