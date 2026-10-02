"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, LogOut, Save, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BottomNavigation from "@/shared/components/navigation/BottomNavigation";

export default function ProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [insurance, setInsurance] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const userEmail = user.email || "";
    setEmail(userEmail);

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Load profile error:", error);
      setErrorMessage("Failed to load profile.");
    }

    if (data) {
      setFullName(data.full_name || "");
      setEmail(data.email || userEmail);
    }

    const savedInsurance = window.localStorage.getItem("profile_insurance");
    if (savedInsurance) {
      setInsurance(savedInsurance);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setMessage("");
    setErrorMessage("");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullName || !cleanEmail) {
      setErrorMessage("Please fill in your name and email.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: cleanFullName,
          email: cleanEmail,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Update profile error:", profileError);
        setErrorMessage(profileError.message || "Failed to update profile.");
        return;
      }

      if (cleanEmail !== user.email) {
        const { error } = await supabase.auth.updateUser({
          email: cleanEmail,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }
      }

      if (password.trim() !== "") {
        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setPassword("");
      }

      setFullName(cleanFullName);
      setEmail(cleanEmail);
      window.localStorage.setItem("profile_insurance", insurance.trim());
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
  try {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setErrorMessage("Failed to log out. Please try again.");
      return;
    }

    router.replace("/");
    router.refresh();
  } finally {
    setLoggingOut(false);
  }
};

  if (loading) {
    return (
      <main className="min-h-screen bg-[#D4E0DF] flex items-center justify-center">
        <p className="text-[#476973] font-semibold">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#D4E0DF] flex flex-col">
      <section className="flex-1 px-6 pt-12 pb-10">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-5xl text-[#476973]">Profile</h1>

          <p className="mt-3 text-[#476973]/75">
            Manage your personal information and account settings.
          </p>
        </header>

        <div className="rounded-[36px] bg-[#F8FBFA] p-6 shadow-sm">
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
              <User size={21} className="text-[#476973]" />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45"
              />
            </div>

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
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45"
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 relative">
              <Shield size={21} className="text-[#476973]" />
              <input
                list="insurances"
                type="text"
                placeholder="Insurance Company"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45"
              />
              <datalist id="insurances">
                <option value="بوبا العربية (Bupa Arabia)" />
                <option value="التعاونية (Tawuniya)" />
                <option value="تكافل الراجحي (Al Rajhi Takaful)" />
                <option value="ميدغلف (Medgulf)" />
                <option value="ملاذ للتأمين (Malath Insurance)" />
                <option value="الدرع العربي (Arabian Shield)" />
                <option value="أليانز السعودي الفرنسي (Allianz Saudi Fransi)" />
                <option value="ولاء للتأمين (Walaa Insurance)" />
                <option value="عناية السعودية (Saudi Enaya)" />
                <option value="بروج للتأمين (Buruj Insurance)" />
                <option value="المتحدة للتأمين (UCA)" />
                <option value="الصقر للتأمين (Al Sagr Insurance)" />
                <option value="طوكيو مارين (Tokio Marine)" />
                <option value="الخليجية العامة (Gulf General)" />
                <option value="العالمية للتأمين (Al Alamiya)" />
              </datalist>
            </div>
          </div>

          {message && (
            <p className="mt-5 rounded-2xl bg-green-50 p-3 text-center text-sm font-medium text-green-700">
              {message}
            </p>
          )}

          {errorMessage && (
            <p className="mt-5 rounded-2xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#476973] py-4 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#476973] py-4 font-semibold text-[#476973] transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogOut size={20} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}