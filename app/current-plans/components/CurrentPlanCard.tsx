"use client";

import {
  useState,
} from "react";

import {
  BadgeCheck,
  CheckCircle,
  MapPin,
  MoreVertical,
  Star,
  Trash2,
  Trophy,
  Wallet,
} from "lucide-react";

import type {
  HospitalResult,
  TreatmentPlan,
} from "@/services/plan/plan.types";

type CurrentPlanCardProps = {
  plan: TreatmentPlan;
  fallbackTitle: string;
  onDelete: () => void;
};

function formatAmount(
  value: number
): string {
  return Math.round(
    Number(value || 0)
  ).toLocaleString();
}

function getCompletenessText(
  hospital: HospitalResult
): string {
  const matchedServices =
    Number(
      hospital.matched_services_count ||
        0
    );

  const totalServices =
    Number(
      hospital.total_services_count ||
        0
    );

  return `${matchedServices}/${totalServices}`;
}

function formatPlanDate(
  date: string
): string {
  return new Date(
    date
  ).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function buildRecommendationPoints(
  hospital: HospitalResult
): string[] {
  const matchedServices =
    Number(
      hospital.matched_services_count ||
        0
    );

  const totalServices =
    Number(
      hospital.total_services_count ||
        0
    );

  const savings =
    Number(
      hospital.savings || 0
    );

  const rating =
    hospital.rating === null
      ? null
      : Number(hospital.rating);

  const points: string[] = [];

  if (
    totalServices > 0 &&
    matchedServices === totalServices
  ) {
    points.push(
      "جميع خدمات الخطة العلاجية متوفرة في المستشفى."
    );
  } else if (totalServices > 0) {
    points.push(
      `يوفر المستشفى ${matchedServices} من أصل ${totalServices} خدمات علاجية.`
    );
  }

  if (savings > 0) {
    points.push(
      `يوفر حوالي ${formatAmount(
        savings
      )} ريال مقارنة بالخطة الأصلية.`
    );
  } else if (savings < 0) {
    points.push(
      `تكلفته أعلى من الخطة الأصلية بحوالي ${formatAmount(
        Math.abs(savings)
      )} ريال، لكنه حقق أفضل توازن بين الخيارات.`
    );
  } else {
    points.push(
      "تكلفته قريبة من تكلفة الخطة الأصلية."
    );
  }

  if (rating !== null) {
    points.push(
      `حصل المستشفى على تقييم ${rating} من 5.`
    );
  }

  return points;
}

export default function CurrentPlanCard({
  plan,
  fallbackTitle,
  onDelete,
}: CurrentPlanCardProps) {
  const [
    menuOpened,
    setMenuOpened,
  ] = useState(false);

  const items =
    plan.treatment_plan_items ??
    [];

  const bestHospital =
    plan.plan_hospital_results?.find(
      (result) =>
        result.is_best_option
    );

  const finalScore =
    Number(
      bestHospital?.score ?? 0
    );

  const recommendationPoints =
    bestHospital
      ? buildRecommendationPoints(
          bestHospital
        )
      : [];

  function handleDelete() {
    setMenuOpened(false);
    onDelete();
  }

  return (
    <article className="relative rounded-[32px] border border-white bg-[#F8FBFA] p-7 shadow-md">
      <div className="absolute right-4 top-4 z-30">
        <button
          type="button"
          aria-label="Open plan options"
          onClick={() =>
            setMenuOpened(
              (current) =>
                !current
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#365863] shadow-sm transition hover:bg-white"
        >
          <MoreVertical size={21} />
        </button>

        {menuOpened && (
          <div className="absolute right-0 top-12 w-44 overflow-hidden rounded-2xl border border-[#D4E0DF] bg-white shadow-xl">
            <button
              type="button"
              onClick={
                handleDelete
              }
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={17} />
              Delete Plan
            </button>
          </div>
        )}
      </div>

      <div className="mb-7 rounded-3xl bg-[#365863] px-12 py-5 text-center">
        <h2 className="font-serif text-3xl text-white">
          {plan.title ||
            fallbackTitle}
        </h2>

        {plan.created_at && (
          <p className="mt-2 text-sm text-white/75">
            {formatPlanDate(
              plan.created_at
            )}
          </p>
        )}
      </div>

      <section>
        <h3 className="font-serif text-2xl text-[#365863]">
          Treatment Details
        </h3>

        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-[#365863]/70">
              No services added.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 text-[#365863]"
              >
                <div>
                  <p className="text-[18px] leading-6">
                    {
                      item.service_name
                    }
                  </p>

                  {item.quantity >
                    1 && (
                    <p className="mt-1 text-sm text-[#365863]/60">
                      Quantity:{" "}
                      {item.quantity}
                    </p>
                  )}
                </div>

                <p className="whitespace-nowrap text-[18px] font-bold">
                  {formatAmount(
                    item.total_price
                  )}{" "}
                  SAR
                </p>
              </div>
            ))
          )}
        </div>

        <div className="my-6 h-px bg-[#C8D2D0]" />

        <div className="flex justify-between gap-4 text-[#365863]">
          <p className="text-xl font-bold">
            Original Plan Total
          </p>

          <p className="text-xl font-bold">
            {formatAmount(
              plan.total_amount
            )}{" "}
            SAR
          </p>
        </div>

        {plan.estimated_overall_journey?.displayText && (
          <>
            <div className="my-6 h-px bg-[#C8D2D0]" />

            <div className="flex items-center justify-between gap-4 text-[#365863]">
              <p className="text-xl font-bold">
                Estimated Treatment Duration
              </p>

              <p className="text-xl font-bold">
                {
                  plan
                    .estimated_overall_journey
                    .displayText
                }
              </p>
            </div>
          </>
        )}
      </section>

      {bestHospital ? (
        <section className="mt-8 overflow-hidden rounded-[30px] bg-[#E4ECEA] text-[#365863]">
          <div className="bg-[#365863] px-5 py-6 text-center text-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <Trophy size={28} />
            </div>

            <p className="mt-3 text-sm text-white/75">
              Best Hospital
            </p>

            <h3 className="mt-1 font-serif text-3xl">
              {
                bestHospital.hospital_name
              }
            </h3>

            {bestHospital.location && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-white/80">
                <MapPin size={16} />
                {
                  bestHospital.location
                }
              </p>
            )}

            {bestHospital.accreditation && (
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-white/75">
                <BadgeCheck size={16} />
                {
                  bestHospital.accreditation
                }
              </p>
            )}

            <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-[#365863]">
              Match Score ·{" "}
              {Math.round(
                finalScore
              )}
              %
            </span>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-white p-3">
                <CheckCircle
                  size={18}
                  className="mx-auto"
                />

                <p className="mt-1 font-bold">
                  {getCompletenessText(
                    bestHospital
                  )}
                </p>

                <p className="text-xs text-[#365863]/60">
                  Completeness
                </p>
              </div>

              <div className="rounded-2xl bg-white p-3">
                <Star
                  size={18}
                  className="mx-auto"
                />

                <p className="mt-1 font-bold">
                  {bestHospital.rating ??
                    "-"}
                  /5
                </p>

                <p className="text-xs text-[#365863]/60">
                  Rating
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#365863]/65">
                    Hospital Total
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatAmount(
                      bestHospital.total_price
                    )}{" "}
                    SAR
                  </p>
                </div>

                <Wallet size={28} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-sm text-[#365863]/65">
                {bestHospital.savings >= 0
                  ? "Estimated Savings"
                  : "Additional Cost"}
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatAmount(
                  Math.abs(
                    bestHospital.savings
                  )
                )}{" "}
                SAR
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <h4 className="font-serif text-xl">
                لماذا نوصي بهذا المستشفى؟
              </h4>

              <ul
                dir="rtl"
                className="mt-4 space-y-3 text-right text-[#365863]/80"
              >
                {recommendationPoints.map(
                  (point, index) => (
                    <li
                      key={`${point}-${index}`}
                      className="flex items-start justify-end gap-2"
                    >
                      <span className="leading-7">
                        {point}
                      </span>

                      <CheckCircle
                        size={17}
                        className="mt-1 shrink-0 text-[#476973]"
                      />
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <div className="mt-7 rounded-3xl bg-yellow-50 p-5 text-center text-yellow-800">
          Hospital information is not
          available for this plan.
        </div>
      )}
    </article>
  );
}