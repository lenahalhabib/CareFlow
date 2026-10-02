import { GoogleGenAI } from "@google/genai";
import { EXTRACT_PLAN_PROMPT } from "./prompts";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export type ExtractedPlanItem = {
  serviceName: string;
  toothNumber: string;
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

export type ExtractedTreatmentPlan = {
  patientName: string;
  clinicName: string;
  insurance: string;
  items: ExtractedPlanItem[];
  treatmentTimeline: TreatmentTimelineStep[];
  estimatedOverallJourney: EstimatedOverallJourney;
  totalAmount: number;
};

function cleanJsonResponse(value: string) {
  return value
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function convertToDays(
  value: number,
  unit: "days" | "weeks" | "months"
): number {
  switch (unit) {
    case "days":
      return value;

    case "weeks":
      return value * 7;

    case "months":
      return value * 30;

    default:
      return value;
  }
}

function formatJourneyDuration(minDays: number, maxDays: number): string {
  if (minDays === 0 && maxDays === 0) {
    return "No significant waiting period estimated";
  }

  if (maxDays < 14) {
    if (minDays === maxDays) {
      return `Approximately ${minDays} day${minDays === 1 ? "" : "s"}`;
    }

    return `Approximately ${minDays}–${maxDays} days`;
  }

  if (maxDays < 60) {
    const minWeeks = Math.max(1, Math.round(minDays / 7));
    const maxWeeks = Math.max(1, Math.round(maxDays / 7));

    if (minWeeks === maxWeeks) {
      return `Approximately ${minWeeks} week${minWeeks === 1 ? "" : "s"}`;
    }

    return `Approximately ${minWeeks}–${maxWeeks} weeks`;
  }

  const minMonths = Math.max(1, Math.round(minDays / 30));
  const maxMonths = Math.max(1, Math.round(maxDays / 30));

  if (minMonths === maxMonths) {
    return `Approximately ${minMonths} month${minMonths === 1 ? "" : "s"}`;
  }

  return `Approximately ${minMonths}–${maxMonths} months`;
}

function calculateOverallJourney(
  timeline: TreatmentTimelineStep[]
): EstimatedOverallJourney {
  let minDays = 0;
  let maxDays = 0;
  let hasUnknownIntervals = false;

  timeline.forEach((timelineStep, index) => {
    if (index === timeline.length - 1) {
      return;
    }

    const { min, max, unit } = timelineStep.waitAfter;

    if (min === null || max === null || unit === null) {
      hasUnknownIntervals = true;
      return;
    }

    minDays += convertToDays(min, unit);
    maxDays += convertToDays(max, unit);
  });

  let displayText = formatJourneyDuration(minDays, maxDays);

  if (hasUnknownIntervals) {
    displayText += " + additional timing to be confirmed";
  }

  return {
    minDays,
    maxDays,
    displayText,
    hasUnknownIntervals,
  };
}

function normalizePlan(
  plan: Partial<ExtractedTreatmentPlan>
): ExtractedTreatmentPlan {
  const items = Array.isArray(plan.items) ? plan.items : [];

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const totalPrice = Number(item.totalPrice) || unitPrice * quantity;

    return {
      serviceName: item.serviceName || "Dental Service",
      toothNumber: item.toothNumber || "",
      quantity,
      unitPrice,
      totalPrice,
    };
  });

  const timeline = Array.isArray(plan.treatmentTimeline)
    ? plan.treatmentTimeline
    : [];

  const normalizedTimeline: TreatmentTimelineStep[] = timeline.map(
    (timelineStep, index) => {
      const waitAfter = timelineStep.waitAfter || {
        min: null,
        max: null,
        unit: null,
      };

      const validWaitUnits = ["days", "weeks", "months"] as const;

      const normalizedUnit = validWaitUnits.includes(
        waitAfter.unit as (typeof validWaitUnits)[number]
      )
        ? (waitAfter.unit as "days" | "weeks" | "months")
        : null;

      return {
        step: Number(timelineStep.step) || index + 1,

        serviceName:
          timelineStep.serviceName ||
          normalizedItems[index]?.serviceName ||
          "Dental Service",

        toothNumber:
          timelineStep.toothNumber ||
          normalizedItems[index]?.toothNumber ||
          "",

        dependsOn: Array.isArray(timelineStep.dependsOn)
          ? timelineStep.dependsOn
              .map((dependency) => Number(dependency))
              .filter((dependency) => Number.isFinite(dependency))
          : [],

        waitAfter: {
          min:
            waitAfter.min === null || waitAfter.min === undefined
              ? null
              : Number(waitAfter.min),

          max:
            waitAfter.max === null || waitAfter.max === undefined
              ? null
              : Number(waitAfter.max),

          unit: normalizedUnit,
        },

        reason:
          typeof timelineStep.reason === "string"
            ? timelineStep.reason
            : "",

        requiresDoctorConfirmation:
          timelineStep.requiresDoctorConfirmation !== false,
      };
    }
  );

  const calculatedTotal = normalizedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  const estimatedOverallJourney =
    calculateOverallJourney(normalizedTimeline);

  return {
    patientName: plan.patientName || "",
    clinicName: plan.clinicName || "",
    insurance: plan.insurance || "",
    items: normalizedItems,
    treatmentTimeline: normalizedTimeline,
    estimatedOverallJourney,
    totalAmount: Number(plan.totalAmount) || calculatedTotal,
  };
}

export async function extractTreatmentPlanFromText(
  text: string
): Promise<ExtractedTreatmentPlan> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${EXTRACT_PLAN_PROMPT}

Treatment Plan Text:
${text}`,
          },
        ],
      },
    ],
  });

  const cleaned = cleanJsonResponse(response.text || "{}");
  const parsed = JSON.parse(cleaned);

  return normalizePlan(parsed);
}

export async function extractTreatmentPlanFromFile(
  file: File
): Promise<ExtractedTreatmentPlan> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: EXTRACT_PLAN_PROMPT,
          },
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
        ],
      },
    ],
  });

  const cleaned = cleanJsonResponse(response.text || "{}");
  const parsed = JSON.parse(cleaned);

  console.log("GEMINI RAW RESPONSE:", response.text);
  console.log("PARSED PLAN:", parsed);

  return normalizePlan(parsed);
}