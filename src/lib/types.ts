import type { MedicalDocumentAnalysisOutput } from "@/ai/flows/medical-document-analysis";

export type Report = MedicalDocumentAnalysisOutput;

export type Language = {
  value: string;
  label: string;
};
