
import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Play } from 'lucide-react';

// JetBrains Darcula-inspired theme
const jetbrainsDarcula = createTheme({
  theme: 'dark',
  settings: {
    background: 'hsl(var(--editor-bg))',
    foreground: 'hsl(var(--editor-foreground))',
    caret: 'hsl(var(--editor-caret))',
    selection: 'hsl(var(--editor-selection))',
    selectionMatch: 'hsl(var(--editor-selection-match))',
    lineHighlight: 'hsl(var(--editor-line-highlight))',
    gutterBackground: 'hsl(var(--editor-bg))',
    gutterForeground: 'hsl(var(--editor-gutter-foreground))',
    gutterBorder: 'hsl(var(--editor-border))',
  },
  styles: [
    { tag: t.comment, color: 'hsl(var(--editor-comment))', fontStyle: 'italic' },
    { tag: t.lineComment, color: 'hsl(var(--editor-comment))', fontStyle: 'italic' },
    { tag: t.blockComment, color: 'hsl(var(--editor-comment))', fontStyle: 'italic' },
    { tag: [t.string, t.special(t.brace)], color: 'hsl(var(--editor-string))' },
    { tag: t.number, color: 'hsl(var(--editor-number))' },
    { tag: t.bool, color: 'hsl(var(--editor-keyword))', fontWeight: 'bold' },
    { tag: t.null, color: 'hsl(var(--editor-keyword))', fontWeight: 'bold' },
    { tag: [t.keyword, t.operator], color: 'hsl(var(--editor-keyword))' },
    { tag: [t.definitionKeyword, t.moduleKeyword], color: 'hsl(var(--editor-keyword))' },
    { tag: t.variableName, color: 'hsl(var(--editor-foreground))' },
    { tag: [t.definition(t.variableName)], color: 'hsl(var(--editor-function))' },
    { tag: t.function(t.variableName), color: 'hsl(var(--editor-function))' },
    { tag: [t.className, t.typeName], color: 'hsl(var(--editor-foreground))', fontWeight: 'bold' },
    { tag: [t.propertyName], color: 'hsl(var(--editor-property))' },
    { tag: [t.regexp], color: 'hsl(var(--editor-string))' },
    { tag: [t.tagName], color: 'hsl(var(--editor-tag))' },
    { tag: [t.attributeName], color: 'hsl(var(--editor-foreground))' },
    { tag: [t.meta], color: 'hsl(var(--editor-meta))' },
    { tag: t.bracket, color: 'hsl(var(--editor-foreground))' },
    { tag: t.punctuation, color: 'hsl(var(--editor-keyword))' },
  ],
});

// Sample code for initial state
const sampleCode = `class Solution:
    def fib(self, n: int) -> int:
        if n == 0:
            return 0
        if n == 1:
            return 1
        return self.fib(n-1)+self.fib(n-2)`;

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
    <div className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-primary">Code Example</p>
          <p className="text-xs text-muted-foreground">Paste your code and run the analyzer.</p>
        </div>
        <div className="hidden text-xs text-muted-foreground sm:block">Ctrl+Enter</div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-code shadow-2xl">
        <div onKeyDown={handleKeyDown as any} className="jetbrains-editor">
        <CodeMirror
          className="jetbrains-editor"
          value={code}
          height="340px"
          extensions={[
            javascript({ jsx: true }),
            EditorView.theme({
              '&': {
                fontSize: '15px',
                fontFamily: 'JetBrains Mono, monospace',
                backgroundColor: 'hsl(var(--editor-bg))',
              },
              '.cm-content': { padding: '1rem 0' },
              '.cm-scroller': { fontFamily: 'JetBrains Mono, monospace', lineHeight: '1.75' },
              '.cm-line': { paddingLeft: '0.5rem' },
              '.cm-gutters': {
                borderRight: '1px solid hsl(var(--editor-border))',
                minWidth: '3rem',
              },
              '.cm-activeLineGutter': {
                backgroundColor: 'hsl(var(--editor-line-highlight))',
                color: 'hsl(var(--editor-foreground))',
              },
              '.cm-activeLine': { backgroundColor: 'hsl(var(--editor-line-highlight))' },
              '.cm-cursor': {
                borderLeftColor: 'hsl(var(--editor-caret))',
                borderLeftWidth: '2px',
              },
              '.cm-matchingBracket': {
                backgroundColor: 'hsl(var(--editor-selection-match))',
                color: 'hsl(var(--editor-foreground))',
                outline: 'none',
                borderRadius: '0.25rem',
              },
              '.cm-selectionMatch': { backgroundColor: 'hsl(var(--editor-selection-match))' },
              '.cm-foldGutter': { color: 'hsl(var(--editor-gutter-foreground))' },
              '.cm-tooltip': {
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
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
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted-foreground">
          {code.split('\n').length} lines
        </span>
        <Button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className="min-w-[11rem] gap-2 rounded-full border border-primary/20 bg-primary px-6 font-mono text-sm text-primary-foreground shadow-[0_14px_32px_-18px_hsl(var(--primary)/0.9)] hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/85 focus-visible:ring-primary/40 disabled:border-primary/10 disabled:bg-primary/70"
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
