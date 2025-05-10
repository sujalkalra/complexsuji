import { toast } from "sonner";

export interface DeepseekResponse {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  suggestions: string[];
}

// Load environment variables (via Vite)
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = import.meta.env.VITE_OPENROUTER_API_URL;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL;

export const analyzeCodeComplexity = async (code: string): Promise<DeepseekResponse> => {
  try {
    console.log("Using model:", MODEL);
    console.log("API URL:", API_URL);

    const prompt = `
      Analyze the following code and provide:
      1. Time complexity (Big O notation)
      2. Detailed explanation of the time complexity
      3. Space complexity (Big O notation)
      4. Detailed explanation of the space complexity
      5. Three suggestions to improve the algorithm's efficiency (if possible)

      Format your response as a JSON with the following structure:
      {
        "timeComplexity": "O(n)",
        "timeExplanation": "Explanation of time complexity...",
        "spaceComplexity": "O(1)",
        "spaceExplanation": "Explanation of space complexity...",
        "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
      }

      Only provide the JSON as your answer, nothing else.

      Here's the code to analyze:

      ${code}
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "ComplexSuji"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    const result = await response.json();
    console.log("Raw API result:", result);

    if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
      console.error("Missing 'choices' in response:", result);
      throw new Error("API returned no choices. Check your API key, model name, or prompt length.");
    }

    const content = result.choices[0].message?.content;
    if (!content) {
      console.error("Missing 'message.content' in result:", result.choices[0]);
      throw new Error("Missing content in API response.");
    }

    console.log("Raw model content:", content);

    try {
      return ensureValidResponse(JSON.parse(content));
    } catch (e) {
      console.warn("Direct JSON parse failed. Trying fallback extraction...");

      const jsonMatches = [
        content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/),
        content.match(/(\{[\s\S]*\})/),
        content.match(/\{\s*"timeComplexity"[\s\S]*"suggestions"[\s\S]*\}/)
      ];

      for (const match of jsonMatches) {
        if (match && match[1]) {
          try {
            const extracted = match[1];
            console.log("Extracted fallback JSON:", extracted);
            return ensureValidResponse(JSON.parse(extracted));
          } catch {
            console.warn("Failed to parse one fallback JSON pattern.");
          }
        }
      }

      console.error("Could not parse valid JSON. Final fallback triggered.");
      toast.error("AI response could not be parsed. Showing fallback result.");
      return generateFallbackResponse(content);
    }
  } catch (error) {
    const message = (error as Error).message || "Unknown error occurred";
    console.error("Error analyzing code:", error);
    toast.error(`Failed to analyze code: ${message}`);
    return generateFallbackResponse("No usable response content.");
  }
};

function ensureValidResponse(response: any): DeepseekResponse {
  const requiredFields = ['timeComplexity', 'timeExplanation', 'spaceComplexity', 'spaceExplanation', 'suggestions'];

  for (const field of requiredFields) {
    if (!response[field]) {
      response[field] = field === 'suggestions' ? [] : "Not provided";
    }
  }

  if (!Array.isArray(response.suggestions)) {
    response.suggestions = response.suggestions ? [response.suggestions.toString()] : [];
  }

  return response as DeepseekResponse;
}

function generateFallbackResponse(content: string): DeepseekResponse {
  const timeMatch = content.match(/[oO]\s*\(\s*([^)]+)\s*\).*time|time.*[oO]\s*\(\s*([^)]+)\s*\)/i);
  const spaceMatch = content.match(/[oO]\s*\(\s*([^)]+)\s*\).*space|space.*[oO]\s*\(\s*([^)]+)\s*\)/i);

  return {
    timeComplexity: timeMatch ? `O(${timeMatch[1] || timeMatch[2]})` : "Analysis failed",
    timeExplanation: "Failed to parse the time complexity.",
    spaceComplexity: spaceMatch ? `O(${spaceMatch[1] || spaceMatch[2]})` : "Analysis failed",
    spaceExplanation: "Failed to parse the space complexity.",
    suggestions: [
      "Try simplifying the code",
      "Ensure the code is syntactically valid",
      "Use smaller code blocks if possible"
    ]
  };
}
