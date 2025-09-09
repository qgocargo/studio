'use server';

/**
 * @fileOverview Generates a QR code for customer feedback after delivery completion.
 *
 * - generateQrCodeForFeedback - Generates a QR code for customer feedback.
 * - GenerateQrCodeForFeedbackInput - The input type for the generateQrCodeForFeedback function.
 * - GenerateQrCodeForFeedbackOutput - The return type for the generateQrCodeForFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import QRCode from 'qrcode';

const GenerateQrCodeForFeedbackInputSchema = z.object({
  deliveryId: z.string().describe('The ID of the delivery for which to generate the QR code.'),
  baseUrl: z.string().describe('The base URL of the application.'),
});

export type GenerateQrCodeForFeedbackInput = z.infer<typeof GenerateQrCodeForFeedbackInputSchema>;

const GenerateQrCodeForFeedbackOutputSchema = z.object({
  qrCodeDataUri: z.string().describe('The QR code as a data URI.'),
});

export type GenerateQrCodeForFeedbackOutput = z.infer<typeof GenerateQrCodeForFeedbackOutputSchema>;

export async function generateQrCodeForFeedback(
  input: GenerateQrCodeForFeedbackInput
): Promise<GenerateQrCodeForFeedbackOutput> {
  return generateQrCodeForFeedbackFlow(input);
}

const generateQrCodeForFeedbackFlow = ai.defineFlow(
  {
    name: 'generateQrCodeForFeedbackFlow',
    inputSchema: GenerateQrCodeForFeedbackInputSchema,
    outputSchema: GenerateQrCodeForFeedbackOutputSchema,
  },
  async input => {
    const feedbackUrl = `${input.baseUrl}/?feedbackId=${input.deliveryId}`;
    const qrCodeDataUri = await QRCode.toDataURL(feedbackUrl);
    return {qrCodeDataUri};
  }
);
