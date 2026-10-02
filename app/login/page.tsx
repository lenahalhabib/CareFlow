"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, User, Stethoscope } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    // In a real app, you would check if the user is a doctor or patient in the DB.
    // For this mockup, if role is doctor, we route to doctor dashboard directly.
    if (role === "doctor") {
       router.push("/doctor/dashboard");
       return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : "Unable to login. Please try again."
        );
        return;
      }

      router.push("/create-plan");
    } catch (err) {
      console.error(err);
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#D4E0DF] flex flex-col justify-center px-7">
      <section className="rounded-[36px] bg-[#F8FBFA] p-7 shadow-sm max-w-md mx-auto w-full">
        <h1 className="font-serif text-5xl text-[#476973] text-center">
          Welcome Back
        </h1>

        <p className="mt-4 text-center text-[#476973]/75">
          Sign in to continue your journey.
        </p>

        {/* Role Selection */}
        <div className="mt-8 flex rounded-2xl bg-[#D4E0DF] p-1">
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              role === "patient"
                ? "bg-white text-[#476973] shadow-sm"
                : "text-[#476973]/60 hover:text-[#476973]"
            }`}
          >
            <User size={18} />
            Patient
          </button>
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              role === "doctor"
                ? "bg-white text-[#476973] shadow-sm"
                : "text-[#476973]/60 hover:text-[#476973]"
            }`}
          >
            <Stethoscope size={18} />
            Doctor
          </button>
        </div>

        <div className="mt-8 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
            <Mail size={21} className="text-[#476973]" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
            <Lock size={21} className="text-[#476973]" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45"
            />
          </div>

          {errorMessage && (
            <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#476973] py-4 font-semibold text-white transition hover:bg-[#3d5d66] disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "LOGIN"}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </div>

        <p className="mt-8 text-center text-[#476973]">
          Don&apos;t have an account?{" "}
          <Link href={role === "doctor" ? "/doctor/auth" : "/signup"} className="font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </section>
    </main>
  );
}