import { supabase } from "@/lib/supabase";

import type {
  SaveTreatmentPlanInput,
  TreatmentPlan,
  TreatmentPlanDetails,
} from "./plan.types";

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("User not logged in");
  }

  return user.id;
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

export const planService = {
  async saveTreatmentPlan(
    input: SaveTreatmentPlanInput
  ): Promise<string> {
    const userId =
      await getCurrentUserId();

    if (input.items.length === 0) {
      throw new Error(
        "Treatment plan has no items"
      );
    }

    if (
      input.hospitalResults.length === 0
    ) {
      throw new Error(
        "Hospital comparison results are missing"
      );
    }

    const bestHospital =
      input.hospitalResults.find(
        (hospital) =>
          hospital.is_best_option
      ) ?? input.hospitalResults[0];

    let planId: string | null = null;

    try {
      const {
        data: createdPlan,
        error: planError,
      } = await supabase
        .from("treatment_plans")
        .insert({
          user_id: userId,

          title:
            input.title?.trim() ||
            "Treatment Plan",

          original_file_name:
            input.originalFileName ??
            null,

          extracted_text:
            input.extractedText ??
            null,

          treatment_timeline:
            input.treatmentTimeline ??
            null,

          estimated_overall_journey:
            input.estimatedOverallJourney ??
            null,

          total_amount:
            toNumber(
              input.totalAmount
            ),

          best_hospital_id:
            input.bestHospitalId ??
            bestHospital.hospital_id,

          best_hospital_name:
            input.bestHospitalName ??
            bestHospital.hospital_name,

          best_option_reason:
            input.bestOptionReason ??
            bestHospital
              .recommendation_reason,

          analysis_version:
            input.analysisVersion ??
            "v3-equal-criteria",

          status: "completed",
        })
        .select("id")
        .single();

      if (planError) {
        throw new Error(
          `Failed to save plan: ${planError.message}`
        );
      }

      const createdPlanId =
        createdPlan.id;

      planId = createdPlanId;

      const planItems =
        input.items.map((item) => ({
          plan_id: createdPlanId,

          service_name:
            item.service_name,

          quantity:
            toNumber(
              item.quantity
            ) || 1,

          unit_price:
            toNumber(
              item.unit_price
            ),

          total_price:
            toNumber(
              item.total_price
            ),
        }));

      const {
        error: itemsError,
      } = await supabase
        .from(
          "treatment_plan_items"
        )
        .insert(planItems);

      if (itemsError) {
        throw new Error(
          `Failed to save plan items: ${itemsError.message}`
        );
      }

      const hospitalResults =
        input.hospitalResults.map(
          (hospital, index) => ({
            plan_id:
              createdPlanId,

            hospital_id:
              hospital.hospital_id,

            hospital_name:
              hospital.hospital_name,

            location:
              hospital.location,

            accreditation:
              hospital.accreditation,

            rating:
              hospital.rating === null
                ? null
                : toNumber(
                    hospital.rating
                  ),

            guarantee_days:
              hospital.guarantee_days ===
              null
                ? null
                : toNumber(
                    hospital
                      .guarantee_days
                  ),

            total_price:
              toNumber(
                hospital.total_price
              ),

            savings:
              toNumber(
                hospital.savings
              ),

            matched_services_count:
              toNumber(
                hospital
                  .matched_services_count
              ),

            total_services_count:
              toNumber(
                hospital
                  .total_services_count
              ),

            score:
              hospital.score === null
                ? null
                : toNumber(
                    hospital.score
                  ),

            ranking:
              hospital.ranking ??
              index + 1,

            is_best_option:
              hospital.is_best_option,

            recommendation_reason:
              hospital
                .recommendation_reason,

            service_breakdown:
              hospital
                .service_breakdown ??
              [],

            score_breakdown:
              hospital
                .score_breakdown ??
              {},
          })
        );

      const {
        error: resultsError,
      } = await supabase
        .from(
          "plan_hospital_results"
        )
        .insert(hospitalResults);

      if (resultsError) {
        throw new Error(
          `Failed to save hospital results: ${resultsError.message}`
        );
      }

      return createdPlanId;
    } catch (error) {
      if (planId) {
        await supabase
          .from("treatment_plans")
          .delete()
          .eq("id", planId)
          .eq("user_id", userId);
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Failed to save treatment plan"
      );
    }
  },

  async getCurrentUserPlans(): Promise<
    TreatmentPlan[]
  > {
    const userId =
      await getCurrentUserId();

    const {
      data,
      error,
    } = await supabase
      .from("treatment_plans")
      .select(`
        id,
        title,
        total_amount,
        status,
        original_file_name,
        extracted_text,
        treatment_timeline,
        estimated_overall_journey,
        best_hospital_id,
        best_hospital_name,
        best_option_reason,
        analysis_version,
        created_at,
        updated_at,

        treatment_plan_items (
          id,
          service_name,
          quantity,
          unit_price,
          total_price
        ),

        plan_hospital_results (
          id,
          hospital_id,
          hospital_name,
          location,
          accreditation,
          rating,
          guarantee_days,
          total_price,
          savings,
          matched_services_count,
          total_services_count,
          score,
          ranking,
          is_best_option,
          recommendation_reason,
          service_breakdown,
          score_breakdown
        )
      `)
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load plans: ${error.message}`
      );
    }

    return (
      data ?? []
    ) as TreatmentPlan[];
  },

  async getPlanById(
    planId: string
  ): Promise<TreatmentPlanDetails> {
    const userId =
      await getCurrentUserId();

    const {
      data,
      error,
    } = await supabase
      .from("treatment_plans")
      .select(`
        id,
        title,
        total_amount,
        status,
        original_file_name,
        extracted_text,
        treatment_timeline,
        estimated_overall_journey,
        best_hospital_id,
        best_hospital_name,
        best_option_reason,
        analysis_version,
        created_at,
        updated_at,

        treatment_plan_items (
          id,
          service_name,
          quantity,
          unit_price,
          total_price
        ),

        plan_hospital_results (
          id,
          hospital_id,
          hospital_name,
          location,
          accreditation,
          rating,
          guarantee_days,
          total_price,
          savings,
          matched_services_count,
          total_services_count,
          score,
          ranking,
          is_best_option,
          recommendation_reason,
          service_breakdown,
          score_breakdown
        )
      `)
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(
        `Failed to load plan: ${error.message}`
      );
    }

    const plan =
      data as TreatmentPlanDetails;

    plan.plan_hospital_results = [
      ...(
        plan.plan_hospital_results ??
        []
      ),
    ].sort(
      (
        firstHospital,
        secondHospital
      ) =>
        (
          firstHospital.ranking ??
          999
        ) -
        (
          secondHospital.ranking ??
          999
        )
    );

    return plan;
  },

  async deletePlan(
    planId: string
  ): Promise<void> {
    const userId =
      await getCurrentUserId();

    const {
      error,
    } = await supabase
      .from("treatment_plans")
      .delete()
      .eq("id", planId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(
        `Failed to delete plan: ${error.message}`
      );
    }
  },
};