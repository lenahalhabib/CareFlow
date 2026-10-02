"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";

import BottomNavigation from "@/shared/components/navigation/BottomNavigation";
import { useTreatment } from "@/shared/context/TreatmentContext";

import {
  buildHospitalComparison,
} from "@/shared/utils/hospitalComparison";

import {
  comparisonService,
  type ComparisonData,
} from "@/services/comparison/comparison.service";

import HospitalCard from "./components/HospitalCard";

const SELECTED_INSURANCE_STORAGE_KEY =
  "selectedInsuranceCompanyId";

export default function HospitalComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAlternative = searchParams?.get('isAlternative') === 'true';

  const {
    items: contextItems,
    totalAmount,
  } = useTreatment();

  // For the hackathon demo, if the user navigated here without state or isAlternative is true, mock the data
  const MOCK_ITEMS = [
    { serviceName: 'أشعة CBCT', quantity: 1, totalPrice: 350 },
    { serviceName: 'تنظيف جير', quantity: 1, totalPrice: 300 },
    { serviceName: 'ترقيع عظم', quantity: 1, totalPrice: 2500 },
    { serviceName: 'رفع الجيب الأنفي', quantity: 1, totalPrice: 3000 },
    { serviceName: 'زرعة زيجماتيك', quantity: 1, totalPrice: 15000 }
  ];
  
  const items = (contextItems && contextItems.length > 0) ? contextItems : MOCK_ITEMS;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    price: false,
    distance: false,
    insurance: false,
    installments: false,
  });

  const [
    comparisonData,
    setComparisonData,
  ] = useState<ComparisonData | null>(
    null
  );

  const [
    selectedInsuranceCompanyId,
    setSelectedInsuranceCompanyId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadComparisonData();
  }, []);

  async function loadComparisonData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data =
        await comparisonService
          .getComparisonData();

      setComparisonData(data);

      const savedCompanyId =
        window.sessionStorage.getItem(
          SELECTED_INSURANCE_STORAGE_KEY
        );

      const savedCompanyExists =
        data.insuranceCompanies.some(
          (company) =>
            company.id ===
            savedCompanyId
        );

      if (
        savedCompanyId &&
        savedCompanyExists
      ) {
        setSelectedInsuranceCompanyId(
          savedCompanyId
        );

        return;
      }

      const defaultCompany =
        data.insuranceCompanies.find(
          (company) =>
            company.plan_type ===
            "BASIC"
        ) ??
        data.insuranceCompanies[0];

      if (!defaultCompany) {
        return;
      }

      setSelectedInsuranceCompanyId(
        defaultCompany.id
      );

      window.sessionStorage.setItem(
        SELECTED_INSURANCE_STORAGE_KEY,
        defaultCompany.id
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load hospital comparison."
      );
    } finally {
      setLoading(false);
    }
  }

  const comparisonResults =
    useMemo(() => {
      if (!comparisonData) {
        return [];
      }

      return buildHospitalComparison({
        hospitals:
          comparisonData.hospitals,

        services:
          comparisonData
            .hospitalServices,

        keywords:
          comparisonData
            .serviceKeywords,

        serviceDefinitions:
          comparisonData
            .serviceDefinitions,

        insuranceCompanies:
          comparisonData
            .insuranceCompanies,

        insuranceCoverage:
          comparisonData
            .insuranceCoverage,

        selectedInsuranceCompanyId:
          selectedInsuranceCompanyId ||
          null,

        items,

        currentTotal:
          Number(totalAmount || 0),
      });
    }, [
      comparisonData,
      selectedInsuranceCompanyId,
      items,
      totalAmount,
    ]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#D4E0DF] px-6">
        <div className="rounded-[30px] bg-[#F8FBFA] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#D4E0DF] border-t-[#476973]" />

          <p className="font-semibold text-[#476973]">
            Comparing hospitals...
          </p>

          <p className="mt-2 text-sm text-[#476973]/70">
            Analyzing treatment
            completeness, cost and
            hospital rating.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#D4E0DF]">
      <section className="flex-1 px-6 pb-10 pt-12">
        <header className="mb-6 relative flex items-center justify-center">
          <button onClick={() => router.push('/review-plan')} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#476973] p-2 bg-[#F8FBFA] rounded-full shadow-sm hover:bg-[#D4E0DF] transition">
             <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="font-serif text-4xl text-[#476973]">
              {isAlternative ? "Alternative Options" : "Hospital Comparison"}
            </h1>
            <p className="mt-2 text-[#476973]/75 text-sm">
              {isAlternative 
                ? "Explore alternative hospitals for the remaining parts of your treatment plan." 
                : "Compare hospitals based on treatment availability, price and rating."}
            </p>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={
                loadComparisonData
              }
              className="mt-4 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mb-6 rounded-[30px] bg-[#476973] p-5 text-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">
              {isAlternative ? "Remaining treatment cost" : "Your current plan"}
            </p>
            <p className="mt-1 text-3xl font-bold">
              {Number(isAlternative ? 20200 : totalAmount || 0).toLocaleString()} SAR
            </p>
            <p className="mt-2 text-sm text-white/70">
              {isAlternative ? 3 : items.length} treatment {(!isAlternative && items.length === 1) ? "service" : "services"}
            </p>
          </div>
          
          <button onClick={() => setIsFilterModalOpen(true)} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
             <Filter size={20} className="text-white" />
          </button>
        </div>

        {!errorMessage && comparisonResults.length === 0 ? (
          <div className="rounded-[36px] bg-[#F8FBFA] p-6 text-center shadow-sm">
            <h2 className="font-serif text-3xl text-[#476973]">
              No Matches Found
            </h2>

            <p className="mt-4 text-[#476973]/75">
              We could not match your
              treatment services with the
              available hospital prices.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/review-plan"
                )
              }
              className="mt-8 w-full rounded-2xl bg-[#476973] py-4 font-semibold text-white"
            >
              Back to Review
            </button>
          </div>
        ) : (
          !errorMessage && (
            <div className="space-y-5">
              {comparisonResults.map(
                (result, index) => (
                  <HospitalCard
                    key={
                      result.hospital.id
                    }
                    result={result}
                    isBestMatch={
                      index === 0
                    }
                    isAlternative={isAlternative}
                  />
                )
              )}
            </div>
          )
        )}
      </section>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-[#476973]/50 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)}>
          <div className="bg-[#F8FBFA] rounded-t-[36px] sm:rounded-[36px] p-6 w-full max-w-md shadow-xl text-left" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#476973] font-serif">Filters</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-[#476973] hover:bg-[#D4E0DF] p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              {[
                { id: 'price', label: 'Price (Lowest First)' },
                { id: 'distance', label: 'Distance (Nearest First)' },
                { id: 'insurance', label: 'Accepts Insurance' },
                { id: 'installments', label: 'Available Installments' }
              ].map(filter => (
                <label key={filter.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#476973]/20 cursor-pointer hover:bg-[#D4E0DF]/20 transition">
                  <input 
                    type="checkbox" 
                    checked={(activeFilters as any)[filter.id]}
                    onChange={() => setActiveFilters(prev => ({...prev, [filter.id]: !(prev as any)[filter.id]}))}
                    className="w-5 h-5 text-[#476973] rounded border-[#476973]/30 focus:ring-[#476973]" 
                  />
                  <span className="font-semibold text-[#476973]">{filter.label}</span>
                </label>
              ))}
            </div>

            <button onClick={() => setIsFilterModalOpen(false)} className="w-full bg-[#476973] text-white py-4 rounded-2xl font-bold hover:bg-[#3d5d66] transition shadow-sm">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </main>
  );
}