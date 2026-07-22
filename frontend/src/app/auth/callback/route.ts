import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // バックエンドにusers行がまだ無い（=初回ログイン）なら、確認画面を経由させてから登録する。
      // /auth/meが200（登録済み）でも404（未登録）でもない場合（5xx等の一時的な障害）は、
      // 未登録のまま素通りさせず、登録済みかどうか不明な状態としてログイン画面に戻す
      const meRes = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        cache: "no-store",
      });

      if (meRes.ok) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (meRes.status === 404) {
        const registerUrl = new URL("/register", origin);
        registerUrl.searchParams.set("next", next);
        return NextResponse.redirect(registerUrl);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
