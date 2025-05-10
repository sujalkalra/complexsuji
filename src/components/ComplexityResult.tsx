
import { Check, Clock, HardDrive, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface ComplexityResultProps {
  result: {
    timeComplexity: string;
    timeExplanation: string;
    spaceComplexity: string;
    spaceExplanation: string;
    suggestions: string[];
  } | null;
  className?: string;
}

export default function ComplexityResult({ result, className }: ComplexityResultProps) {
  if (!result) return null;

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
              <div className="text-2xl font-bold text-primary">{result.timeComplexity}</div>
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
              <div className="text-2xl font-bold text-primary">{result.spaceComplexity}</div>
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
    </div>
  );
}
