'use server';
import { medicalDocumentAnalysis } from '@/ai/flows/medical-document-analysis';
import type { MedicalDocumentAnalysisOutput } from '@/ai/flows/medical-document-analysis';
import { generateVoiceSummary } from '@/ai/flows/generate-voice-summary';

export interface InitialState {
  status: 'success' | 'error' | 'idle';
  message?: string;
  report?: MedicalDocumentAnalysisOutput;
  extractedText?: string;
  audioDataUri?: string;
}

// This is a placeholder. In a real app, this would use OCR/PDF parsing.
// The user request specified Tesseract and PyMuPDF which cannot run in this Next.js environment.
// So, we mock the text extraction to allow the AI flows to work.
async function extractTextFromDocument(file: File): Promise<string> {
  // Mocking extraction based on file type for demo purposes
  if (file.type.startsWith('image/')) {
    return `
      Patient Name: Jane Doe
      Date: 2023-10-27

      Diagnosis: Acute Bronchitis

      Prescription:
      1. Azithromycin 500mg - 1 tablet daily for 5 days.
      2. Ibuprofen 400mg - as needed for fever, max 3 times a day.
      3. Dextromethorphan syrup - 10ml every 6 hours for cough.

      Side effects: May cause stomach upset.
      Follow up with Dr. Smith in 1 week if not improving.
    `;
  } else if (file.type === 'application/pdf') {
    return `
      HOSPITAL DISCHARGE SUMMARY

      PATIENT: John Smith
      AGE: 68
      DIAGNOSIS: Myocardial Infarction (Heart Attack)

      TREATMENT:
      - Aspirin 81mg, one tablet daily.
      - Atorvastatin 40mg, one tablet at night.
      - Metoprolol 25mg, twice a day.

      INSTRUCTIONS:
      - Follow up with Cardiology in 2 weeks.
      - Low sodium diet.
      - Monitor blood pressure daily.

      Family Summary: Patient had a heart attack and needs to take new heart medications and change their diet.
      Medical Term: Myocardial Infarction, simple: Heart Attack.
    `;
  }
  return "Could not extract text. This is a mock response.";
}


export async function generateReport(
  prevState: InitialState | null,
  formData: FormData
): Promise<InitialState> {
  const documentFile = formData.get('document') as File;
  const patientAge = formData.get('patientAge') as string;
  const outputLanguage = formData.get('outputLanguage') as string;
  const voiceLanguage = formData.get('voiceLanguage') as string;

  if (!documentFile || documentFile.size === 0) {
    return { status: 'error', message: 'Please upload a valid document.' };
  }

  try {
    // Step 1: Extract text from the document (mocked)
    const extractedText = await extractTextFromDocument(documentFile);
    if (!extractedText) {
      return { status: 'error', message: 'Failed to extract text from the document.' };
    }

    // Step 2: Analyze the document with the first AI flow
    const analysisResult = await medicalDocumentAnalysis({
      extractedText,
      patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
      outputLanguage,
    });
    
    // Step 3: Generate voice summary with the second AI flow
    // A check is added to ensure at least some data exists before generating audio.
    const hasSufficientDataForAudio = analysisResult.plain_language_diagnosis !== "Not clearly mentioned in the document." || analysisResult.medication_schedule.length > 0;
    
    let audioDataUri = "";
    if (hasSufficientDataForAudio) {
        const voiceResult = await generateVoiceSummary({
            plainLanguageDiagnosis: analysisResult.plain_language_diagnosis,
            medicationSchedule: analysisResult.medication_schedule,
            followUpChecklist: analysisResult.follow_up_checklist,
            familySummary: analysisResult.family_summary,
            voiceLanguage,
        });
        audioDataUri = voiceResult.audioDataUri;
    }

    // Step 4: Return the successful state with all data
    return {
      status: 'success',
      report: analysisResult,
      extractedText,
      audioDataUri,
    };

  } catch (error) {
    console.error("Error generating report:", error);
    // This provides a more generic but safe error message to the user.
    return { status: 'error', message: 'An unexpected error occurred while processing your document. The AI service may be temporarily unavailable.' };
  }
}
