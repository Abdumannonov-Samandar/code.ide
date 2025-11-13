import { X, Trash2, AlertCircle, Monitor } from "lucide-react";
import { useState } from "react";

interface TerminalProps {
  initialOutput?: string;
  visible?: boolean;
  height?: string | number;
  activeTab?: "console" | "errors" | "network";
  onClose?: () => void;
  onClear?: () => void;
}

interface TerminalMessage {
  type: "log" | "error" | "warn" | "info";
  message: string;
  timestamp: Date;
}

export const Terminal = ({
  initialOutput = "",
  visible = true,
  height = "240px",
  activeTab: initialTab = "console",
  onClose,
  onClear,
}: TerminalProps) => {
  const [activeTab, setActiveTab] = useState<"console" | "errors" | "network">(
    initialTab
  );
  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      type: "info",
      message: "▶ Development server running on http://localhost:5173",
      timestamp: new Date(),
    },
    {
      type: "log",
      message: initialOutput || "Ready to run your project",
      timestamp: new Date(),
    },
  ]);

  const handleClear = () => {
    setMessages([]);
    onClear?.();
  };

  const getMessageColor = (type: TerminalMessage["type"]) => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-slate-300";
    }
  };

  const getMessageIcon = (type: TerminalMessage["type"]) => {
    switch (type) {
      case "error":
        return "✕";
      case "warn":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return ">";
    }
  };

  if (!visible) return null;

  const heightValue =
    typeof height === "number" ? `${height}px` : (height as string);

  return (
    <div
      className="bg-gradient-to-b from-slate-900/50 to-slate-900/20 border-t border-glass-border flex flex-col flex-shrink-0"
      style={{ height: heightValue }}
    >
      {/* Terminal Header */}
      <div className="h-10 border-b border-glass-border px-3 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <button
            onClick={() => setActiveTab("console")}
            className={`px-3 h-8 rounded-t text-xs font-medium transition-all ${
              activeTab === "console"
                ? "bg-white/10 border border-glass-border border-b-0 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Console
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`px-3 h-8 rounded-t text-xs font-medium transition-all ${
              activeTab === "errors"
                ? "bg-white/10 border border-glass-border border-b-0 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Errors
          </button>
          <button
            onClick={() => setActiveTab("network")}
            className={`px-3 h-8 rounded-t text-xs font-medium transition-all ${
              activeTab === "network"
                ? "bg-white/10 border border-glass-border border-b-0 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Network
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto font-mono text-xs p-3 space-y-1">
        {activeTab === "console" && messages.length > 0 ? (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${getMessageColor(msg.type)}`}>
              <span className="text-slate-600 flex-shrink-0">
                {getMessageIcon(msg.type)}
              </span>
              <span className="flex-1">{msg.message}</span>
              <span className="text-slate-600 text-xs">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : activeTab === "errors" ? (
          <div className="flex items-center justify-center h-full text-slate-500 flex-col gap-2">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <span className="text-xs">No errors</span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 flex-col gap-2">
            <Monitor className="w-8 h-8 opacity-50" />
            <span className="text-xs">No network requests</span>
          </div>
        )}
      </div>
    </div>
  );
};
