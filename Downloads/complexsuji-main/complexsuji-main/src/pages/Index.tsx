import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CodeEditor from '@/components/CodeEditor';
import ComplexityResult from '@/components/ComplexityResult';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { analyzeCodeComplexity, DeepseekResponse } from '@/services/deepseekService';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DeepseekResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // This now calls the OpenRouter API with Deepcoder model to analyze the code
  const handleAnalyzeCode = async (code: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    // Clear any previous results
    setResult(null);
    
    try {
      const analysisResult = await analyzeCodeComplexity(code);
      setResult(analysisResult);
      toast.success("Analysis completed successfully");
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      toast.error("Failed to analyze code: " + errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
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
                
                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground text-center">
                      Analyzing code complexity with AI...
                    </p>
                  </div>
                )}
                
                {error && !isAnalyzing && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-destructive mb-2">Analysis Error</h3>
                    <p className="text-muted-foreground">{error}</p>
                    <p className="text-sm mt-2">Please try again with a different code sample or check your network connection.</p>
                  </div>
                )}
                
                {result && !isAnalyzing && (
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
                i would love to be a Tech friend of yours.
              </p>
              <div className="flex justify-center">
                <a href="mailto:kalrasujal322@gmail.com" className="text-primary hover:underline">
                  kalrasujal322@gmail.com
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
