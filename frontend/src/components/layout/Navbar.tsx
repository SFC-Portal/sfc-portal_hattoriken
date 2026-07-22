"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, User as UserIcon, X } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useOnClickOutside } from "@/lib/hooks/useOnClickOutside";
import { deleteAccount } from "@/lib/api/auth";
import { getSupabaseClient } from "@/lib/supabase/client";

const NAV = [
  { label: "ホーム", href: "/" },
  { label: "シラバス", href: "/syllabus" },
  { label: "時間割", href: "/timetable" },
  { label: "タスク", href: "/tasks" },
  { label: "SNS", href: "/sns" },
  { label: "バス", href: "/bus" },
];

function AuthArea() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { data: user } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  async function handleLogout() {
    await getSupabaseClient().auth.signOut();
    logout();
    setMenuOpen(false);
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        "アカウントを削除します。保有するすべてのタスクも削除され、元に戻せません。本当によろしいですか？"
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
      await getSupabaseClient().auth.signOut();
      logout();
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      router.push("/login");
    } catch {
      window.alert("アカウント削除に失敗しました。時間をおいて再度お試しください。");
      setIsDeleting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="px-3 py-1.5 rounded-md text-sm hover:bg-white/10">
        ログイン
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10 transition-colors"
        aria-label="アカウントメニュー"
      >
        {user?.avatarUrl ? (
          <Image src={user.avatarUrl} alt="" width={24} height={24} className="rounded-full" />
        ) : (
          <UserIcon className="h-5 w-5" />
        )}
        {user?.displayName && <span className="text-sm">{user.displayName}</span>}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-lg overflow-hidden z-10">
          {user?.email && (
            <div className="px-4 py-2.5 border-b border-gray-100 text-xs text-gray-500 truncate">
              {user.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            ログアウト
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "削除中…" : "アカウントを削除"}
          </button>
        </div>
      )}
    </div>
  );
}

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

        <div className="hidden md:block">
          <AuthArea />
        </div>

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
          <div className="pt-2 border-t border-white/20 mt-2">
            <AuthArea />
          </div>
        </div>
      )}
    </nav>
  );
}
