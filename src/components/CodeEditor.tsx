
import { useState, useCallback, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Code, Play } from 'lucide-react';

// JetBrains Darcula-inspired theme
const jetbrainsDarcula = createTheme({
  theme: 'dark',
  settings: {
    background: '#1e1e1e',
    foreground: '#a9b7c6',
    caret: '#ffffff',
    selection: '#214283',
    selectionMatch: '#32593d',
    lineHighlight: '#2c2c2c',
    gutterBackground: '#1e1e1e',
    gutterForeground: '#606366',
    gutterBorder: 'transparent',
  },
  styles: [
    { tag: t.comment, color: '#808080', fontStyle: 'italic' },
    { tag: t.lineComment, color: '#808080', fontStyle: 'italic' },
    { tag: t.blockComment, color: '#808080', fontStyle: 'italic' },
    { tag: [t.string, t.special(t.brace)], color: '#6a8759' },
    { tag: t.number, color: '#6897bb' },
    { tag: t.bool, color: '#cc7832', fontWeight: 'bold' },
    { tag: t.null, color: '#cc7832', fontWeight: 'bold' },
    { tag: [t.keyword, t.operator], color: '#cc7832' },
    { tag: [t.definitionKeyword, t.moduleKeyword], color: '#cc7832' },
    { tag: t.variableName, color: '#a9b7c6' },
    { tag: [t.definition(t.variableName)], color: '#ffc66d' },
    { tag: t.function(t.variableName), color: '#ffc66d' },
    { tag: [t.className, t.typeName], color: '#a9b7c6', fontWeight: 'bold' },
    { tag: [t.propertyName], color: '#9876aa' },
    { tag: [t.regexp], color: '#6a8759' },
    { tag: [t.tagName], color: '#e8bf6a' },
    { tag: [t.attributeName], color: '#bababa' },
    { tag: [t.meta], color: '#bbb529' },
    { tag: t.bracket, color: '#a9b7c6' },
    { tag: t.punctuation, color: '#cc7832' },
  ],
});

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

  const handleChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
    <div className={cn("rounded-lg overflow-hidden shadow-xl", className)} style={{ border: '1px solid #3c3f41' }}>
      {/* Title bar - JetBrains style */}
      <div className="flex justify-between items-center px-4 py-2" style={{ background: '#3c3f41', borderBottom: '1px solid #515151' }}>
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" style={{ color: '#afb1b3' }} />
          <span className="text-sm font-medium" style={{ color: '#bbbbbb', fontFamily: 'JetBrains Mono, monospace' }}>main.js</span>
        </div>
        <div className="text-xs" style={{ color: '#6e7073' }}>Ctrl+Enter to analyze</div>
      </div>

      {/* Editor area */}
      <div onKeyDown={handleKeyDown as any} style={{ background: '#1e1e1e' }}>
        <CodeMirror
          value={code}
          height="400px"
          extensions={[
            javascript({ jsx: true }),
            EditorView.theme({
              '&': { fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' },
              '.cm-gutters': { borderRight: '1px solid #313335', minWidth: '48px' },
              '.cm-activeLineGutter': { backgroundColor: '#2c2c2c' },
              '.cm-cursor': { borderLeftColor: '#ffffff', borderLeftWidth: '2px' },
              '.cm-matchingBracket': { backgroundColor: '#3b514d', outline: 'none' },
              '.cm-selectionMatch': { backgroundColor: '#32593d' },
              '.cm-foldGutter': { color: '#606366' },
            }),
          ]}
          onChange={handleChange}
          theme={jetbrainsDarcula}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            indentOnInput: true,
          }}
        />
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 flex justify-between items-center" style={{ background: '#3c3f41', borderTop: '1px solid #515151' }}>
        <span className="text-xs" style={{ color: '#6e7073' }}>
          {code.split('\n').length} lines
        </span>
        <Button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className="relative overflow-hidden gap-2 font-mono text-sm"
          style={{
            background: isAnalyzing ? '#365880' : '#365880',
            color: '#ffffff',
            border: 'none',
          }}
        >
          {isAnalyzing ? (
            <span className="animate-pulse">Analyzing...</span>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
