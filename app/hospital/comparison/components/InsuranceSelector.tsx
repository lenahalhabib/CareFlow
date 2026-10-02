"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";

import type {
  InsuranceOption,
} from "@/shared/utils/hospitalScoring";

type InsuranceSelectorProps = {
  options: InsuranceOption[];
};

function formatAmount(
  amount: number
): string {
  return Math.round(
    Number(amount || 0)
  ).toLocaleString();
}

function formatPlanType(
  planType: InsuranceOption["planType"]
): string {
  return (
    planType.charAt(0).toUpperCase() +
    planType.slice(1).toLowerCase()
  );
}

export default function InsuranceSelector({
  options,
}: InsuranceSelectorProps) {
  const [
    opened,
    setOpened,
  ] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl bg-[#E4ECEA]">
      <button
        type="button"
        onClick={() =>
          setOpened(
            (current) => !current
          )
        }
        aria-expanded={opened}
        className="flex w-full items-center justify-between gap-3 p-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck
            size={18}
            className="text-[#476973]"
          />

          <div>
            <p className="text-sm font-semibold text-[#476973]">
              Insurance Options
            </p>

            <p className="mt-0.5 text-xs text-[#476973]/60">
              Estimated financial
              coverage
            </p>
          </div>
        </div>

        {opened ? (
          <ChevronUp
            size={18}
            className="text-[#476973]"
          />
        ) : (
          <ChevronDown
            size={18}
            className="text-[#476973]"
          />
        )}
      </button>

      {opened && (
        <div className="border-t border-[#CAD8D5] p-3">
          <p className="mb-4 text-xs leading-5 text-[#476973]/60">
            Insurance estimates are
            displayed for financial
            guidance only and do not
            affect hospital ranking.
          </p>

          {options.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-[#476973]/70">
              Insurance data is not
              available.
            </p>
          ) : (
            <div className="space-y-3">
              {options.map(
                (option) => (
                  <div
                    key={option.companyId}
                    className="rounded-2xl bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#476973]">
                          {
                            option.companyName
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#476973]/60">
                          {formatPlanType(
                            option.planType
                          )}{" "}
                          Plan
                        </p>
                      </div>

                      <p className="text-sm font-bold text-[#476973]">
                        {Math.round(
                          option.compatibilityPercentage
                        )}
                        % coverage
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#F8FBFA] p-3">
                        <p className="text-xs text-[#476973]/60">
                          Insurance Covers
                        </p>

                        <p className="mt-1 font-bold text-[#476973]">
                          {formatAmount(
                            option.coveredAmount
                          )}{" "}
                          SAR
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F8FBFA] p-3 text-right">
                        <p className="text-xs text-[#476973]/60">
                          You Pay
                        </p>

                        <p className="mt-1 font-bold text-[#476973]">
                          {formatAmount(
                            option.patientAmount
                          )}{" "}
                          SAR
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}