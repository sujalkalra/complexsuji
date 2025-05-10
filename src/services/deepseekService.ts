
import { toast } from "sonner";

// Define the response type from API
export interface DeepseekResponse {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  suggestions: string[];
}

// Using OpenRouter API with Deepcoder model
const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "agentica-org/deepcoder-14b-preview:free";

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
        "HTTP-Referer": window.location.origin, // Required by OpenRouter
        "X-Title": "ComplexSuji" // Identifying app name for OpenRouter
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
    console.log("API response:", result);
    
    // Extract the content from the AI's response
    const content = result.choices[0].message.content;
    
    // Parse the JSON from the content
    // We need to use try/catch because the AI might not always return valid JSON
    try {
      // First try to parse as is
      try {
        const parsedResponse = JSON.parse(content);
        return parsedResponse as DeepseekResponse;
      } catch (e) {
        // If direct parsing fails, try to extract JSON from markdown or text
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                         content.match(/(\{[\s\S]*\})/);
                         
        if (jsonMatch && jsonMatch[1]) {
          const extractedJson = jsonMatch[1];
          return JSON.parse(extractedJson) as DeepseekResponse;
        }
        
        throw new Error("Could not extract valid JSON from response");
      }
    } catch (error) {
      console.error("Failed to parse API response:", content);
      toast.error("Received invalid response format from AI service");
      
      // Create a fallback response based on the error
      return {
        timeComplexity: "Error",
        timeExplanation: "Could not analyze time complexity due to API response parsing error.",
        spaceComplexity: "Error",
        spaceExplanation: "Could not analyze space complexity due to API response parsing error.",
        suggestions: ["Try again with a simpler code snippet", "Check if the code is valid", "Contact support if the issue persists"]
      };
    }
  } catch (error) {
    console.error("Error analyzing code:", error);
    toast.error("Failed to analyze code: " + (error as Error).message);
    
    // Re-throw to let the component handle the error state
    throw error;
  }
};
