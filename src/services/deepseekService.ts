
import { toast } from "sonner";

// Define the response type from Deepseek API
export interface DeepseekResponse {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  suggestions: string[];
}

// The API key should ideally be stored in environment variables
// For now we'll use it directly as provided
const DEEPSEEK_API_KEY = "sk-8d79f82b1f234014bcfe31c1ced098f6";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

/**
 * Analyze code complexity using Deepseek AI
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

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-coder", // Use the appropriate model
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
      throw new Error(error.message || "Failed to analyze code");
    }

    const result = await response.json();
    
    // Extract the content from the AI's response
    const content = result.choices[0].message.content;
    
    // Parse the JSON from the content
    // We need to use try/catch because the AI might not always return valid JSON
    try {
      const parsedResponse = JSON.parse(content);
      return parsedResponse as DeepseekResponse;
    } catch (error) {
      console.error("Failed to parse Deepseek response:", content);
      throw new Error("Invalid response format from AI service");
    }
  } catch (error) {
    console.error("Error analyzing code:", error);
    toast.error("Failed to analyze code: " + (error as Error).message);
    throw error;
  }
};
