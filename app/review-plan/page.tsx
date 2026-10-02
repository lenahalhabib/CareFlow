"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  CalendarRange,
  CheckCircle,
  Clock,
  Pencil,
  Stethoscope,
} from "lucide-react";
import BottomNavigation from "@/shared/components/navigation/BottomNavigation";
import { useTreatment } from "@/shared/context/TreatmentContext";

export default function ReviewPlanPage() {
  const router = useRouter();

  const {
    items,
    treatmentTimeline,
    estimatedOverallJourney,
    totalAmount,
    extractedText,
  } = useTreatment();

  const hasItems = items.length > 0;
  const hasTimeline = treatmentTimeline.length > 0;

  function formatWaitPeriod(
    min: number | null,
    max: number | null,
    unit: "days" | "weeks" | "months" | null
  ) {
    if (!unit || (min === null && max === null)) {
      return null;
    }

    if (min === 0 && max === 0) {
      return "No estimated waiting period";
    }

    if (min !== null && max !== null) {
      if (min === max) {
        return `${min} ${unit}`;
      }

      return `${min}–${max} ${unit}`;
    }

    if (min !== null) {
      return `At least ${min} ${unit}`;
    }

    if (max !== null) {
      return `Up to ${max} ${unit}`;
    }

    return null;
  }

  return (
    <main className="min-h-screen bg-[#D4E0DF] flex flex-col">
      <section className="flex-1 px-4 pt-6 pb-8">
        <header className="mb-6 text-center">
          <h1 className="font-serif text-3xl text-[#476973]">
            Review Plan
          </h1>

          <p className="mt-2 text-sm text-[#476973]/75">
            Understand your treatment sequence, estimated time between
            stages, and overall treatment journey.
          </p>
        </header>

        <div className="rounded-[24px] bg-[#F8FBFA] p-4 shadow-sm">
          {!hasItems ? (
            <div className="rounded-3xl bg-white p-5 text-center">
              <p className="font-semibold text-[#476973]">
                No treatment items found.
              </p>

              {extractedText && (
                <p className="mt-3 text-sm text-[#476973]/70">
                  Text was extracted, but items were not structured
                  correctly.
                </p>
              )}

              <button
                onClick={() => router.push("/create-plan")}
                className="mt-6 w-full rounded-2xl bg-[#476973] py-4 font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {hasTimeline && (
                <section>
                  <div className="text-center">
                    <h2 className="font-serif text-3xl text-[#476973]">
                      Your Treatment Journey
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#476973]/70">
                      CareFlow organized your procedures and estimated
                      the timing between each treatment stage.
                    </p>
                  </div>

                  {estimatedOverallJourney && (
                    <div className="mt-6 rounded-3xl bg-[#476973] p-5 text-white">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                          <CalendarRange size={22} />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white/75">
                            Estimated Overall Journey
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            {estimatedOverallJourney.displayText}
                          </p>

                          {estimatedOverallJourney.hasUnknownIntervals && (
                            <p className="mt-2 text-xs leading-5 text-white/70">
                              Part of the treatment timing requires
                              dentist confirmation.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    {treatmentTimeline.map((timelineStep, index) => {
                      const waitPeriod = formatWaitPeriod(
                        timelineStep.waitAfter.min,
                        timelineStep.waitAfter.max,
                        timelineStep.waitAfter.unit
                      );

                      const hasUnknownWait =
                        timelineStep.waitAfter.min === null &&
                        timelineStep.waitAfter.max === null &&
                        timelineStep.waitAfter.unit === null;

                      return (
                        <div key={`${timelineStep.step}-${index}`}>
                          <div className="rounded-[20px] bg-white p-4 text-[#476973] shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#476973] font-bold text-white">
                                {timelineStep.step}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-base font-bold">
                                  {timelineStep.serviceName}
                                </p>

                                {timelineStep.toothNumber && (
                                  <p className="mt-1 text-xs text-[#476973]/65">
                                    Tooth: {timelineStep.toothNumber}
                                  </p>
                                )}

                                {timelineStep.reason && (
                                  <p className="mt-2 text-xs leading-5 text-[#476973]/75">
                                    {timelineStep.reason}
                                  </p>
                                )}

                                {timelineStep.dependsOn.length > 0 && (
                                  <p className="mt-2 text-[11px] font-medium text-[#476973]/60">
                                    Follows step{" "}
                                    {timelineStep.dependsOn.join(", ")}
                                  </p>
                                )}

                                {timelineStep.requiresDoctorConfirmation && (
                                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#EEF4F3] p-2.5">
                                    <Stethoscope
                                      size={15}
                                      className="mt-0.5 shrink-0"
                                    />

                                    <p className="text-[11px] leading-4 text-[#476973]/80">
                                      Sequence and timing should be
                                      confirmed by your dentist.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {index < treatmentTimeline.length - 1 && (
                            <div className="flex flex-col items-center py-2">
                              <ArrowDown
                                size={18}
                                className="text-[#476973]/50"
                              />

                              {waitPeriod && (
                                <div className="mt-1.5 max-w-sm rounded-xl border border-[#B8C9C6] bg-[#EEF4F3] px-3 py-2 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Clock
                                      size={14}
                                      className="shrink-0 text-[#476973]"
                                    />

                                    <p className="text-xs font-semibold text-[#476973]">
                                      {waitPeriod ===
                                      "No estimated waiting period"
                                        ? waitPeriod
                                        : `Estimated wait: ${waitPeriod}`}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {!waitPeriod && hasUnknownWait && (
                                <div className="mt-1.5 max-w-sm rounded-xl border border-[#B8C9C6] bg-[#EEF4F3] px-3 py-2 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Clock
                                      size={14}
                                      className="shrink-0 text-[#476973]"
                                    />

                                    <p className="text-xs font-semibold text-[#476973]">
                                      Timing requires dentist confirmation
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#B8C9C6] bg-[#EEF4F3] p-4">
                    <p className="text-xs leading-5 text-[#476973]/75">
                      CareFlow provides an AI-generated estimate to help
                      you understand your treatment journey. The final
                      sequence and timing may vary and should be
                      confirmed by your dentist.
                    </p>
                  </div>
                </section>
              )}

              <section className={hasTimeline ? "mt-8" : ""}>
                <h2 className="font-serif text-2xl text-[#476973] text-center">
                  Treatment Plan
                </h2>

                <div className="mt-5 space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-white p-4 text-[#476973]"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-[#476973]"
                        />

                        <div className="flex-1">
                          <p className="text-base font-bold">
                            {item.serviceName}
                          </p>

                          {item.toothNumber && (
                            <p className="mt-1 text-xs text-[#476973]/65">
                              Tooth: {item.toothNumber}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-[#476973]/65">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="font-bold text-sm">
                          {Number(item.totalPrice).toLocaleString()} SAR
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-[#476973] p-4 text-white">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">Total</p>

                    <p className="text-lg font-bold">
                      {Number(totalAmount).toLocaleString()} SAR
                    </p>
                  </div>
                </div>
              </section>

              <button
                onClick={() => router.push("/create-plan")}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#476973] py-3 font-semibold text-[#476973]"
              >
                <Pencil size={18} />
                Edit / Upload Again
              </button>

              <button
                onClick={() => router.push("/hospital/comparison")}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#476973] py-3 font-semibold text-white"
              >
                Compare Hospitals
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}