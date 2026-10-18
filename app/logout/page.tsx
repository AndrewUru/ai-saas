"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { authSecondaryButtonClassName } from "@/components/auth/AuthControls";
import AuthExperience from "@/components/auth/AuthExperience";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  const l = t.auth.logout;

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function closeSession() {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return;
      }

      router.replace("/login");
      router.refresh();
    }

    void closeSession();
  }, [router, supabase]);

  return (
    <AuthExperience
      eyebrow={l.eyebrow}
      title={error ? l.titleError : l.title}
      description={error ? l.descriptionError : l.description}
    >
      {error ? (
        <div className="space-y-4">
          <p
            className="rounded-2xl border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-200"
            role="alert"
          >
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={authSecondaryButtonClassName}
          >
            {l.retry}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 text-sm text-zinc-400">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <span className="inline-flex animate-spin">
              <LoaderCircle className="h-5 w-5" aria-hidden="true" />
            </span>
          </span>
          {l.saving}
        </div>
      )}
    </AuthExperience>
  );
}
