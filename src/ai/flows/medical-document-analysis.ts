'use server';
/**
 * @fileOverview A Genkit flow for analyzing extracted medical document text and generating a structured, patient-friendly report.
 *
 * - medicalDocumentAnalysis - A function that handles the medical document analysis process.
 * - MedicalDocumentAnalysisInput - The input type for the medicalDocumentAnalysis function.
 * - MedicalDocumentAnalysisOutput - The return type for the medicalDocumentAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MedicalDocumentAnalysisInputSchema = z.object({
  extractedText: z
    .string()
    .describe('The extracted text content from a medical document.'),
  patientAge: z
    .number()
    .optional()
    .describe('Optional patient age to provide context for analysis, not for generating medical advice.'),
  outputLanguage: z
    .string()
    .optional()
    .describe('Preferred language for the output text, e.g., "English", "Hindi".'),
});
export type MedicalDocumentAnalysisInput = z.infer<
  typeof MedicalDocumentAnalysisInputSchema
>;

const MedicationScheduleItemSchema = z.object({
  medicine_name: z
    .string()
    .describe(
      'The name of the medication. Use "Not clearly mentioned in the document." if unclear.'
    ),
  dosage: z
    .string()
    .describe(
      'The dosage of the medication (e.g., "50mg", "1 tablet"). Use "Not clearly mentioned in the document." if unclear.'
    ),
  timing: z
    .string()
    .describe(
      'The timing for taking the medication (e.g., "once daily", "after meals"). Use "Not clearly mentioned in the document." if unclear.'
    ),
  days: z
    .string()
    .describe(
      'The duration or specific days for taking the medication (e.g., "for 7 days", "daily"). Use "Not clearly mentioned in the document." if unclear.'
    ),
});

const ComparisonItemSchema = z.object({
  original: z.string().describe('The original phrase or sentence from the document.'),
  simple: z.string().describe('The simplified, patient-friendly explanation of the original phrase.'),
});

const MedicalDocumentAnalysisOutputSchema = z.object({
  plain_language_diagnosis: z
    .string()
    .describe(
      'A clear, concise, and simple explanation of the diagnosis mentioned in the document. If no diagnosis is clearly stated, use "Not clearly mentioned in the document.".'
    ),
  medication_schedule: z
    .array(MedicationScheduleItemSchema)
    .describe(
      'A list of medications with their dosage, timing, and days, strictly as stated in the document. If no medication schedule is found, return an empty array.'
    ),
  side_effect_alerts: z
    .array(z.string())
    .describe(
      'A list of side effects explicitly mentioned in the document for any prescribed medications or treatments. If none are mentioned, return an empty array.'
    ),
  follow_up_checklist: z
    .array(z.string())
    .describe(
      'A list of actionable follow-up instructions or appointments mentioned in the document. If none are mentioned, return an empty array.'
    ),
  family_summary: z
    .string()
    .describe(
      'A single, concise sentence summarizing the most important points for a family member to understand. If not clearly derivable, use "Not clearly mentioned in the document.".'
    ),
  comparison: z
    .array(ComparisonItemSchema)
    .describe(
      'A comparison of key original medical terms or phrases from the document with their simplified explanations. If no comparisons can be made, return an empty array.'
    ),
});
export type MedicalDocumentAnalysisOutput = z.infer<
  typeof MedicalDocumentAnalysisOutputSchema
>;

export async function medicalDocumentAnalysis(
  input: MedicalDocumentAnalysisInput
): Promise<MedicalDocumentAnalysisOutput> {
  return medicalDocumentAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medbuddyMedicalDocumentAnalysisPrompt',
  input: { schema: MedicalDocumentAnalysisInputSchema },
  output: { schema: MedicalDocumentAnalysisOutputSchema },
  prompt: `You are MedBuddy, an AI-powered medical document summarizer. Your goal is to simplify complex medical information for patients and their families, strictly adhering to safety rules.\n\nIMPORTANT SAFETY RULES:\n1.  ONLY use information directly present in the provided medical document text. DO NOT introduce any external medical knowledge, advice, or interpretations.\n2.  DO NOT suggest alternative medicines, treatments, or healthcare providers.\n3.  DO NOT guess or infer any unclear dosage, timing, or instructions. If any information for medication_schedule, plain_language_diagnosis, or family_summary is ambiguous or not explicitly stated, you MUST return the exact phrase: "Not clearly mentioned in the document." for that specific field or part of the field (e.g., medicine_name, dosage).\n4.  The medication schedule MUST be faithfully extracted from the original document. Any deviation from the original dosage, timing, or days is a critical safety failure.\n5.  If side effects, follow-up instructions, or comparisons are not explicitly mentioned in the document, you MUST return an empty array ([]) for 'side_effect_alerts', 'follow_up_checklist', and 'comparison'. DO NOT hallucinate or infer them.\n6.  Ensure all generated information is patient-friendly and easy to understand without altering the doctor's original instructions or medical intent.\n7.  The patient's age (if provided) and preferred output language (if provided) are for contextual understanding to tailor the simplicity and language, but NEVER for generating medical advice or altering documented facts.\n\nBased on the following medical document text:\n\nExtracted Document Text:\n"""\n{{{extractedText}}}\n"""\n\n{{#if patientAge}}\nPatient's Age: {{{patientAge}}} years old.\n{{/if}}\n\n{{#if outputLanguage}}\nPreferred Output Language: {{{outputLanguage}}}. Generate the summary in this language if possible, otherwise use English.\n{{/if}}\n\nPlease extract and summarize the information into a structured JSON output according to the schema provided.\nRemember to be extremely strict with the safety rules and use the exact fallback phrase "Not clearly mentioned in the document." for any unclear or missing string data, and empty arrays for unclear or missing list data.`,
});

const medicalDocumentAnalysisFlow = ai.defineFlow(
  {
    name: 'medicalDocumentAnalysisFlow',
    inputSchema: MedicalDocumentAnalysisInputSchema,
    outputSchema: MedicalDocumentAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // The prompt is designed to return strict JSON,
    // so we can directly return the output.
    // The validation layer will handle any missing fields with fallbacks.
    return output!;
  }
);
