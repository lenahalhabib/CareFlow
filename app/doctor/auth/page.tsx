"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, User, Mail, Lock, Building, FileBadge, Image as ImageIcon } from 'lucide-react';

export default function DoctorSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullNameAr: '',
    fullNameEn: '',
    email: '',
    phone: '',
    password: '',
    hospitalName: '',
    professionalTitle: '',
    licenseNumber: '',
    specialty: '',
    customSpecialty: '',
    yearsOfExperience: '',
    experienceBio: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth & redirect
    router.push('/doctor/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#D4E0DF] flex flex-col justify-center px-4 py-10">
      <section className="rounded-[36px] bg-[#F8FBFA] p-7 shadow-sm max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="CareFlow Logo" className="w-48 h-auto" />
        </div>
        
        <h2 className="font-serif text-4xl text-[#476973] text-center">
          Doctor Registration
        </h2>

        <p className="mt-2 text-center text-[#476973]/75 mb-8">
          Join CareFlow to provide clear treatment plans.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <User size={20} className="text-[#476973]" />
              <input type="text" required placeholder="Full Name (Ar)" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.fullNameAr} onChange={(e) => setFormData({...formData, fullNameAr: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <User size={20} className="text-[#476973]" />
              <input type="text" required placeholder="Full Name (En)" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.fullNameEn} onChange={(e) => setFormData({...formData, fullNameEn: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <Building size={20} className="text-[#476973]" />
              <input type="text" placeholder="Hospital / Clinic Name" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <FileBadge size={20} className="text-[#476973]" />
              <select className="w-full bg-transparent text-[#476973] outline-none appearance-none" value={formData.professionalTitle} onChange={(e) => setFormData({...formData, professionalTitle: e.target.value})}>
                <option value="" disabled>Professional Title</option>
                <option value="general">General Practitioner</option>
                <option value="specialist">Specialist</option>
                <option value="senior_specialist">Senior Specialist</option>
                <option value="consultant">Consultant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <FileBadge size={20} className="text-[#476973]" />
              <input type="text" required placeholder="License Number" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <select className="w-full bg-transparent text-[#476973] outline-none appearance-none" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})}>
                <option value="" disabled>Specialty</option>
                <option value="surgery">Oral and Maxillofacial Surgery & Implants</option>
                <option value="prosthodontics">Prosthodontics</option>
                <option value="endodontics">Endodontics (Root Canal)</option>
                <option value="orthodontics">Orthodontics</option>
                <option value="periodontics">Periodontics (Gum Disease)</option>
                <option value="cosmetic">Cosmetic Dentistry</option>
                <option value="pediatric">Pediatric Dentistry</option>
                <option value="general">General Dentistry</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {formData.specialty === 'other' && (
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <input type="text" placeholder="Please specify your specialty" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.customSpecialty} onChange={(e) => setFormData({...formData, customSpecialty: e.target.value})} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
               <input type="number" min="0" placeholder="Years of Experience" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.yearsOfExperience} onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 relative overflow-hidden">
               <ImageIcon size={20} className="text-[#476973]" />
               <span className="text-[#476973]/60 text-sm">Upload Certificates</span>
               <input type="file" multiple accept=".pdf,.jpg,.png" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          
          <div className="rounded-2xl bg-white px-4 py-3">
            <textarea placeholder="Brief bio or experience summary" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45 resize-none" rows={3} value={formData.experienceBio} onChange={(e) => setFormData({...formData, experienceBio: e.target.value})}></textarea>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#476973]/10 pt-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <Mail size={20} className="text-[#476973]" />
              <input type="email" required placeholder="Professional Email" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <Lock size={20} className="text-[#476973]" />
              <input type="password" required placeholder="Password" className="w-full bg-transparent text-[#476973] outline-none placeholder:text-[#476973]/45" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#476973] py-4 font-semibold text-white transition hover:bg-[#3d5d66]">
            SIGN UP <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-8 text-center text-[#476973]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
