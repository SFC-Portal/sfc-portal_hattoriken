"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase/client";
import { registerAccount } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterConfirmation />
    </Suspense>
  );
}

interface GoogleAccountPreview {
  email: string;
  displayName: string;
  avatarUrl?: string;
}

function RegisterConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const next = searchParams.get("next") || "/";

  const [account, setAccount] = useState<GoogleAccountPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabaseClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) {
          router.replace("/login");
          return;
        }
        const metadata = user.user_metadata ?? {};
        setAccount({
          email: user.email ?? "",
          displayName: metadata.full_name || metadata.name || user.email || "",
          avatarUrl: metadata.avatar_url || metadata.picture,
        });
      });
  }, [router]);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    try {
      await registerAccount();
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.replace(next);
    } catch {
      setError("アカウント作成に失敗しました。時間をおいて再度お試しください。");
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    await getSupabaseClient().auth.signOut();
    router.replace("/login");
  }

  if (!account) return null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-sm p-8 text-center">
        <h1 className="text-xl font-bold text-sfc-blue">アカウントを作成</h1>
        <p className="mt-2 text-sm text-gray-500">
          このGoogleアカウントでSFC Portalのアカウントを新規作成します。
        </p>

        <div className="mt-6 flex flex-col items-center gap-2">
          {account.avatarUrl && (
            <Image
              src={account.avatarUrl}
              alt=""
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <p className="font-medium text-gray-800">{account.displayName}</p>
          <p className="text-sm text-gray-500">{account.email}</p>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-2">
          <Button className="w-full" onClick={handleConfirm} isLoading={isSubmitting}>
            アカウントを作成して続ける
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
