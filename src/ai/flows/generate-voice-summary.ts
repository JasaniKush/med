'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a spoken summary of a medical report.
 * It takes a pre-generated script and a preferred language,
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
  script: z.string().describe('The script for the voice summary.'),
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
const VOICE_MAP: { [key: string]: string } = {
  'en': 'Algenib', // English
  'hi': 'Achernar', // Hindi
  'gu': 'Rigel',   // Gujarati
  'mr': 'Vega',    // Marathi
  'ta': 'Capella', // Tamil
  'default': 'Algenib', // Fallback voice
};

const generateVoiceSummaryFlow = ai.defineFlow(
  {
    name: 'generateVoiceSummaryFlow',
    inputSchema: GenerateVoiceSummaryInputSchema,
    outputSchema: GenerateVoiceSummaryOutputSchema,
  },
  async (input) => {
    const { script, voiceLanguage } = input;

    // 1. Select TTS Voice based on the requested language.
    const voiceName = VOICE_MAP[voiceLanguage] || VOICE_MAP['default'];

    // 2. Call Genkit TTS Model to generate audio.
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

    // 3. Convert PCM to WAV and return as a data URI.
    const wavBase64 = await toWav(audioBuffer);
    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

/**
 * Generates a spoken summary of a medical report based on a provided script and language.
 *
 * @param input - An object containing the script and desired voice language.
 * @returns A Promise that resolves to an object containing the base64 encoded WAV audio data URI.
 */
export async function generateVoiceSummary(input: GenerateVoiceSummaryInput): Promise<GenerateVoiceSummaryOutput> {
  return generateVoiceSummaryFlow(input);
}
