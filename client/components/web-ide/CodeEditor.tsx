import { File, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CodeEditorProps {
  language?: string;
  value?: string;
  path?: string;
  theme?: "light" | "dark";
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor = ({
  language = "javascript",
  value = "",
  path = "untitled.js",
  // theme = "dark",
  onChange,
  readOnly = false,
}: CodeEditorProps) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    if (textareaRef.current) {
      const lines = (value || "").split("\n").length;
      setLineCount(lines);
    }
  }, [value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + "\t" + value.substring(end);
        onChange?.(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      }
    }
  };

  // const lines = (value || "").split("\n");

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900/50 to-slate-900/20">
      {/* Editor Header */}
      <div className="h-10 border-b border-glass-border px-4 flex items-center justify-between gap-2 flex-shrink-0 bg-white/5">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <File className="w-4 h-4 text-slate-500" />
          <span className="font-mono text-xs">{path}</span>
          <span className="text-slate-600 text-xs ml-2">•</span>
          <span className="text-slate-500 text-xs uppercase tracking-wider ml-2">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          title="Copy code"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-900/20 border-r border-glass-border px-3 py-4 text-right select-none flex-shrink-0 overflow-hidden">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className="text-xs text-slate-600 leading-6 font-mono h-6"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={readOnly}
          spellCheck="false"
          className="flex-1 bg-transparent p-4 font-mono text-sm text-slate-200 leading-6 resize-none focus:outline-none overflow-x-auto disabled:opacity-75"
          style={{
            fontFamily: '"Fira Code", "Courier New", monospace',
            tabSize: 2,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-slate-900/30 border-t border-glass-border px-4 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <div className="flex gap-4">
          <span>Ln {lineCount}, Col 1</span>
          <span className="uppercase tracking-wider">{language}</span>
        </div>
        {copied && (
          <span className="text-green-400 animate-fade-in">✓ Copied!</span>
        )}
      </div>
    </div>
  );
};
