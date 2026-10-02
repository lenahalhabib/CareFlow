"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
  Star,
  Trophy,
  User,
  Stethoscope,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

import type { ComparisonResult } from "@/shared/utils/hospitalComparison";

import TreatmentPrices from "./TreatmentPrices";
import InsuranceSelector from "./InsuranceSelector";
import MissingServices from "./MissingServices";

type HospitalCardProps = {
  result: ComparisonResult;
  isBestMatch: boolean;
  isAlternative?: boolean;
};

type FinancingCalculation = {
  monthlyPayment: number;
  administrativeFee: number;
  financedAmount: number;
  totalPayable: number;
};

const FINANCING_MONTHS = 18;
const ANNUAL_RATE = 6;
const ADMINISTRATIVE_FEE_RATE = 0.5;

function formatAmount(amount: number): string {
  return Math.round(Number(amount || 0)).toLocaleString();
}

function calculateFinancing(treatmentCost: number): FinancingCalculation {
  const safeTreatmentCost = Math.max(Number(treatmentCost || 0), 0);
  const administrativeFee = safeTreatmentCost * (ADMINISTRATIVE_FEE_RATE / 100);
  const financedAmount = safeTreatmentCost + administrativeFee;
  const monthlyRate = ANNUAL_RATE / 12 / 100;

  if (monthlyRate === 0) {
    const monthlyPayment = financedAmount / FINANCING_MONTHS;
    return {
      monthlyPayment,
      administrativeFee,
      financedAmount,
      totalPayable: monthlyPayment * FINANCING_MONTHS,
    };
  }

  const rateFactor = Math.pow(1 + monthlyRate, FINANCING_MONTHS);
  const monthlyPayment = financedAmount * ((monthlyRate * rateFactor) / (rateFactor - 1));
  const totalPayable = monthlyPayment * FINANCING_MONTHS;

  return {
    monthlyPayment,
    administrativeFee,
    financedAmount,
    totalPayable,
  };
}

export default function HospitalCard({ result, isBestMatch, isAlternative }: HospitalCardProps) {
  const router = useRouter();
  const [isFinancingOpen, setIsFinancingOpen] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'waiting' | 'confirmed'>('idle');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // 650 SAR represents the completed treatments (CBCT + Cleaning)
  const displayTotal = isAlternative ? Math.max(0, result.total - 650) : result.total;
  const financing = calculateFinancing(displayTotal);

  // Generate mock doctor data based on hospital name to ensure variety
  const getMockDoctor = (hospitalName: string) => {
    if (hospitalName.includes("B")) {
      return {
        name: "د. أحمد خالد",
        title: "استشاري زراعة أسنان",
        experience: "15 سنة",
        degree: "البورد السعودي في جراحة الوجه والفكين",
        rating: 4.9,
      };
    } else if (hospitalName.includes("A")) {
      return {
        name: "د. سارة فهد",
        title: "أخصائية تقويم وزراعة",
        experience: "9 سنوات",
        degree: "ماجستير طب الأسنان - جامعة الملك سعود",
        rating: 4.7,
      };
    } else {
      return {
        name: "د. عمر عبدالله",
        title: "استشاري جراحة اللثة",
        experience: "12 سنة",
        degree: "البورد الأمريكي لطب الأسنان",
        rating: 4.8,
      };
    }
  };

  const mockDoctor = getMockDoctor(result.hospital.name);

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return alert("الرجاء اختيار تاريخ ووقت");
    router.push('/patient/dashboard?status=pending');
  };

  return (
    <article className="rounded-[24px] bg-[#F8FBFA] p-4 shadow-sm relative">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isBestMatch && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#476973] px-2.5 py-1 text-[11px] font-semibold text-white">
              <Trophy size={12} />
              Best Match
            </div>
          )}

          <h2 className="font-serif text-xl text-[#476973]">
            {result.hospital.name}
          </h2>
          
          <button onClick={() => setShowDoctorModal(true)} className="mt-1 flex items-center gap-1.5 text-[#476973] font-bold text-xs hover:underline">
            <Stethoscope size={14} /> {mockDoctor.name}
          </button>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#476973]/70">
            <MapPin size={14} className="shrink-0" />
            {result.hospital.location} (يبعد 2.5 كم)
          </p>

          {result.hospital.accreditation && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#476973]/70">
              <BadgeCheck size={14} className="shrink-0" />
              {result.hospital.accreditation}
            </p>
          )}
          
          <div className="mt-2 flex gap-1.5">
            <span className="bg-[#D4E0DF] text-[#476973] px-2 py-0.5 rounded-md text-[11px] font-bold">يقبل التأمين</span>
            <span className="bg-[#D4E0DF] text-[#476973] px-2 py-0.5 rounded-md text-[11px] font-bold">يوجد تقسيط</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] text-[#476973]/60">
            Total Price
          </p>

          <p className="mt-0.5 text-xl font-bold text-[#476973]">
            {formatAmount(displayTotal)}
          </p>

          <p className="text-[11px] text-[#476973]/60">
            SAR
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Star
              size={18}
              className="text-[#476973]"
            />

            <p className="text-sm font-semibold text-[#476973]">
              Hospital Rating
            </p>
          </div>

          <p className="text-sm font-bold text-[#476973]">
            {result.hospital.rating}/5
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <TreatmentPrices
          items={isAlternative ? result.matchedItems.slice(2) : result.matchedItems}
          total={displayTotal}
        />

        <InsuranceSelector
          options={result.insuranceOptions}
        />

        <div className="overflow-hidden rounded-xl bg-white">
          <button
            type="button"
            onClick={() =>
              setIsFinancingOpen(
                (previousValue) =>
                  !previousValue
              )
            }
            className="flex w-full items-center justify-between gap-3 p-3 text-left"
            aria-expanded={isFinancingOpen}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4E0DF] text-[#476973]">
                <CreditCard size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#476973]">
                  With Nama Card
                </p>

                <p className="mt-0.5 text-xs text-[#476973]/70">
                  Pay only{" "}
                  <span className="font-semibold text-[#476973]">
                    {formatAmount(
                      financing.monthlyPayment
                    )}{" "}
                    SAR monthly
                  </span>
                </p>
              </div>
            </div>

            <ChevronDown
              size={18}
              className={`shrink-0 text-[#476973] transition-transform ${
                isFinancingOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {isFinancingOpen && (
            <div className="border-t border-[#D4E0DF] px-3 pb-3 pt-4">
              <div className="text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[#476973]">
                  <CreditCard size={17} />
                  Estimated Monthly Payment
                </p>

                <p className="mt-2 text-3xl font-bold text-[#476973]">
                  {formatAmount(
                    financing.monthlyPayment
                  )}{" "}
                  SAR
                </p>

                <p className="mt-1 text-sm text-[#476973]/65">
                  per month for{" "}
                  {FINANCING_MONTHS} months
                </p>

                <p className="mt-4 text-sm text-[#476973]/60">
                  instead of paying
                </p>

                <p className="mt-1 text-lg font-bold text-[#476973]">
                  {formatAmount(displayTotal)} SAR
                  upfront
                </p>
              </div>

              <div className="mt-5 space-y-3 rounded-2xl bg-[#F8FBFA] p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#476973]/65">
                    Financing period
                  </span>

                  <span className="font-semibold text-[#476973]">
                    {FINANCING_MONTHS} months
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#476973]/65">
                    Annual rate
                  </span>

                  <span className="font-semibold text-[#476973]">
                    {ANNUAL_RATE}%
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#476973]/65">
                    Administrative fee
                  </span>

                  <span className="font-semibold text-[#476973]">
                    {formatAmount(
                      financing.administrativeFee
                    )}{" "}
                    SAR
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#D4E0DF] pt-3 text-sm">
                  <span className="text-[#476973]/65">
                    Estimated total payable
                  </span>

                  <span className="font-bold text-[#476973]">
                    {formatAmount(
                      financing.totalPayable
                    )}{" "}
                    SAR
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <p className="flex items-center gap-2 text-sm text-[#476973]">
                  <Check
                    size={17}
                    className="shrink-0"
                  />
                  Installment up to 18 months
                </p>

                <p className="flex items-center gap-2 text-sm text-[#476973]">
                  <Check
                    size={17}
                    className="shrink-0"
                  />
                  Instant eligibility check
                </p>

                <p className="flex items-center gap-2 text-sm text-[#476973]">
                  <Check
                    size={17}
                    className="shrink-0"
                  />
                  Digital application
                </p>
              </div>

              <p className="mt-5 text-xs leading-5 text-[#476973]/55">
                Illustrative financing estimate.
                Final rate, fees, eligibility and
                monthly payment are determined by
                the financing provider.
              </p>
            </div>
          )}
        </div>

        {result.unmatchedItems.length > 0 && (
          <MissingServices
            items={result.unmatchedItems}
          />
        )}
      </div>

      <div className="mt-5">
         <button onClick={() => setShowBookingModal(true)} className="w-full bg-[#476973] hover:bg-[#3d5d66] text-white py-4 rounded-2xl font-bold transition shadow-sm">
           حجز موعد
         </button>
      </div>

      {/* Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-[#476973]/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#F8FBFA] rounded-[36px] p-6 w-full max-w-md shadow-xl text-right">
            <div className="flex justify-between items-center mb-6 border-b border-[#476973]/10 pb-4">
              <h3 className="text-2xl font-bold text-[#476973] flex items-center gap-2">
                 <Stethoscope size={24}/> بيانات الطبيب
              </h3>
              <button onClick={() => setShowDoctorModal(false)} className="text-[#476973]/60 hover:text-[#476973] font-bold">إغلاق</button>
            </div>
            
            <div className="space-y-4 text-[#476973]">
               <div>
                 <p className="text-sm opacity-70">الاسم</p>
                 <p className="font-bold text-lg">{mockDoctor.name}</p>
               </div>
               <div>
                 <p className="text-sm opacity-70">المسمى المهني</p>
                 <p className="font-bold">{mockDoctor.title}</p>
               </div>
               <div>
                 <p className="text-sm opacity-70">الشهادات</p>
                 <p className="font-bold">{mockDoctor.degree}</p>
               </div>
               <div className="flex justify-between border-t border-[#476973]/10 pt-4 mt-2">
                 <div>
                   <p className="text-sm opacity-70">سنوات الخبرة</p>
                   <p className="font-bold">{mockDoctor.experience}</p>
                 </div>
                 <div>
                   <p className="text-sm opacity-70">التقييم</p>
                   <p className="font-bold flex items-center gap-1"><Star size={16} className="fill-[#476973]" /> {mockDoctor.rating}/5</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-[#476973]/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#F8FBFA] rounded-[36px] p-6 w-full max-w-md shadow-xl text-center">
            
            <h3 className="text-2xl font-bold text-[#476973] mb-2">حجز الجلسة الأولى</h3>
            <p className="text-sm text-[#476973]/70 mb-6">الرجاء اختيار الموعد المناسب لزيارتك الأولى للطبيب {mockDoctor.name}</p>
            
            <div className="space-y-4 mb-6 text-right">
               <div>
                 <label className="block text-sm font-bold text-[#476973] mb-2">تاريخ الموعد</label>
                 <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-[#476973]/20">
                   <CalendarIcon size={20} className="text-[#476973]" />
                   <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-transparent outline-none text-[#476973]" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-bold text-[#476973] mb-2">وقت الموعد</label>
                 <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-[#476973]/20">
                   <Clock size={20} className="text-[#476973]" />
                   <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full bg-transparent outline-none text-[#476973]" />
                 </div>
               </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowBookingModal(false)} className="flex-1 bg-white border border-[#476973]/20 text-[#476973] py-4 rounded-2xl font-bold hover:bg-[#D4E0DF]/30 transition">إلغاء</button>
              <button onClick={handleBook} className="flex-1 bg-[#476973] text-white py-4 rounded-2xl font-bold hover:bg-[#3d5d66] transition shadow-sm">تأكيد الموعد</button>
            </div>

          </div>
        </div>
      )}
    </article>
  );
}