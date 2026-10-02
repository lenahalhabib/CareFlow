"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import BottomNavigation from "@/shared/components/navigation/BottomNavigation";
import { useTreatment } from "@/shared/context/TreatmentContext";

import {
  comparisonService,
  type ComparisonData,
} from "@/services/comparison/comparison.service";

import { planService } from "@/services/plan/plan.service";

import {
  buildHospitalComparison,
} from "@/shared/utils/hospitalComparison";

import BestOptionContent from "./BestOptionContent";

import {
  buildSaveTreatmentPlanInput,
  createRecommendationReason,
} from "./bestOption.mapper";

const SELECTED_INSURANCE_STORAGE_KEY =
  "selectedInsuranceCompanyId";

export default function BestOptionPage() {
  const router = useRouter();

  const {
    extractedText,
    items,
    treatmentTimeline,
    estimatedOverallJourney,
    totalAmount,
    resetTreatment,
  } = useTreatment();

  const [
    comparisonData,
    setComparisonData,
  ] = useState<ComparisonData | null>(null);

  const [
    selectedInsuranceCompanyId,
    setSelectedInsuranceCompanyId,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    saveErrorMessage,
    setSaveErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadBestOptionData();
  }, []);

  async function loadBestOptionData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data =
        await comparisonService.getComparisonData();

      setComparisonData(data);

      const savedInsuranceCompanyId =
        window.sessionStorage.getItem(
          SELECTED_INSURANCE_STORAGE_KEY
        );

      const savedCompanyExists =
        data.insuranceCompanies.some(
          (company) =>
            company.id ===
            savedInsuranceCompanyId
        );

      if (
        savedInsuranceCompanyId &&
        savedCompanyExists
      ) {
        setSelectedInsuranceCompanyId(
          savedInsuranceCompanyId
        );

        return;
      }

      const defaultCompany =
        data.insuranceCompanies.find(
          (company) =>
            company.plan_type === "BASIC"
        ) ?? data.insuranceCompanies[0];

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
          : "Failed to load best option."
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
          comparisonData.hospitalServices,

        keywords:
          comparisonData.serviceKeywords,

        serviceDefinitions:
          comparisonData.serviceDefinitions,

        insuranceCompanies:
          comparisonData.insuranceCompanies,

        insuranceCoverage:
          comparisonData.insuranceCoverage,

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

  const bestOption =
    comparisonResults[0];

  const recommendationReason =
    useMemo(() => {
      if (!bestOption) {
        return "";
      }

      return createRecommendationReason(
        bestOption,
        items.length
      );
    }, [
      bestOption,
      items.length,
    ]);

  async function handleSavePlan() {
    if (
      !bestOption ||
      saving ||
      saved
    ) {
      return;
    }

    try {
      setSaving(true);
      setSaveErrorMessage("");

      const saveInput =
        buildSaveTreatmentPlanInput({
          extractedText,
          totalAmount,
          items,
          treatmentTimeline,
          estimatedOverallJourney,
          comparisonResults,
        });

      await planService.saveTreatmentPlan(
        saveInput
      );

      setSaved(true);

      window.sessionStorage.removeItem(
        SELECTED_INSURANCE_STORAGE_KEY
      );

      resetTreatment();

      router.push(
        "/current-plans"
      );
    } catch (error) {
      console.error(error);

      setSaveErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save treatment plan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#D4E0DF] px-6">
        <div className="rounded-[30px] bg-[#F8FBFA] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#D4E0DF] border-t-[#476973]" />

          <p className="font-semibold text-[#476973]">
            Preparing best option...
          </p>

          <p className="mt-2 text-sm text-[#476973]/70">
            Analyzing treatment completeness,
            cost and hospital rating.
          </p>
        </div>
      </main>
    );
  }

  if (
    errorMessage ||
    !bestOption
  ) {
    return (
      <main className="flex min-h-screen flex-col bg-[#D4E0DF]">
        <section className="flex-1 px-6 pb-10 pt-12">
          <div className="rounded-[36px] bg-[#F8FBFA] p-6 text-center shadow-sm">
            <h1 className="font-serif text-4xl text-[#476973]">
              Best Option
            </h1>

            <p className="mt-4 text-[#476973]/75">
              {errorMessage ||
                "We could not generate a recommendation because no hospital matches were found."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/hospital/comparison"
                )
              }
              className="mt-8 w-full rounded-2xl bg-[#476973] py-4 font-semibold text-white"
            >
              Back to Comparison
            </button>
          </div>
        </section>

        <BottomNavigation />
      </main>
    );
  }

  return (
    <BestOptionContent
      bestOption={bestOption}
      totalItems={items.length}
      saving={saving}
      saved={saved}
      saveErrorMessage={
        saveErrorMessage
      }
      onSave={handleSavePlan}
      onBack={() =>
        router.push(
          "/hospital/comparison"
        )
      }
    />
  );
}