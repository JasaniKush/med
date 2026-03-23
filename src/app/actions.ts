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

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

async function fileToDataUri(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
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

  // File type validation
  if (!ALLOWED_FILE_TYPES.includes(documentFile.type)) {
      return { status: 'error', message: 'Invalid file format. Please upload a valid PDF, JPG, or PNG file.' };
  }

  // File size validation
  if (documentFile.size > MAX_FILE_SIZE) {
      return { status: 'error', message: 'File size exceeds the 5MB limit.' };
  }

  try {
    // Step 1: Convert file to data URI
    const documentDataUri = await fileToDataUri(documentFile);

    // Step 2: Analyze the document with the first AI flow
    const analysisResult = await medicalDocumentAnalysis({
      documentDataUri,
      patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
      outputLanguage,
    });
    
    // Check if OCR failed
    if (analysisResult.extracted_text === "Could not extract text from the document.") {
        return { status: 'error', message: 'Unable to read document clearly. Please try a different file.' };
    }

    // Step 3: Generate voice summary with the second AI flow
    const hasSufficientDataForAudio = analysisResult.voice_script && analysisResult.voice_script.trim() !== '' && analysisResult.voice_script !== "Not clearly mentioned in the document.";
    
    let audioDataUri = "";
    if (hasSufficientDataForAudio) {
        const voiceResult = await generateVoiceSummary({
            script: analysisResult.voice_script,
            voiceLanguage,
        });
        audioDataUri = voiceResult.audioDataUri;
    }

    // Step 4: Return the successful state with all data
    return {
      status: 'success',
      report: analysisResult,
      extractedText: analysisResult.extracted_text, // Use cleaned text from AI
      audioDataUri,
    };

  } catch (error) {
    console.error("Error generating report:", error);
    return { status: 'error', message: 'An unexpected error occurred while processing your document. The AI service may be temporarily unavailable.' };
  }
}
