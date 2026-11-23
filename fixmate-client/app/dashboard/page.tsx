
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

export default function DashboardRedirect() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const roleRoutes: Record<string, string> = {
      admin: "/dashboard/admin",
      technician: "/dashboard/technician",
      customer: "/dashboard/customer",
    };

    const role = session.user.role;
    const destination = role ? roleRoutes[role] : undefined;

    if (!destination) {
      router.replace("/sign-in");
      return;
    }

    router.replace(destination);
  }, [session, isPending, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

        <p className="text-sm text-slate-400">
          Redirecting to your dashboard...
        </p>
      </div>
    </main>
  );
}
