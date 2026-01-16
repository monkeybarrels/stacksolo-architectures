/**
 * PDF Extractor Function
 *
 * This Cloud Function is triggered when a PDF is uploaded to the uploads bucket.
 * It uses Google's Gemini AI to extract structured data from the PDF.
 *
 * To customize extraction:
 * 1. Edit the extraction.prompt file to change what data is extracted
 * 2. Modify the GEMINI_MODEL env var for different models (gemini-1.5-flash, gemini-1.5-pro)
 */

import { CloudEvent } from '@google-cloud/functions-framework';
import { Storage } from '@google-cloud/storage';
import { VertexAI } from '@google-cloud/vertexai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GCS event data structure
interface StorageObjectData {
  bucket: string;
  name: string;
  contentType: string;
  size: string;
  timeCreated: string;
}

// Initialize clients
const storage = new Storage();
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '',
  location: process.env.GCP_REGION || 'us-central1',
});

/**
 * Load the extraction prompt from file
 * Falls back to a default prompt if file not found
 */
function loadPrompt(): string {
  const promptPath = path.join(__dirname, '..', 'extraction.prompt');

  try {
    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, 'utf-8').trim();
    }
  } catch (err) {
    console.warn('Could not load extraction.prompt, using default');
  }

  return 'Extract the key information from this document and return it as structured JSON.';
}

/**
 * Main handler for GCS upload events
 */
export async function handler(event: CloudEvent<StorageObjectData>): Promise<void> {
  const data = event.data;

  if (!data) {
    console.error('No event data received');
    return;
  }

  const { bucket, name, contentType } = data;

  console.log(`Processing file: ${name}`);
  console.log(`Bucket: ${bucket}`);
  console.log(`Content-Type: ${contentType}`);

  // Skip non-PDF files
  if (contentType !== 'application/pdf') {
    console.log(`Skipping non-PDF file: ${name} (type: ${contentType})`);
    return;
  }

  // Skip files in subdirectories (optional - remove if you want to process all PDFs)
  if (name.includes('/')) {
    console.log(`Skipping file in subdirectory: ${name}`);
    return;
  }

  const outputBucket = process.env.OUTPUT_BUCKET;
  if (!outputBucket) {
    throw new Error('OUTPUT_BUCKET environment variable is required');
  }

  try {
    // Download PDF to temp storage
    const tempPath = `/tmp/${path.basename(name)}`;
    console.log(`Downloading to: ${tempPath}`);

    await storage.bucket(bucket).file(name).download({ destination: tempPath });

    // Read PDF as base64
    const pdfBytes = fs.readFileSync(tempPath);
    const base64Pdf = pdfBytes.toString('base64');

    console.log(`PDF size: ${pdfBytes.length} bytes`);

    // Load extraction prompt
    const prompt = loadPrompt();

    // Initialize Gemini model
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    console.log(`Using model: ${modelName}`);

    const model = vertexAI.getGenerativeModel({
      model: modelName,
    });

    // Call Gemini with the PDF
    console.log('Calling Gemini API...');
    const startTime = Date.now();

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`Gemini response received in ${duration}ms`);

    // Extract the response text
    const response = result.response;
    const extractedText =
      response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!extractedText) {
      console.warn('No text extracted from Gemini response');
    }

    // Parse the response as JSON (if possible)
    let extractedData: unknown;
    try {
      // Try to extract JSON from the response (Gemini might wrap it in markdown)
      const jsonMatch = extractedText.match(/```json\n?([\s\S]*?)\n?```/) ||
                       extractedText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : extractedText;
      extractedData = JSON.parse(jsonStr);
    } catch {
      // If not valid JSON, store as raw text
      extractedData = {
        rawText: extractedText,
        parseError: 'Response was not valid JSON',
      };
    }

    // Create output document
    const output = {
      source: {
        bucket,
        file: name,
        processedAt: new Date().toISOString(),
      },
      model: modelName,
      processingTimeMs: duration,
      extracted: extractedData,
    };

    // Write result to output bucket
    const outputName = name.replace(/\.pdf$/i, '.json');
    const outputFile = storage.bucket(outputBucket).file(outputName);

    await outputFile.save(JSON.stringify(output, null, 2), {
      contentType: 'application/json',
    });

    console.log(`Output written to: gs://${outputBucket}/${outputName}`);

    // Clean up temp file
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    console.log(`Successfully processed: ${name}`);
  } catch (error) {
    console.error(`Error processing ${name}:`, error);
    throw error; // Re-throw to trigger retry
  }
}
