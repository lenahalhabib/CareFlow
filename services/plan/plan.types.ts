export type PlanItem = {
  id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type SavePlanItem = {
  service_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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

export type ServiceBreakdownItem = {
  service_name: string;
  matched_service_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  matched?: boolean;
};

export type ScoreBreakdown = Record<
  string,
  number | string | boolean | null
>;

export type HospitalResult = {
  id: string;

  hospital_id: string | null;
  hospital_name: string;

  location: string | null;
  accreditation: string | null;

  rating: number | null;
  guarantee_days: number | null;

  total_price: number;
  savings: number;

  matched_services_count: number;
  total_services_count: number;

  score: number | null;
  ranking: number | null;

  is_best_option: boolean;
  recommendation_reason: string | null;

  service_breakdown: ServiceBreakdownItem[];
  score_breakdown: ScoreBreakdown;
};

export type SaveHospitalResult = Omit<
  HospitalResult,
  "id"
>;

export type TreatmentPlan = {
  id: string;

  title: string;
  total_amount: number;
  status: string;

  original_file_name: string | null;
  extracted_text: string | null;

  treatment_timeline: TreatmentTimelineStep[] | null;
  estimated_overall_journey: EstimatedOverallJourney | null;

  best_hospital_id: string | null;
  best_hospital_name: string | null;
  best_option_reason: string | null;

  analysis_version: string;

  created_at: string;
  updated_at: string | null;

  treatment_plan_items: PlanItem[];
  plan_hospital_results: HospitalResult[];
};

export type TreatmentPlanDetails =
  TreatmentPlan;

export type SaveTreatmentPlanInput = {
  title?: string;

  originalFileName?: string | null;
  extractedText?: string | null;

  treatmentTimeline?: TreatmentTimelineStep[];
  estimatedOverallJourney?: EstimatedOverallJourney | null;

  totalAmount: number;

  items: SavePlanItem[];

  hospitalResults:
    SaveHospitalResult[];

  bestHospitalId?: string | null;
  bestHospitalName?: string | null;
  bestOptionReason?: string | null;

  analysisVersion?: string;
};