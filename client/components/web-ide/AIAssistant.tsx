import { X, Send, Copy, Lightbulb, Code } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeSnippet?: string;
  language?: string;
}

interface AIAssistantProps {
  open?: boolean;
  model?: string;
  endpoint?: string;
  insertAction?: boolean;
  onClose?: () => void;
  onInsertCode?: (code: string) => void;
  onSendMessage?: (message: string) => void;
}

export const AIAssistant = ({
  open = false,
  // model = "gpt-4",
  // endpoint,
  insertAction = true,
  onClose,
  onInsertCode,
  onSendMessage,
}: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI coding assistant. I can help you write code, debug issues, and answer questions about your project.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    onSendMessage?.(input);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'd help you with that! Here's a suggestion:",
        codeSnippet:
          "const greeting = (name: string) => {\n  return `Hello, ${name}!`;\n};",
        language: "typescript",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!open) return null;

  return (
    <div className="w-80 h-full bg-gradient-to-b from-slate-900/50 to-slate-900/20 border-l border-glass-border flex flex-col hidden lg:flex">
      {/* Header */}
      <div className="h-12 border-b border-glass-border px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-neon-purple" />
          <span className="text-sm font-semibold text-white">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          title="Close AI assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-neon-teal to-neon-cyan text-slate-900"
                  : "bg-white/10 border border-glass-border text-slate-200"
              } rounded-lg p-3`}
            >
              <p className="text-sm">{msg.content}</p>

              {/* Code Snippet */}
              {msg.codeSnippet && (
                <div className="mt-3 bg-slate-900/50 rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      {msg.language}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          handleCopy(msg.codeSnippet!, msg.id)
                        }
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {insertAction && (
                        <button
                          onClick={() => onInsertCode?.(msg.codeSnippet!)}
                          className="p-1 rounded hover:bg-neon-teal/20 text-neon-teal hover:text-neon-teal transition-colors"
                          title="Insert into editor"
                        >
                          <Code className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                    {msg.codeSnippet}
                  </pre>
                  {copiedId === msg.id && (
                    <div className="text-xs text-green-400 mt-2">
                      ✓ Copied to clipboard
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-glass-border rounded-lg p-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-neon-teal rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-neon-teal rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-neon-teal rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="h-16 border-t border-glass-border px-3 py-3 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 bg-white/5 border border-glass-border rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-teal/50 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="p-2 rounded bg-gradient-to-r from-neon-teal to-neon-cyan text-slate-900 hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
