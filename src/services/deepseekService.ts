import { toast } from "sonner";

// Define the response type from API
export interface DeepseekResponse {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  suggestions: string[];
}

// Load API keys from environment variables
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const API_URL = import.meta.env.VITE_OPENROUTER_API_URL as string;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL as string;

/**
 * Analyze code complexity using OpenRouter API with Deepcoder model
 * @param code The code to analyze
 * @returns Analysis results with time and space complexity
 */
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

    console.log("Sending request to OpenRouter API with Deepcoder model");

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
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API error:", error);
      throw new Error(error.message || "Failed to analyze code");
    }

    const result = await response.json();
    console.log("Full API Response:", result); // Log the full response to check the structure

    // Check if the response contains 'choices' and ensure it's not empty
    const choices = result?.choices;
    if (!choices || choices.length === 0) {
      console.error("API response doesn't contain 'choices' or it's empty:", result);
      toast.error("Failed to receive valid response from API.");
      return generateFallbackResponse("Unable to retrieve analysis.");
    }

    const content = choices[0]?.message?.content;
    if (!content) {
      console.error("No valid content in 'choices[0].message':", choices[0]);
      toast.error("Failed to retrieve content from API response.");
      return generateFallbackResponse("Unable to retrieve content.");
    }

    try {
      const parsedResponse = JSON.parse(content);
      return ensureValidResponse(parsedResponse);
    } catch (e) {
      console.log("Direct JSON parsing failed, trying to extract JSON from content");

      const jsonMatches = [
        content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/),
        content.match(/(\{[\s\S]*\})/),
        content.match(/\{\s*"timeComplexity"[\s\S]*"suggestions"[\s\S]*\}/),
      ];

      for (const match of jsonMatches) {
        if (match && match[1]) {
          try {
            const extractedJson = match[1];
            console.log("Extracted JSON:", extractedJson);
            const parsed = JSON.parse(extractedJson);
            return ensureValidResponse(parsed);
          } catch (err) {
            console.log("Failed to parse extracted JSON, trying next pattern");
            continue;
          }
        }
      }

      throw new Error("Could not extract valid JSON from response");
    }
  } catch (error) {
    console.error("Error analyzing code:", error);
    toast.error("Failed to analyze code: " + (error as Error).message);
    throw error;
  }
};

/**
 * Ensures the response has all required fields
 */
function ensureValidResponse(response: any): DeepseekResponse {
  const requiredFields = ['timeComplexity', 'timeExplanation', 'spaceComplexity', 'spaceExplanation', 'suggestions'];

  for (const field of requiredFields) {
    if (!response[field]) {
      if (field === 'suggestions') {
        response[field] = [];
      } else {
        response[field] = "Not provided";
      }
    }
  }

  // Ensure suggestions is an array
  if (!Array.isArray(response.suggestions)) {
    response.suggestions = response.suggestions ? [response.suggestions.toString()] : [];
  }

  return response as DeepseekResponse;
}

/**
 * Generates a fallback response when parsing fails
 */
function generateFallbackResponse(content: string): DeepseekResponse {
  const timeMatch = content.match(/[oO]\s*\(\s*([^)]+)\s*\).*time|time.*[oO]\s*\(\s*([^)]+)\s*\)/i);
  const spaceMatch = content.match(/[oO]\s*\(\s*([^)]+)\s*\).*space|space.*[oO]\s*\(\s*([^)]+)\s*\)/i);

  return {
    timeComplexity: timeMatch ? `O(${timeMatch[1] || timeMatch[2]})` : "Analysis failed",
    timeExplanation: "Failed to parse the time complexity analysis from the API response.",
    spaceComplexity: spaceMatch ? `O(${spaceMatch[1] || spaceMatch[2]})` : "Analysis failed",
    spaceExplanation: "Failed to parse the space complexity analysis from the API response.",
    suggestions: [
      "Try simplifying the code before analysis",
      "Ensure the code is syntactically correct",
      "The model may have limitations with certain complex algorithms"
    ]
  };
}
