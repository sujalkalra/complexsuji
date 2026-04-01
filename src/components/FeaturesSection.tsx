
import { Gauge, Zap, Sparkles, Code, Search, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground">
            ComplexSuji helps developers understand and optimize their code with these powerful features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Search className="h-5 w-5" />}
            title="Code Analysis"
            description="Analyze your code with AI to understand its efficiency and performance characteristics."
          />
          <FeatureCard
            icon={<Gauge className="h-5 w-5" />}
            title="Time Complexity"
            description="Get precise Big-O notation analysis of your algorithm's execution time complexity."
          />
          <FeatureCard
            icon={<Code className="h-5 w-5" />}
            title="Space Complexity"
            description="Understand your algorithm's memory usage patterns and optimize accordingly."
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="AI Suggestions"
            description="Receive intelligent recommendations to improve your code's performance."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Instant Results"
            description="Get analysis results in seconds with our powerful AI processing engine."
          />
          <FeatureCard
            icon={<ArrowRight className="h-5 w-5" />}
            title="Multiple Languages"
            description="Support for JavaScript, Python, Java, and more programming languages."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Card className="border-border/40 h-full">
      <CardHeader className="pb-2">
        <div className="p-2 w-fit rounded-md bg-primary/10 text-primary mb-2">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
