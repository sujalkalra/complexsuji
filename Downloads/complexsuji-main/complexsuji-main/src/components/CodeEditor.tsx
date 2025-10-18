
import { useState, useCallback, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Code } from 'lucide-react';

// Sample code for initial state
const sampleCode = `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

// Find maximum element in array
const result = findMax([3, 7, 2, 9, 1, 5]);
`;

interface CodeEditorProps {
  onAnalyze: (code: string) => void;
  isAnalyzing: boolean;
  className?: string;
}

export default function CodeEditor({ onAnalyze, isAnalyzing, className }: CodeEditorProps) {
  const [code, setCode] = useState(sampleCode);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Watch for theme changes in the root element
  useEffect(() => {
    const root = window.document.documentElement;
    const observer = new MutationObserver(() => {
      if (root.classList.contains('dark')) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    });

    observer.observe(root, { attributes: true });
    
    // Set initial theme
    setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    
    return () => observer.disconnect();
  }, []);

  const handleChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Support Ctrl+Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (code.trim()) {
        onAnalyze(code);
      } else {
        toast.error('Please enter some code to analyze');
      }
    }
  }, [code, onAnalyze]);

  const handleAnalyzeClick = () => {
    if (code.trim()) {
      onAnalyze(code);
    } else {
      toast.error('Please enter some code to analyze');
    }
  };

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <div className="bg-muted p-2 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Code Editor</span>
        </div>
        <div className="text-xs text-muted-foreground">Ctrl+Enter to analyze</div>
      </div>
      
      <div className="code-container" onKeyDown={handleKeyDown as any}>
        <CodeMirror
          value={code}
          height="400px"
          extensions={[javascript({ jsx: true })]}
          onChange={handleChange}
          theme={theme === 'dark' ? oneDark : undefined}
        />
      </div>
      
      <div className="p-3 flex justify-end bg-muted">
        <Button 
          onClick={handleAnalyzeClick} 
          disabled={isAnalyzing}
          className="relative overflow-hidden"
        >
          {isAnalyzing ? (
            <>
              <span className="animate-pulse-light">Analyzing</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin-slow h-5 w-5 text-background/20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </>
          ) : (
            'Analyze Complexity'
          )}
        </Button>
      </div>
    </div>
  );
}
