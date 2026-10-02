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
      <section className="flex-1 px-6 pt-12 pb-10">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-4xl text-[#476973]">
            Review Plan
          </h1>

          <p className="mt-3 text-[#476973]/75">
            Understand your treatment sequence, estimated time between
            stages, and overall treatment journey.
          </p>
        </header>

        <div className="rounded-[36px] bg-[#F8FBFA] p-6 shadow-sm">
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

                  <div className="mt-8">
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
                          <div className="rounded-3xl bg-white p-5 text-[#476973] shadow-sm">
                            <div className="flex items-start gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#476973] font-bold text-white">
                                {timelineStep.step}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-lg font-bold">
                                  {timelineStep.serviceName}
                                </p>

                                {timelineStep.toothNumber && (
                                  <p className="mt-1 text-sm text-[#476973]/65">
                                    Tooth: {timelineStep.toothNumber}
                                  </p>
                                )}

                                {timelineStep.reason && (
                                  <p className="mt-3 text-sm leading-6 text-[#476973]/75">
                                    {timelineStep.reason}
                                  </p>
                                )}

                                {timelineStep.dependsOn.length > 0 && (
                                  <p className="mt-3 text-xs font-medium text-[#476973]/60">
                                    Follows step{" "}
                                    {timelineStep.dependsOn.join(", ")}
                                  </p>
                                )}

                                {timelineStep.requiresDoctorConfirmation && (
                                  <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#EEF4F3] p-3">
                                    <Stethoscope
                                      size={17}
                                      className="mt-0.5 shrink-0"
                                    />

                                    <p className="text-xs leading-5 text-[#476973]/80">
                                      Sequence and timing should be
                                      confirmed by your dentist.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {index < treatmentTimeline.length - 1 && (
                            <div className="flex flex-col items-center py-3">
                              <ArrowDown
                                size={20}
                                className="text-[#476973]/50"
                              />

                              {waitPeriod && (
                                <div className="mt-2 max-w-sm rounded-2xl border border-[#B8C9C6] bg-[#EEF4F3] px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Clock
                                      size={16}
                                      className="shrink-0 text-[#476973]"
                                    />

                                    <p className="text-sm font-semibold text-[#476973]">
                                      {waitPeriod ===
                                      "No estimated waiting period"
                                        ? waitPeriod
                                        : `Estimated wait: ${waitPeriod}`}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {!waitPeriod && hasUnknownWait && (
                                <div className="mt-2 max-w-sm rounded-2xl border border-[#B8C9C6] bg-[#EEF4F3] px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Clock
                                      size={16}
                                      className="shrink-0 text-[#476973]"
                                    />

                                    <p className="text-sm font-semibold text-[#476973]">
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

              <section className={hasTimeline ? "mt-10" : ""}>
                <h2 className="font-serif text-3xl text-[#476973] text-center">
                  Treatment Plan
                </h2>

                <div className="mt-8 space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-3xl bg-white p-5 text-[#476973]"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle
                          size={24}
                          className="mt-1 shrink-0 text-[#476973]"
                        />

                        <div className="flex-1">
                          <p className="text-lg font-bold">
                            {item.serviceName}
                          </p>

                          {item.toothNumber && (
                            <p className="mt-1 text-sm text-[#476973]/65">
                              Tooth: {item.toothNumber}
                            </p>
                          )}

                          <p className="mt-1 text-sm text-[#476973]/65">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="font-bold">
                          {Number(item.totalPrice).toLocaleString()} SAR
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl bg-[#476973] p-5 text-white">
                  <div className="flex justify-between">
                    <p className="text-xl font-bold">Total</p>

                    <p className="text-xl font-bold">
                      {Number(totalAmount).toLocaleString()} SAR
                    </p>
                  </div>
                </div>
              </section>

              <button
                onClick={() => router.push("/create-plan")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#476973] py-4 font-semibold text-[#476973]"
              >
                <Pencil size={20} />
                Edit / Upload Again
              </button>

              <button
                onClick={() => router.push("/hospital/comparison")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#476973] py-4 font-semibold text-white"
              >
                Compare Hospitals
                <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}