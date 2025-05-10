
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CodeEditor from '@/components/CodeEditor';
import ComplexityResult from '@/components/ComplexityResult';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { analyzeCodeComplexity, DeepseekResponse } from '@/services/deepseekService';

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DeepseekResponse | null>(null);

  // This now calls the Deepseek API to analyze the code
  const handleAnalyzeCode = async (code: string) => {
    setIsAnalyzing(true);
    
    // Clear any previous results
    setResult(null);
    
    try {
      const analysisResult = await analyzeCodeComplexity(code);
      setResult(analysisResult);
      toast.success("Analysis completed successfully");
    } catch (error) {
      toast.error("Failed to analyze code: " + (error as Error).message);
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
