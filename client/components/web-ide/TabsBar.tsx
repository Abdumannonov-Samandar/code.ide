import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

export interface OpenFile {
  id: string;
  name: string;
  language: string;
  path: string;
}

interface TabsBarProps {
  openFiles?: OpenFile[];
  activeFileId?: string;
  onClose?: (fileId: string) => void;
  onSelectFile?: (fileId: string) => void;
  onReorder?: (files: OpenFile[]) => void;
}

export const TabsBar = ({
  openFiles = [],
  activeFileId,
  onClose,
  onSelectFile,
}: TabsBarProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const getFileIcon = (name: string): string => {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "tsx":
      case "jsx":
        return "��";
      case "ts":
      case "js":
        return "📜";
      case "json":
        return "{ }";
      case "css":
        return "🎨";
      case "html":
        return "🏷";
      case "md":
        return "📝";
      default:
        return "📄";
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (draggedId && draggedId !== targetId) {
      const draggedIndex = openFiles.findIndex((f) => f.id === draggedId);
      const targetIndex = openFiles.findIndex((f) => f.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newFiles = [...openFiles];
        [newFiles[draggedIndex], newFiles[targetIndex]] = [
          newFiles[targetIndex],
          newFiles[draggedIndex],
        ];
      }
    }
    setDraggedId(null);
  };

  const visibleTabs = openFiles.slice(0, 5);
  const hiddenTabs = openFiles.slice(5);

  return (
    <div className="h-10 bg-gradient-to-r from-slate-900/30 to-slate-900/10 border-b border-glass-border flex items-center gap-1 px-2 overflow-x-auto overflow-y-hidden flex-shrink-0">
      {openFiles.length === 0 ? (
        <div className="text-xs text-slate-500 flex items-center h-full">
          No files open
        </div>
      ) : (
        <>
          {visibleTabs.map((file) => (
            <div
              key={file.id}
              draggable
              onDragStart={() => handleDragStart(file.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(file.id)}
              onClick={() => onSelectFile?.(file.id)}
              className={`group flex items-center gap-1.5 px-3 h-8 rounded-t-lg cursor-pointer transition-all duration-200 text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                activeFileId === file.id
                  ? "bg-white/10 border border-glass-border border-b-0 text-white shadow-glow-teal"
                  : "bg-white/5 text-slate-400 hover:bg-white/8 hover:text-slate-300"
              }`}
            >
              <span>{getFileIcon(file.name)}</span>
              <span className="truncate max-w-[100px]">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.(file.id);
                }}
                className="p-0.5 rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Close file"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {hiddenTabs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 px-2 h-8 rounded-t-lg bg-white/5 text-slate-400 hover:bg-white/8 hover:text-slate-300 text-xs font-medium transition-all"
              >
                <span>+{hiddenTabs.length}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-0 bg-slate-800 border border-glass-border rounded-lg shadow-xl z-40 min-w-max">
                  {hiddenTabs.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => {
                        onSelectFile?.(file.id);
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-left"
                    >
                      <span>{getFileIcon(file.name)}</span>
                      <span>{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
