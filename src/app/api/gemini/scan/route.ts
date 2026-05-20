import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKey } from "@/lib/env/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();

    // If Gemini API Key is missing, fall back to mock extraction for local testing & demos
    if (!apiKey) {
      console.log("GEMINI_API_KEY is not set. Returning simulated medicine scan details.");
      
      // Simulate API network latency
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData = {
        medicine_name: "Amoxicillin (Amoxil)",
        generic_name: "Amoxicillin Trihydrate",
        brand_name: "Amoxil",
        strength: "500 mg",
        dosage_form: "Capsule",
        category: "Antibiotic",
        expiry_date: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 years from now
        batch_number: "AMX-" + Math.floor(100 + Math.random() * 900),
        manufacturer: "GlaxoSmithKline",
        confidence_level: "high",
        warnings: [
          "Complete the full course of treatment as prescribed.",
          "Do not share this medicine with others.",
        ],
      };

      return NextResponse.json(mockData);
    }

    // Parse base64 parts
    // Expecting data format: "data:image/jpeg;base64,..."
    const matches = image.match(/^data:([^;]+);base64,(.*)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const prompt = `Analyze the medicine bottle/box label in the provided image. Extract details such as names, strength, dosage form, batch code, expiry date, manufacturer, and warnings. Make sure you translate or parse any dates into standard YYYY-MM-DD. Return exactly a JSON object matching this schema:

{
  "medicine_name": "generic name and brand name combined, or generic if no brand (string)",
  "generic_name": "standard generic name of the drug (string)",
  "brand_name": "brand name if present, otherwise empty string (string)",
  "strength": "strength, e.g. 500 mg, 10mg/5mL, etc. (string)",
  "dosage_form": "dosage form, e.g. Tablet, Capsule, Syrup, Suspended, etc. (string)",
  "category": "category of drug, e.g. Antibiotic, Analgesic, Antipyretic, etc. (string)",
  "expiry_date": "expiry date in YYYY-MM-DD format if found, otherwise empty string (string)",
  "batch_number": "batch or lot number if found, otherwise empty string (string)",
  "manufacturer": "manufacturer name if found, otherwise empty string (string)",
  "confidence_level": "high" | "medium" | "low",
  "warnings": ["list of warning strings or precautions related to this medicine"]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
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

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Empty response returned from Gemini API");
    }

    const parsedData = JSON.parse(textResponse.trim());
    return NextResponse.json(parsedData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in Gemini scan route handler:", error);
    return NextResponse.json(
      { error: "Failed to extract medicine details: " + message },
      { status: 500 }
    );
  }
}
