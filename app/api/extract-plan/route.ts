import { NextRequest, NextResponse } from "next/server";
import {
  extractTreatmentPlanFromFile,
  extractTreatmentPlanFromText,
} from "@/core/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    if (!file && !text) {
      return NextResponse.json(
        { error: "Please upload a file or enter treatment text." },
        { status: 400 }
      );
    }

    const result = file
      ? await extractTreatmentPlanFromFile(file)
      : await extractTreatmentPlanFromText(text || "");

    console.log("NORMALIZED TREATMENT PLAN:");
    console.log(JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      text: text || "",
      patientName: result.patientName,
      clinicName: result.clinicName,
      insurance: result.insurance,
      items: result.items,
      treatmentTimeline: result.treatmentTimeline,
      estimatedOverallJourney: result.estimatedOverallJourney,
      totalAmount: result.totalAmount,
    });
  } catch (error) {
    console.error("Extract plan error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze treatment plan.",
      },
      {
        status: 500,
      }
    );
  }
}