import { useState } from "react";
import { Check, Clock, HardDrive, Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InlineMath } from "react-katex"; // ✅ added
import "katex/dist/katex.min.css"; // ✅ added

interface ComplexityResultProps {
  result: {
    timeComplexity: string;
    timeExplanation: string;
    spaceComplexity: string;
    spaceExplanation: string;
    suggestions: string[];
  } | null;
  code: string;
  className?: string;
}

export default function ComplexityResult({ result, code, className }: ComplexityResultProps) {
  const [hasFeedbackSubmitted, setHasFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!result) return null;

  // ✅ helper to convert '^2' to LaTeX format
  const formatComplexity = (complexity: string) => {
    if (!complexity) return "";
    // Converts O(n^2) → O(n^{2}), O(n^3) → O(n^{3})
    return complexity.replace(/\^(\d+)/g, (_, p1) => `^{${p1}}`);
  };

  const handleFeedback = async (isCorrect: boolean) => {
    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/api/analysis/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          timeComplexity: result.timeComplexity,
          spaceComplexity: result.spaceComplexity,
          timeExplanation: result.timeExplanation,
          spaceExplanation: result.spaceExplanation,
          suggestions: result.suggestions,
          isCorrect,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setHasFeedbackSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Complexity */}
        <Card className="overflow-hidden border-border/40 analysis-card">
          <CardHeader className="bg-primary/10 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Time Complexity</CardTitle>
            </div>
            <CardDescription>
              Algorithm's execution time analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="text-2xl font-bold text-primary">
                {/* ✅ Render LaTeX */}
                <InlineMath math={formatComplexity(result.timeComplexity)} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {result.timeExplanation}
            </p>
          </CardContent>
        </Card>

        {/* Space Complexity */}
        <Card className="overflow-hidden border-border/40 analysis-card">
          <CardHeader className="bg-primary/10 pb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Space Complexity</CardTitle>
            </div>
            <CardDescription>
              Algorithm's memory usage analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="text-2xl font-bold text-primary">
                {/* ✅ Render LaTeX */}
                <InlineMath math={formatComplexity(result.spaceComplexity)} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {result.spaceExplanation}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <Card className="overflow-hidden border-border/40 analysis-card">
          <CardHeader className="bg-primary/10 pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Optimization Suggestions</CardTitle>
            </div>
            <CardDescription>
              AI-generated recommendations to improve efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-2">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      <Card className="overflow-hidden border-border/40 analysis-card">
        <CardHeader className="bg-primary/10 pb-3">
          <CardTitle className="text-lg">Feedback</CardTitle>
          <CardDescription>
            Does this analysis seem right to you?
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {hasFeedbackSubmitted ? (
            <p className="text-sm text-green-600 font-medium">Thank you for your feedback! This helps us improve.</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => handleFeedback(true)}
                disabled={isSubmitting}
              >
                <ThumbsUp className="h-4 w-4" />
                Yes, I think it's correct
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => handleFeedback(false)}
                disabled={isSubmitting}
              >
                <ThumbsDown className="h-4 w-4" />
                No, I don't think so
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
