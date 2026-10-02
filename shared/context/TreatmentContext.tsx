"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type ExtractedPlanItem = {
  serviceName: string;
  toothNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type TreatmentTimelineStep = {
  step: number;
  serviceName: string;
  toothNumber: string;
  dependsOn: number[];
  waitAfter: {
    min: number | null;
    max: number | null;
    unit: "days" | "weeks" | "months" | null;
  };
  reason: string;
  requiresDoctorConfirmation: boolean;
};

export type EstimatedOverallJourney = {
  minDays: number;
  maxDays: number;
  displayText: string;
  hasUnknownIntervals: boolean;
};

type TreatmentContextType = {
  extractedText: string;
  setExtractedText: (value: string) => void;

  items: ExtractedPlanItem[];
  setItems: (value: ExtractedPlanItem[]) => void;

  treatmentTimeline: TreatmentTimelineStep[];
  setTreatmentTimeline: (value: TreatmentTimelineStep[]) => void;

  estimatedOverallJourney: EstimatedOverallJourney | null;
  setEstimatedOverallJourney: (
    value: EstimatedOverallJourney | null
  ) => void;

  totalAmount: number;
  setTotalAmount: (value: number) => void;

  resetTreatment: () => void;
};

const TreatmentContext = createContext<TreatmentContextType | undefined>(
  undefined
);

export function TreatmentProvider({ children }: { children: ReactNode }) {
  const [extractedText, setExtractedText] = useState("");
  const [items, setItems] = useState<ExtractedPlanItem[]>([]);
  const [treatmentTimeline, setTreatmentTimeline] = useState<
    TreatmentTimelineStep[]
  >([]);

  const [estimatedOverallJourney, setEstimatedOverallJourney] =
    useState<EstimatedOverallJourney | null>(null);

  const [totalAmount, setTotalAmount] = useState(0);

  function resetTreatment() {
    setExtractedText("");
    setItems([]);
    setTreatmentTimeline([]);
    setEstimatedOverallJourney(null);
    setTotalAmount(0);
  }

  return (
    <TreatmentContext.Provider
      value={{
        extractedText,
        setExtractedText,
        items,
        setItems,
        treatmentTimeline,
        setTreatmentTimeline,
        estimatedOverallJourney,
        setEstimatedOverallJourney,
        totalAmount,
        setTotalAmount,
        resetTreatment,
      }}
    >
      {children}
    </TreatmentContext.Provider>
  );
}

export function useTreatment() {
  const context = useContext(TreatmentContext);

  if (!context) {
    throw new Error("useTreatment must be used inside TreatmentProvider");
  }

  return context;
}