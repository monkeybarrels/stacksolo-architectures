# PDF Extractor Template

Extract structured data from PDFs using Google's Gemini AI. Simply upload a PDF to a Cloud Storage bucket and get JSON output automatically.

## What You Get

- **Uploads bucket** - Drop PDFs here to trigger processing
- **Processed bucket** - JSON extraction results appear here
- **Cloud Function** - GCS-triggered function using Gemini 1.5 Flash
- **Customizable prompt** - Edit `extraction.prompt` to extract what you need

## Quick Start

```bash
# Initialize the template
stacksolo init --template pdf-extractor

# Deploy
stacksolo deploy

# Upload a PDF
gsutil cp your-document.pdf gs://your-project-uploads/

# Check the result
gsutil cat gs://your-project-processed/your-document.json
```

## Prerequisites

1. **GCP Project** with billing enabled
2. **Vertex AI API** enabled:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```
3. **Cloud Storage** and **Cloud Functions** APIs (auto-enabled by StackSolo)

## Customizing Extraction

Edit `functions/pdf-processor/extraction.prompt` to change what data is extracted:

```
Extract only the "Decision" section from this VA decision letter.

Return JSON with:
{
  "decision": "The full decision text",
  "effectiveDate": "Date the decision takes effect",
  "claimNumber": "Claim number if present"
}
```

The function reads this prompt file at runtime, so you can redeploy after editing.

## Configuration Options

In `stacksolo.config.json`:

| Setting | Default | Description |
|---------|---------|-------------|
| `GEMINI_MODEL` | `gemini-2.0-flash` | Model to use (`gemini-2.0-flash`, `gemini-2.0-pro`) |
| `OUTPUT_BUCKET` | `{project}-processed` | Where to write JSON results |

### Using Gemini Pro for Better Accuracy

```json
{
  "functions": [{
    "name": "pdf-processor",
    "env": {
      "GEMINI_MODEL": "gemini-2.0-pro"
    }
  }]
}
```

Gemini Pro is more accurate but slower and ~10x more expensive.

## Output Format

Each processed PDF creates a JSON file:

```json
{
  "source": {
    "bucket": "myapp-uploads",
    "file": "document.pdf",
    "processedAt": "2024-01-15T10:30:00Z"
  },
  "model": "gemini-2.0-flash",
  "processingTimeMs": 2340,
  "extracted": {
    "title": "Document Title",
    "sections": [...],
    "keyFindings": [...]
  }
}
```

## Cost Estimate

| Component | Cost |
|-----------|------|
| Cloud Function | ~$0 (free tier: 2M invocations) |
| Gemini 1.5 Flash | ~$0.002 per PDF (10-page doc) |
| Gemini 1.5 Pro | ~$0.02 per PDF (10-page doc) |
| Cloud Storage | ~$0.02/GB/month |

Processing 1,000 PDFs costs approximately $2-20 depending on model choice.

## Troubleshooting

### "Vertex AI API not enabled"

```bash
gcloud services enable aiplatform.googleapis.com
```

### Function not triggering

Check that the bucket name in your config matches exactly:
```json
{
  "trigger": {
    "type": "storage",
    "bucket": "{{projectName}}-uploads"
  }
}
```

### Empty or error output

Check Cloud Logging for the function:
```bash
gcloud functions logs read pdf-processor --gen2 --region=us-central1
```

## Learn More

- [Gemini API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Cloud Functions Storage Triggers](https://cloud.google.com/functions/docs/calling/storage)
- [StackSolo Documentation](https://stacksolo.dev)
