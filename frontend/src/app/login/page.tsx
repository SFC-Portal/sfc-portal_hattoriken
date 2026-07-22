"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);
    const redirect = searchParams.get("redirect") || "/";
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirect);

    await getSupabaseClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-sm p-8 text-center">
        <h1 className="text-xl font-bold text-sfc-blue">SFC Portal</h1>
        <p className="mt-2 text-sm text-gray-500">
          慶應義塾大学SFCのアカウントでログインしてください。
        </p>
        <Button
          className="mt-6 w-full"
          onClick={handleGoogleLogin}
          isLoading={isLoading}
        >
          Googleでログイン
        </Button>
      </div>
    </div>
  );
}
