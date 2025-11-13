import { X, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface PreviewPanelProps {
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  visible?: boolean;
  onClose?: () => void;
}

export const PreviewPanel = ({
  htmlContent,
  cssContent,
  jsContent,
  visible = true,
  onClose,
}: PreviewPanelProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!visible || !iframeRef.current) return;

    try {
      setError("");

      // Combine HTML, CSS, and JS
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <style>
                ${cssContent}
            </style>
        </head>
        <body>
            ${htmlContent}
            <script>
                try {
                    ${jsContent}
                } catch(e) {
                    console.error('Runtime error:', e.message);
                    const errorDiv = document.createElement('div');
                    errorDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #dc2626; color: white; padding: 10px 15px; border-radius: 5px; font-family: monospace; z-index: 10000;';
                    errorDiv.textContent = 'Error: ' + e.message;
                    document.body.appendChild(errorDiv);
                }
            </script>
        </body>
        </html>
      `;

      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    }
  }, [htmlContent, cssContent, jsContent, visible]);

  if (!visible) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 dark:bg-slate-900 dark:border-glass-border">
      {/* Header */}
      <div className="h-10 border-b border-glass-border px-4 flex items-center justify-between gap-2 flex-shrink-0 bg-white/5">
        <span className="text-sm font-semibold text-slate-300">Live Preview</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (iframeRef.current) {
                // iframeRef.current.src = iframeRef.current.src;
              }
            }}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 max-w-sm">
              <p className="font-semibold mb-2">Preview Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-modals"
            title="Live preview"
          />
        )}
      </div>
    </div>
  );
};
