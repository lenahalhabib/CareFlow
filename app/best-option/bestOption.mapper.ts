import type {
  ExtractedPlanItem,
  EstimatedOverallJourney,
  TreatmentTimelineStep,
} from "@/shared/context/TreatmentContext";

import type {
  SaveTreatmentPlanInput,
} from "@/services/plan/plan.types";

import {
  buildHospitalComparison,
} from "@/shared/utils/hospitalComparison";

import {
  SCORE_WEIGHT_PERCENTAGES,
} from "@/shared/utils/hospitalScoring";

export type ComparisonResult =
  ReturnType<
    typeof buildHospitalComparison
  >[number];

type BuildSavePlanInputParams = {
  extractedText: string;
  totalAmount: number;
  items: ExtractedPlanItem[];

  treatmentTimeline:
    TreatmentTimelineStep[];

  estimatedOverallJourney:
    EstimatedOverallJourney | null;

  comparisonResults:
    ComparisonResult[];
};

function formatAmount(
  amount: number
): string {
  return Math.round(
    Number(amount || 0)
  ).toLocaleString();
}

function createPriceMessage(
  bestOption: ComparisonResult
): string {
  const priceDifference =
    Math.abs(
      Number(bestOption.savings || 0)
    );

  if (bestOption.savings > 0) {
    return (
      `وتوفر تقريبًا ${formatAmount(
        priceDifference
      )} ريال مقارنة بالخطة الأصلية`
    );
  }

  if (bestOption.savings < 0) {
    return (
      `وتزيد عن الخطة الأصلية بحوالي ${formatAmount(
        priceDifference
      )} ريال`
    );
  }

  return (
    "وتساوي تكلفة الخطة الأصلية تقريبًا"
  );
}

export function createRecommendationReason(
  bestOption: ComparisonResult,
  totalItems: number
): string {
  const matchedServices =
    Number(
      bestOption.matchedServices || 0
    );

  const finalScore =
    Math.round(
      bestOption.finalScore
    );

  const completenessScore =
    Math.round(
      bestOption.completenessScore
    );

  const costScore =
    Math.round(
      bestOption.costScore
    );

  const qualityScore =
    Math.round(
      bestOption.qualityScore
    );

  const hospitalRating =
    Number(
      bestOption.hospital.rating || 0
    );

  const priceMessage =
    createPriceMessage(bestOption);

  return (
    `نوصي بـ ${bestOption.hospital.name} لأنه حقق أعلى ` +
    `نتيجة إجمالية بين المستشفيات بنسبة ${finalScore}%. ` +
    `تعتمد النتيجة على ثلاثة معايير متساوية: ` +
    `اكتمال خطة العلاج، تكلفة العلاج، وتقييم المستشفى. ` +
    `تمت مطابقة ${matchedServices} من أصل ${totalItems} ` +
    `خدمات علاجية، بدرجة اكتمال ${completenessScore}%. ` +
    `بلغت التكلفة التقديرية ${formatAmount(
      bestOption.total
    )} ريال، ${priceMessage}، ` +
    `وحصلت على درجة تكلفة ${costScore}%. ` +
    `كما حصل المستشفى على تقييم ${hospitalRating} من 5، ` +
    `بدرجة تقييم ${qualityScore}%. ` +
    `لا يؤثر التأمين أو الاعتماد على ترتيب المستشفيات، ` +
    `ويتم عرضهما كمعلومات إضافية فقط.`
  );
}

function buildServiceBreakdown(
  result: ComparisonResult
) {
  return result.matchedItems.map(
    (matchedItem) => ({
      service_name:
        matchedItem.originalName,

      matched_service_name:
        matchedItem.serviceName,

      quantity: Number(
        matchedItem.quantity || 1
      ),

      unit_price: Number(
        matchedItem.unitPrice || 0
      ),

      total_price: Number(
        matchedItem.totalPrice || 0
      ),

      matched: true,
    })
  );
}

function buildScoreBreakdown(
  result: ComparisonResult
) {
  return {
    treatment_completeness:
      Number(
        result.completenessScore || 0
      ),

    cost_score:
      Number(
        result.costScore || 0
      ),

    quality_score:
      Number(
        result.qualityScore || 0
      ),

    treatment_completeness_weight:
      SCORE_WEIGHT_PERCENTAGES
        .completeness,

    cost_weight:
      SCORE_WEIGHT_PERCENTAGES.cost,

    quality_weight:
      SCORE_WEIGHT_PERCENTAGES.rating,

    /*
     * بيانات التأمين محفوظة للعرض المالي فقط.
     * لا تدخل في finalScore أو ترتيب المستشفيات.
     */
    insurance_compatibility:
      Number(
        result.insuranceCompatibility ||
          0
      ),

    insurance_covered_amount:
      Number(
        result.insuranceCoveredAmount ||
          0
      ),

    patient_amount:
      Number(
        result.patientAmount || 0
      ),
  };
}

export function buildSaveTreatmentPlanInput({
  extractedText,
  totalAmount,
  items,
  treatmentTimeline,
  estimatedOverallJourney,
  comparisonResults,
}: BuildSavePlanInputParams): SaveTreatmentPlanInput {
  const bestOption =
    comparisonResults[0];

  if (!bestOption) {
    throw new Error(
      "Best hospital option is missing"
    );
  }

  const recommendationReason =
    createRecommendationReason(
      bestOption,
      items.length
    );

  return {
    title: `Treatment Plan - ${new Date().toLocaleDateString(
      "en-GB"
    )}`,

    originalFileName: null,

    extractedText,

    treatmentTimeline,

    estimatedOverallJourney,

    totalAmount:
      Number(totalAmount || 0),

    items: items.map((item) => ({
      service_name:
        item.serviceName,

      quantity:
        Number(item.quantity || 1),

      unit_price:
        Number(item.unitPrice || 0),

      total_price:
        Number(item.totalPrice || 0),
    })),

    hospitalResults:
      comparisonResults.map(
        (result, index) => {
          const isBestOption =
            index === 0;

          return {
            hospital_id:
              result.hospital.id,

            hospital_name:
              result.hospital.name,

            location:
              result.hospital.location ??
              null,

            accreditation:
              result.hospital
                .accreditation ?? null,

            rating:
              result.hospital.rating ===
                null ||
              result.hospital.rating ===
                undefined
                ? null
                : Number(
                    result.hospital
                      .rating
                  ),

            guarantee_days:
              result.hospital
                .guarantee_days ===
                  null ||
              result.hospital
                .guarantee_days ===
                  undefined
                ? null
                : Number(
                    result.hospital
                      .guarantee_days
                  ),

            total_price:
              Number(
                result.total || 0
              ),

            savings:
              Number(
                result.savings || 0
              ),

            matched_services_count:
              Number(
                result.matchedServices ||
                  0
              ),

            total_services_count:
              items.length,

            score:
              Number(
                result.finalScore || 0
              ),

            ranking:
              index + 1,

            is_best_option:
              isBestOption,

            recommendation_reason:
              isBestOption
                ? recommendationReason
                : null,

            service_breakdown:
              buildServiceBreakdown(
                result
              ),

            score_breakdown:
              buildScoreBreakdown(
                result
              ),
          };
        }
      ),

    bestHospitalId:
      bestOption.hospital.id,

    bestHospitalName:
      bestOption.hospital.name,

    bestOptionReason:
      recommendationReason,

    analysisVersion:
      "v3-equal-criteria",
  };
}