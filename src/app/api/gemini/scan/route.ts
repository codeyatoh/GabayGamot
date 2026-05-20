import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKey } from "@/lib/env/server";

// Ordered list of models to try — fastest/cheapest first, most capable last
const GEMINI_MODEL_CHAIN = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

// Status codes that are worth retrying on the next model
const RETRYABLE_STATUS_CODES = new Set([429, 503, 502, 500]);

interface GeminiPayload {
  contents: { parts: (Record<string, unknown>)[] }[];
  generationConfig: Record<string, unknown>;
}

async function tryGeminiModel(
  apiKey: string,
  modelName: string,
  payload: GeminiPayload
): Promise<{ ok: boolean; status: number; data?: unknown; errorText?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, status: response.status, errorText };
    }

    const data = await response.json();
    return { ok: true, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 0, errorText: err instanceof Error ? err.message : "Network error" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();

    // No API key — return rich mock data for local dev & demos
    if (!apiKey) {
      console.log("GEMINI_API_KEY is not set. Returning simulated medicine scan details.");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData = {
        medicine_name: "Amoxicillin (Amoxil)",
        generic_name: "Amoxicillin Trihydrate",
        brand_name: "Amoxil",
        strength: "500 mg",
        dosage_form: "Capsule",
        category: "Antibiotic",
        expiry_date: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        batch_number: "AMX-" + Math.floor(100 + Math.random() * 900),
        manufacturer: "GlaxoSmithKline",
        confidence_level: "high",
        warnings: [
          "Complete the full course of treatment as prescribed.",
          "Do not share this medicine with others.",
        ],
        suggested_unit: "caps",
        pack_size_quantity: 100,
      };

      return NextResponse.json(mockData);
    }

    // Parse base64 data URL → mimeType + raw base64 string
    const matches = image.match(/^data:([^;]+);base64,(.*)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const prompt = `Analyze the medicine bottle/box label in the provided image. Extract details such as names, strength, dosage form, batch code, expiry date, manufacturer, and warnings. Make sure you translate or parse any dates into standard YYYY-MM-DD.

Perform smart "what-if" mathematical deductions to extract or calculate package quantities:
- What if the packaging specifies a box count or blister layout (e.g. "10 strips of 10 tablets" or "10 capsules per blister pack, 10 blisters per box")? Perform the multiplication (e.g., 10 * 10 = 100) and return the total individual units (100) in pack_size_quantity.
- What if the packaging specifies the total count directly (e.g. "100 Tablets", "30 Capsules", "20 Sachets")? Extract the count (100, 30, 20) and return it in pack_size_quantity.
- What if the medicine is a liquid (syrup/suspension/solution/elixir/drops, e.g. "60 mL" or "120 mL")? Extract the total volume in milliliters as a number (60, 120) and return it in pack_size_quantity.
- What if the medicine is a cream, gel, or ointment (e.g. "15 g" or "5 g")? Extract the weight in grams as a number (15, 5) and return it in pack_size_quantity.
- Otherwise, if no package size/quantity/volume is discernible, set pack_size_quantity to 0.

Also determine the correct dispensing unit (suggested_unit) based on these rules:
- Tablets -> "tabs"
- Capsules -> "caps"
- Liquid/Syrup/Suspension/Solution/Drops/Elixir -> "mL"
- Cream/Ointment/Gel/Paste -> "g"
- Sachets/Powders -> "sachets"
- Vials/Ampules/Injections -> "vials"
- General pieces/other -> "pcs"

Return exactly a JSON object matching this schema:

{
  "medicine_name": "generic name and brand name combined, or generic if no brand (string)",
  "generic_name": "standard generic name of the drug (string)",
  "brand_name": "brand name if present, otherwise empty string (string)",
  "strength": "strength, e.g. 500 mg, 10mg/5mL, etc. (string)",
  "dosage_form": "dosage form, e.g. Tablet, Capsule, Syrup, Cream, etc. (string)",
  "category": "category of drug, e.g. Antibiotic, Analgesic, Antipyretic, etc. (string)",
  "expiry_date": "expiry date in YYYY-MM-DD format if found, otherwise empty string (string)",
  "batch_number": "batch or lot number if found, otherwise empty string (string)",
  "manufacturer": "manufacturer name if found, otherwise empty string (string)",
  "confidence_level": "high" | "medium" | "low",
  "warnings": ["list of warning strings or precautions related to this medicine"],
  "suggested_unit": "tabs" | "caps" | "mL" | "vials" | "sachets" | "g" | "pcs",
  "pack_size_quantity": 100 // calculated total base units or total volume/weight as a number, or 0 if not found
}`;

    const payload: GeminiPayload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    // Try each model in the fallback chain
    let lastError = "";
    for (const modelName of GEMINI_MODEL_CHAIN) {
      console.log(`[Gemini Scan] Trying model: ${modelName}`);
      const result = await tryGeminiModel(apiKey, modelName, payload);

      if (result.ok && result.data) {
        // Success — parse and return
        const geminiResult = result.data as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const textResponse = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
          console.warn(`[Gemini Scan] ${modelName} returned empty response. Trying next model.`);
          lastError = "Empty response from model";
          continue;
        }

        try {
          const parsedData = JSON.parse(textResponse.trim());
          console.log(`[Gemini Scan] Success with model: ${modelName}`);
          return NextResponse.json(parsedData);
        } catch {
          console.warn(`[Gemini Scan] ${modelName} returned unparseable JSON. Trying next model.`);
          lastError = "Unparseable JSON from model";
          continue;
        }
      }

      // If retryable error (503, 429, 502, 500) — try next model
      if (RETRYABLE_STATUS_CODES.has(result.status)) {
        console.warn(`[Gemini Scan] ${modelName} returned ${result.status} (retryable). Trying next model.`);
        lastError = `${modelName} returned ${result.status}: ${result.errorText?.slice(0, 120)}`;
        continue;
      }

      // Non-retryable error (e.g. 400 bad request, 403 auth) — stop immediately
      console.error(`[Gemini Scan] ${modelName} returned non-retryable ${result.status}. Stopping.`);
      return NextResponse.json(
        { error: `Failed to extract medicine details: ${result.errorText?.slice(0, 300)}` },
        { status: result.status || 500 }
      );
    }

    // All models exhausted — return last known error
    console.error("[Gemini Scan] All models in fallback chain failed:", lastError);
    return NextResponse.json(
      { error: `All Gemini models are currently unavailable. Please try again in a few seconds. (${lastError})` },
      { status: 503 }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in Gemini scan route handler:", error);
    return NextResponse.json(
      { error: "Failed to extract medicine details: " + message },
      { status: 500 }
    );
  }
}
