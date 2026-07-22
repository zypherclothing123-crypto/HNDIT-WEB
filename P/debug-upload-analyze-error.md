# Debug Session: upload-analyze-error

## Session Metadata
- Session ID: upload-analyze-error
- Start Time: 2026-06-23
- Status: [OPEN]
- User Description: "check the uploading and analyzing part it is not working properly"

## Hypotheses
1. **Gemini API Key Issue**: The NEXT_PUBLIC_GEMINI_API_KEY is invalid or has reached quota, causing AI lab generation to fail.
2. **PDF Parsing Failure**: extractTextFromPdfBuffer is failing or returning empty text, even for valid PDFs.
3. **Supabase RLS Policy Issue**: Row Level Security policies on uploaded_notes, labs, questions, or storage buckets are blocking insertions/reads.
4. **JSON Parsing Error**: generateLabFromNotes is failing because Gemini's response includes invalid JSON (markdown fences, extra text, etc.).
5. **Invalid Gemini Model Name**: The default model "gemini-2.5-flash" may not be available for the API key. ✅ Likely!

## Reproduction Steps
1. Navigate to /admin/upload
2. Select a subject
3. Drag and drop a PDF file
4. Observe errors or incomplete behavior

## Instrumentation Logs
- [x] Instrumentation added to /api/analyze route
- [x] Instrumentation added to labGenerator.ts
- [x] Instrumentation added to gemini.ts
- [ ] Pre-fix logs collected
- [ ] Post-fix logs collected

## Findings
- Default model was "gemini-2.5-flash", which may not be widely available
- gemini-1.5-pro also returned 404

## Root Cause
- Invalid or unavailable default Gemini model name

## Fix Applied
- Changed primary model from "gemini-2.5-flash" → "gemini-2.0-flash"
- Updated fallback models to ["gemini-1.5-flash"] (which is widely available)
- Modified generateText to try primary model first, then fallbacks, skipping bad model IDs

