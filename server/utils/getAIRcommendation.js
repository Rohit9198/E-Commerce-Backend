export async function getAIRecommendation(req, res, userPrompt, products) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { success: true, products: products, message: "Fallback to available products." };
  }

  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const catalogSummary = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
      ratings: p.ratings,
    }));

    const geminiPrompt = `
You are an e-commerce AI assistant.
Product Catalog:
${JSON.stringify(catalogSummary)}

User Query: "${userPrompt}"

Instructions:
1. Select all products from the catalog above that match or are relevant to the user query.
2. Return a JSON array containing the matching product IDs (e.g. [1, 2, 5]) or matching product objects.
3. If all products are relevant or closely match, include them. If nothing is an exact match, return the closest related products.
4. Output only valid JSON.`;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      console.warn("Gemini API returned error status:", response.status);
      return { success: true, products: products, message: "Fallback to filtered products." };
    }

    const data = await response.json();
    const aiResponseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const cleanedText = aiResponseText.replace(/```json|```/g, "").trim();

    if (!cleanedText) {
      return { success: true, products: products, message: "Fallback to filtered products." };
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      const match = cleanedText.match(/\[[\s\S]*\]/) || cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    if (!parsed) {
      return { success: true, products: products, message: "Fallback to filtered products." };
    }

    if (!Array.isArray(parsed) && Array.isArray(parsed.products)) {
      parsed = parsed.products;
    } else if (!Array.isArray(parsed) && Array.isArray(parsed.matching_products)) {
      parsed = parsed.matching_products;
    } else if (!Array.isArray(parsed) && Array.isArray(parsed.recommendations)) {
      parsed = parsed.recommendations;
    }

    if (Array.isArray(parsed)) {
      // If AI returned an array of IDs like [1, 2]
      if (parsed.length > 0 && (typeof parsed[0] === "number" || typeof parsed[0] === "string")) {
        const idSet = new Set(parsed.map(String));
        const matched = products.filter((p) => idSet.has(String(p.id)));
        if (matched.length > 0) return { success: true, products: matched };
      }

      // If AI returned array of objects, match back by ID to preserve DB attributes (images, timestamps, etc.)
      const idSet = new Set(
        parsed.map((p) => String(p?.id || p?._id)).filter((id) => id && id !== "undefined")
      );
      if (idSet.size > 0) {
        const matched = products.filter((p) => idSet.has(String(p.id)));
        if (matched.length > 0) return { success: true, products: matched };
      }

      if (parsed.length > 0 && parsed[0].name) {
        return { success: true, products: parsed };
      }
    }

    return { success: true, products: products };
  } catch (error) {
    console.error("Gemini AI Search error:", error.message);
    return { success: true, products: products, message: "Fallback to available products." };
  }
} 