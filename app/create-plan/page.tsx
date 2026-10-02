"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import BottomNavigation from "@/shared/components/navigation/BottomNavigation";
import { useTreatment } from "@/shared/context/TreatmentContext";

export default function CreatePlanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    setExtractedText,
    setItems,
    setTreatmentTimeline,
    setEstimatedOverallJourney,
    setTotalAmount,
  } = useTreatment();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, JPG, PNG, or WEBP file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError("");
  }

  function removeSelectedFile() {
    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleAnalyzePlan() {
    if (!selectedFile && !manualText.trim()) {
      setError("Please upload a treatment plan or enter treatment text.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError("");

      const formData = new FormData();

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("text", manualText.trim());
      }

      const response = await fetch("/api/extract-plan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to analyze treatment plan."
        );
      }

      setExtractedText(result.text || manualText.trim() || "");
      setItems(result.items || []);
      setTreatmentTimeline(result.treatmentTimeline || []);
      setEstimatedOverallJourney(
        result.estimatedOverallJourney || null
      );
      setTotalAmount(result.totalAmount || 0);

      router.push("/review-plan");
    } catch (err) {
      console.error("Analyze treatment plan error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze treatment plan."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#D4E0DF] flex flex-col">
      <section className="flex-1 px-6 pt-12 pb-10">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-4xl text-[#476973]">
            Create Plan
          </h1>

          <p className="mt-3 text-[#476973]/75">
            Upload your dental treatment plan and let CareFlow organize
            your treatment journey.
          </p>
        </header>

        <div className="rounded-[36px] bg-[#F8FBFA] p-6 shadow-sm">
          <div className="rounded-3xl bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF4F3] text-[#476973]">
                <FileText size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#476973]">
                  Upload Treatment Plan
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#476973]/65">
                  Upload the treatment plan provided by your dental
                  clinic.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="mt-6 flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#AFC3C0] bg-[#F8FBFA] px-5 py-10 text-[#476973] transition hover:bg-[#EEF4F3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={32} />

                <p className="mt-3 font-semibold">
                  Choose treatment plan
                </p>

                <p className="mt-1 text-xs text-[#476973]/60">
                  PDF, JPG, PNG or WEBP
                </p>
              </button>
            ) : (
              <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-[#EEF4F3] p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText
                    size={22}
                    className="shrink-0 text-[#476973]"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#476973]">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-[#476973]/60">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedFile}
                  disabled={isAnalyzing}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#476973] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Remove selected file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#C8D5D3]" />

            <span className="text-xs font-semibold uppercase tracking-wider text-[#476973]/50">
              Or
            </span>

            <div className="h-px flex-1 bg-[#C8D5D3]" />
          </div>

          <div className="rounded-3xl bg-white p-5">
            <h2 className="text-lg font-bold text-[#476973]">
              Enter Plan Manually
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#476973]/65">
              You can also paste or type the treatment plan details.
            </p>

            <textarea
              value={manualText}
              onChange={(event) => {
                setManualText(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              disabled={isAnalyzing}
              placeholder={`Example:
Crown - Tooth 16 - 1800 SAR
X-Ray - 200 SAR
Filling - Tooth 16 - 600 SAR`}
              className="mt-5 min-h-44 w-full resize-none rounded-2xl border border-[#C8D5D3] bg-[#F8FBFA] p-4 text-sm leading-6 text-[#476973] outline-none placeholder:text-[#476973]/35 focus:border-[#476973] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleAnalyzePlan}
            disabled={
              isAnalyzing ||
              (!selectedFile && !manualText.trim())
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#476973] py-4 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analyzing Plan...
              </>
            ) : (
              <>
                Analyze Treatment Plan
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}