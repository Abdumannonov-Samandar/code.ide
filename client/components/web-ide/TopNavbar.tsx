import { ChevronDown, Download, Menu, Play, Upload, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface TopNavbarProps {
  projectTitle?: string;
  onRun?: () => void;
  onSave?: () => void;
  onUpload?: () => void;
  isSaving?: boolean;
  showAI?: boolean;
  onAIToggle?: () => void;
  aiEnabled?: boolean;
}

export const TopNavbar = ({
  projectTitle = "My Project",
  onRun,
  onSave,
  onUpload,
  isSaving = false,
  showAI = true,
  onAIToggle,
  aiEnabled = false,
}: TopNavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="h-14 bg-gradient-to-b from-slate-900/50 to-slate-900/20 backdrop-blur-xl border-b border-glass-border flex items-center px-4 md:px-6 gap-4 sticky top-0 z-50">
      {/* Left: Logo + Project Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-teal to-neon-cyan flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          ≫
        </div>
        <span className="text-sm font-semibold text-white truncate hidden sm:inline">
          {projectTitle}
        </span>
      </div>

      {/* Center: Breadcrumb (hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 flex-1 min-w-0">
        <span className="truncate">src</span>
        <span className="text-slate-600">/</span>
        <span className="truncate">components</span>
        <span className="text-slate-600">/</span>
        <span className="text-neon-teal truncate">Editor.tsx</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Upload Button */}
        <button
          onClick={onUpload}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-glass hover:bg-white/10 border border-glass-border text-slate-200 font-medium text-sm transition-all duration-300 hover:shadow-glow-blue focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Upload project"
          title="Upload project files or ZIP"
        >
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>

        {/* Save & Download Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-slate-900 font-medium text-sm hover:shadow-glow-purple transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Save and download project"
          title="Save project and download as ZIP"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save & ZIP</span>
            </>
          )}
        </button>

        {/* Run Button */}
        <button
          onClick={onRun}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-gradient-to-r from-neon-teal to-neon-cyan text-slate-900 font-medium text-sm hover:shadow-glow-teal transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Run project"
          title="Run project"
        >
          <Play className="w-4 h-4" />
          <span>Run</span>
        </button>

        {/* AI Toggle */}
        {showAI && (
          <button
            onClick={onAIToggle}
            className={`hidden sm:inline-flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 ${
              aiEnabled
                ? "bg-gradient-to-r from-neon-purple to-neon-cyan shadow-glow-purple text-slate-900"
                : "bg-glass hover:bg-white/10 border border-glass-border text-slate-300"
            }`}
            aria-label="Toggle AI Assistant"
            title="Toggle AI Assistant"
          >
            <span>✨ AI</span>
          </button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle defaultTheme="dark" />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg bg-glass hover:bg-white/10 border border-glass-border text-slate-200 transition-all duration-300"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* User Menu */}
        <button
          className="hidden sm:inline-flex items-center gap-2 h-8 px-2 rounded-lg bg-glass hover:bg-white/10 border border-glass-border text-slate-200 transition-all duration-300"
          aria-label="User menu"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-teal to-neon-purple flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <ChevronDown className="w-4 h-4 hidden sm:block" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-glass-border p-4 flex flex-col gap-2 sm:hidden animate-slide-in">
          {/* Upload in mobile menu */}
          <button
            onClick={() => {
              onUpload?.();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 h-8 px-3 rounded-lg bg-glass hover:bg-white/10 border border-glass-border text-slate-200 font-medium text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>

          {/* Save in mobile menu */}
          <button
            onClick={() => {
              onSave?.();
              setMenuOpen(false);
            }}
            disabled={isSaving}
            className="flex items-center gap-2 h-8 px-3 rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-slate-900 font-medium text-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Save & ZIP
              </>
            )}
          </button>

          {/* Run in mobile menu */}
          <button
            onClick={() => {
              onRun?.();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 h-8 px-3 rounded-lg bg-gradient-to-r from-neon-teal to-neon-cyan text-slate-900 font-medium text-sm"
          >
            <Play className="w-4 h-4" />
            Run
          </button>

          {/* AI in mobile menu */}
          {showAI && (
            <button
              onClick={() => {
                onAIToggle?.();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 h-8 px-3 rounded-lg bg-glass hover:bg-white/10 border border-glass-border text-slate-200 font-medium text-sm"
            >
              <span>✨ AI</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
