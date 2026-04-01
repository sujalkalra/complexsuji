import { describe, it, expect, mock } from "bun:test";

// Mocking 'sonner' before importing deepseekService
mock.module("sonner", () => ({
  toast: {
    error: () => {},
    success: () => {},
  },
}));

import { ensureValidResponse } from "./deepseekService";

describe("ensureValidResponse", () => {
  it("should return the same response if all required fields are present", () => {
    const validResponse = {
      timeComplexity: "O(n)",
      timeExplanation: "Explanation",
      spaceComplexity: "O(1)",
      spaceExplanation: "Explanation",
      suggestions: ["Suggestion 1"]
    };
    const result = ensureValidResponse({ ...validResponse });
    expect(result).toEqual(validResponse);
  });

  it("should fill missing mandatory fields with 'Not provided'", () => {
    const partialResponse = {
      timeComplexity: "O(n)",
      suggestions: ["Suggestion 1"]
    };
    const result = ensureValidResponse({ ...partialResponse });
    expect(result.timeExplanation).toBe("Not provided");
    expect(result.spaceComplexity).toBe("Not provided");
    expect(result.spaceExplanation).toBe("Not provided");
    expect(result.timeComplexity).toBe("O(n)");
    expect(result.suggestions).toEqual(["Suggestion 1"]);
  });

  it("should fill missing suggestions with an empty array", () => {
    const responseWithoutSuggestions = {
      timeComplexity: "O(n)",
      timeExplanation: "Explanation",
      spaceComplexity: "O(1)",
      spaceExplanation: "Explanation"
    };
    const result = ensureValidResponse({ ...responseWithoutSuggestions });
    expect(result.suggestions).toEqual([]);
  });

  it("should convert string suggestions to an array", () => {
    const responseWithStringsuggestion = {
      timeComplexity: "O(n)",
      suggestions: "Single suggestion"
    };
    const result = ensureValidResponse({ ...responseWithStringsuggestion });
    expect(result.suggestions).toEqual(["Single suggestion"]);
  });

  it("should handle null or undefined suggestions", () => {
    const responseWithNullSuggestion = {
      timeComplexity: "O(n)",
      suggestions: null
    };
    const result = ensureValidResponse({ ...responseWithNullSuggestion });
    expect(result.suggestions).toEqual([]);

    const responseWithUndefinedSuggestion = {
      timeComplexity: "O(n)",
      suggestions: undefined
    };
    const result2 = ensureValidResponse({ ...responseWithUndefinedSuggestion });
    expect(result2.suggestions).toEqual([]);
  });
});
