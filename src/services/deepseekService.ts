import { toast } from "sonner";

export interface DeepseekResponse {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  suggestions: string[];
}

// Load environment variables
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = import.meta.env.VITE_OPENROUTER_API_URL;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL;

export const analyzeCodeComplexity = async (code: string): Promise<DeepseekResponse> => {
  try {
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
        "Authorization": `Bearer ${API_KEY}`,
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to analyze code");
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    try {
      try {
        return ensureValidResponse(JSON.parse(content));
      } catch {
        const jsonMatches = [
          content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/),
          content.match(/(\{[\s\S]*\})/),
          content.match(/\{\s*"timeComplexity"[\s\S]*"suggestions"[\s\S]*\}/)
        ];

        for (const match of jsonMatches) {
          if (match && match[1]) {
            return ensureValidResponse(JSON.parse(match[1]));
          }
        }

        throw new Error("Could not extract valid JSON from response");
      }
    } catch {
      toast.error("Invalid response format from AI service");
      return generateFallbackResponse(content);
    }
  } catch (error) {
    console.error("Error analyzing code:", error);
    toast.error("Failed to analyze code: " + (error as Error).message);
    throw error;
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
    timeExplanation: "Failed to parse time complexity.",
    spaceComplexity: spaceMatch ? `O(${spaceMatch[1] || spaceMatch[2]})` : "Analysis failed",
    spaceExplanation: "Failed to parse space complexity.",
    suggestions: [
      "Try simplifying the code",
      "Ensure the code is syntactically valid",
      "Use smaller code blocks if possible"
    ]
  };
}
