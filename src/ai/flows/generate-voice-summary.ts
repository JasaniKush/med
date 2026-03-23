'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a spoken summary of a medical report.
 * It takes structured report data and a preferred language, constructs a concise script,
 * and converts it to speech using the Gemini TTS model, returning the audio as a data URI.
 *
 * - generateVoiceSummary - A function that handles the voice summary generation process.
 * - GenerateVoiceSummaryInput - The input type for the generateVoiceSummary function.
 * - GenerateVoiceSummaryOutput - The return type for the generateVoiceSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';
import { Buffer } from 'buffer';

const GenerateVoiceSummaryInputSchema = z.object({
  plainLanguageDiagnosis: z.string().describe('The plain-language diagnosis from the medical report.'),
  medicationSchedule: z.array(
    z.object({
      medicine_name: z.string().describe('Name of the medicine.'),
      dosage: z.string().describe('Dosage instructions.'),
      timing: z.string().describe('Timing instructions for medication.'),
      days: z.string().describe('Number of days or duration for medication.'),
    })
  ).describe('A list of medications with their schedule details.'),
  followUpChecklist: z.array(z.string()).describe('A checklist of follow-up actions.'),
  familySummary: z.string().describe('A one-line summary for family members.'),
  voiceLanguage: z.string().describe('The preferred language for the voice output (e.g., "en", "hi", "gu").'),
});
export type GenerateVoiceSummaryInput = z.infer<typeof GenerateVoiceSummaryInputSchema>;

const GenerateVoiceSummaryOutputSchema = z.object({
  audioDataUri: z.string().describe("Base64 encoded WAV audio data URI of the generated voice summary."),
});
export type GenerateVoiceSummaryOutput = z.infer<typeof GenerateVoiceSummaryOutputSchema>;

/**
 * Converts PCM audio data to WAV format.
 * @param pcmData The PCM audio data as a Buffer.
 * @param channels Number of audio channels (default: 1).
 * @param rate Sample rate (default: 24000 Hz).
 * @param sampleWidth Sample width in bytes (default: 2 for 16-bit).
 * @returns A Promise that resolves with the base64 encoded WAV audio string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// Mapping from language codes to prebuilt voice names for Gemini TTS.
// Note: These are example voice names. Actual available voices and their language support
// should be verified against the Gemini TTS documentation for optimal results.
const VOICE_MAP: { [key: string]: string } = {
  'en': 'Algenib', // Example English voice
  'hi': 'Achernar', // Example Hindi voice
  'gu': 'Rigel',   // Example Gujarati voice
  'mr': 'Vega',    // Example Marathi voice
  'ta': 'Capella', // Example Tamil voice
  'default': 'Algenib', // Fallback voice
};

const generateVoiceSummaryFlow = ai.defineFlow(
  {
    name: 'generateVoiceSummaryFlow',
    inputSchema: GenerateVoiceSummaryInputSchema,
    outputSchema: GenerateVoiceSummaryOutputSchema,
  },
  async (input) => {
    const { plainLanguageDiagnosis, medicationSchedule, followUpChecklist, familySummary, voiceLanguage } = input;

    // 1. Construct a safe and concise voice script.
    // The script prioritizes clarity and safety, reading only explicitly provided information.
    let script = `Hello. Here is a summary of your medical report. `;

    if (plainLanguageDiagnosis && plainLanguageDiagnosis !== "Not clearly mentioned in the document.") {
      script += `Diagnosis: ${plainLanguageDiagnosis}. `;
    }

    if (medicationSchedule && medicationSchedule.length > 0 && medicationSchedule[0].medicine_name !== "Not clearly mentioned in the document.") {
      script += `Regarding your medications, here are the key instructions: `;
      medicationSchedule.forEach(med => {
        // Only include details if they are explicitly mentioned and not fallback values
        const medDetails = [];
        if (med.medicine_name && med.medicine_name !== "Not clearly mentioned in the document.") medDetails.push(med.medicine_name);
        if (med.dosage && med.dosage !== "Not clearly mentioned in the document.") medDetails.push(`dosage: ${med.dosage}`);
        if (med.timing && med.timing !== "Not clearly mentioned in the document.") medDetails.push(`timing: ${med.timing}`);
        if (med.days && med.days !== "Not clearly mentioned in the document.") medDetails.push(`for ${med.days}`);
        if (medDetails.length > 0) {
          script += `${medDetails.join(', ')}. `;
        }
      });
    }

    if (followUpChecklist && followUpChecklist.length > 0 && followUpChecklist[0] !== "Not clearly mentioned in the document.") {
      script += `Important follow-up actions include: `;
      followUpChecklist.forEach(item => {
        if (item && item !== "Not clearly mentioned in the document.") {
          script += `${item}. `;
        }
      });
    }

    if (familySummary && familySummary !== "Not clearly mentioned in the document.") {
      script += `Finally, a one-line summary for your family: ${familySummary}. `;
    }

    script += `Please consult your doctor for any further questions.`;

    // 2. Select TTS Voice based on the requested language.
    const voiceName = VOICE_MAP[voiceLanguage] || VOICE_MAP['default'];

    // 3. Call Genkit TTS Model to generate audio.
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
      prompt: script,
    });

    if (!media || !media.url) {
      throw new Error('No audio media or URL returned from TTS model.');
    }

    // The Gemini TTS model returns raw PCM audio data, base64 encoded within a data URI.
    // We need to extract this and convert it to a standard WAV format.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1), // Extract base64 part
      'base64'
    );

    // 4. Convert PCM to WAV and return as a data URI.
    const wavBase64 = await toWav(audioBuffer);
    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

/**
 * Generates a spoken summary of a medical report based on provided structured data and language.
 *
 * @param input - An object containing the plain-language diagnosis, medication schedule,
 *                follow-up checklist, family summary, and desired voice language.
 * @returns A Promise that resolves to an object containing the base64 encoded WAV audio data URI.
 */
export async function generateVoiceSummary(input: GenerateVoiceSummaryInput): Promise<GenerateVoiceSummaryOutput> {
  return generateVoiceSummaryFlow(input);
}
