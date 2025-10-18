
import { Button } from "./ui/button";
import { ArrowDown, Code, Search } from "lucide-react";

export default function HeroSection() {
  const scrollToAnalyzer = () => {
    const analyzerSection = document.getElementById('analyzer');
    if (analyzerSection) {
      analyzerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden py-16 md:py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Complexity Analysis</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Understand Your Code's <span className="text-primary">Efficiency</span> in Seconds
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Paste your code and instantly get time and space complexity analysis with AI-powered insights and optimization suggestions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={scrollToAnalyzer} size="lg" className="gap-2">
              <Search className="h-4 w-4" />
              Analyze Your Code
            </Button>
            <Button onClick={scrollToAnalyzer} variant="outline" size="lg">
              Learn More
            </Button>
          </div>

          <div className="mt-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={scrollToAnalyzer}
              className="animate-bounce rounded-full"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
