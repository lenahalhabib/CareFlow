"use client";

import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#476973] px-6 py-10 text-[#DCE7E6]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col">
        {/* Logo */}
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="CareFlow Logo" className="w-64 h-auto" />
          </div>

          <p className="mt-20 max-w-sm text-2xl font-black uppercase leading-[1.25] tracking-[0.13em]">
            From a treatment
            <br />
            plan to a clear
            <br />
            financial decision
          </p>
        </section>

        {/* Actions */}
        <section className="pb-10">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded-2xl bg-[#DCE7E6] py-4 text-3xl font-bold text-[#476973] transition active:scale-[0.98]"
          >
            Login
          </button>

          <p className="mt-8 text-center text-base text-[#DCE7E6]">
            If you don&apos;t have an account,{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-bold underline-offset-4 hover:underline"
            >
              Sign up
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}