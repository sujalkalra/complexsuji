
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CodeEditor from '@/components/CodeEditor';
import ComplexityResult from '@/components/ComplexityResult';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

// Mock data for demo
const mockAnalysis = {
  timeComplexity: "O(n)",
  timeExplanation: "This function has a linear time complexity because it iterates through each element of the array exactly once. As the input size (array length) grows, the execution time increases proportionally.",
  spaceComplexity: "O(1)",
  spaceExplanation: "This function uses constant extra space regardless of input size. It only allocates memory for a single variable 'max' that stores the current maximum value.",
  suggestions: [
    "The algorithm is already optimal for finding the maximum value in an unsorted array.",
    "If the array is very large, consider parallel processing techniques for improved performance.",
    "For frequent operations on the same array, consider keeping track of the maximum during insertions instead of scanning the entire array each time."
  ]
};

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof mockAnalysis | null>(null);

  // This would typically call an API endpoint to analyze the code
  // For demo purposes, we're using a timeout to simulate API call
  const handleAnalyzeCode = (code: string) => {
    setIsAnalyzing(true);
    
    // Clear any previous results
    setResult(null);
    
    // Simulate API call with delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult(mockAnalysis);
      toast.success("Analysis completed successfully");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        
        <section id="analyzer" className="py-16 scroll-mt-16">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold mb-2 text-center">Analyze Your Code</h2>
              <p className="text-center text-muted-foreground mb-8">
                Paste your code below and click "Analyze Complexity" or press Ctrl+Enter
              </p>
              
              <div className="space-y-8">
                <CodeEditor 
                  onAnalyze={handleAnalyzeCode} 
                  isAnalyzing={isAnalyzing} 
                />
                
                {result && (
                  <ComplexityResult 
                    result={result} 
                    className="animate-fade-in"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        
        <FeaturesSection />
        
        <section id="about" className="py-16 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">About ComplexSuji</h2>
              <p className="text-muted-foreground mb-6">
                ComplexSuji is an advanced AI-powered code analysis tool designed to help developers 
                understand the time and space complexity of their algorithms. Our state-of-the-art
                AI engine analyzes your code and provides detailed insights to help you write more
                efficient software.
              </p>
              <p className="text-muted-foreground">
                Whether you're preparing for technical interviews, optimizing performance-critical
                code, or just learning about algorithmic complexity, ComplexSuji has you covered
                with instant, accurate analysis and helpful suggestions.
              </p>
            </div>
          </div>
        </section>
        
        <section id="contact" className="py-16 bg-secondary/50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <div className="flex justify-center">
                <a href="mailto:contact@complexsuji.com" className="text-primary hover:underline">
                  contact@complexsuji.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
