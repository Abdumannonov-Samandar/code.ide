import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

export interface FileTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  language?: string;
  icon?: React.ReactNode;
  content?: string;
}

interface FileExplorerProps {
  treeData?: FileTreeNode[];
  collapsed?: boolean;
  width?: string | number;
  onFileOpen?: (file: FileTreeNode, path: string) => void;
  onCreateFile?: (name: string, language: string) => void;
  onDeleteFile?: (fileId: string) => void;
  allowContextMenu?: boolean;
}

const getFileIcon = (name: string): React.ReactNode => {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "jsx":
      return "⚛";
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

interface FileTreeItemProps {
  node: FileTreeNode;
  path: string;
  onFileOpen?: (file: FileTreeNode, path: string) => void;
  onDeleteFile?: (fileId: string) => void;
  allowContextMenu?: boolean;
}

const FileTreeItem = ({
  node,
  path,
  onFileOpen,
  onDeleteFile,
  allowContextMenu,
}: FileTreeItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState(false);

  const currentPath = `${path}/${node.name}`;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div key={node.id}>
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors group relative"
        onDoubleClick={() => {
          if (node.type === "file") {
            onFileOpen?.(node, currentPath);
          } else {
            setExpanded(!expanded);
          }
        }}
        onContextMenu={(e) => {
          if (allowContextMenu) {
            e.preventDefault();
            setContextMenu(!contextMenu);
          }
        }}
      >
        {node.type === "folder" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex-shrink-0 p-0 hover:bg-white/10 rounded"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </button>
        )}
        {node.type === "file" && (
          <span className="flex-shrink-0 w-4 text-center">
            {getFileIcon(node.name)}
          </span>
        )}
        {node.type === "folder" && (
          <span className="flex-shrink-0">
            {expanded ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
          </span>
        )}
        <span className="truncate flex-1">{node.name}</span>

        {/* Context Menu Button */}
        {allowContextMenu && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu(!contextMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}

        {/* Context Menu */}
        {contextMenu && allowContextMenu && (
          <div
            className="absolute right-0 top-full mt-1 bg-slate-800 border border-glass-border rounded-lg shadow-xl z-40 min-w-max"
            onMouseLeave={() => setContextMenu(false)}
          >
            {node.type === "file" && (
              <button
                onClick={() => {
                  onDeleteFile?.(node.id);
                  setContextMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Nested Files/Folders */}
      {node.type === "folder" && expanded && hasChildren && (
        <div className="ml-2 border-l border-glass-border">
          {node.children!.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              path={currentPath}
              onFileOpen={onFileOpen}
              onDeleteFile={onDeleteFile}
              allowContextMenu={allowContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer = ({
  treeData = [],
  collapsed = false,
  width = "250px",
  onFileOpen,
  onCreateFile,
  onDeleteFile,
  allowContextMenu = true,
}: FileExplorerProps) => {
  const [collapsed_, setCollapsed] = useState(collapsed);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("html");

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const name = newFileName.includes(".")
        ? newFileName
        : `${newFileName}.${selectedLanguage === "html" ? "html" : selectedLanguage === "css" ? "css" : "js"}`;
      onCreateFile?.(name, selectedLanguage);
      setNewFileName("");
      setSelectedLanguage("html");
      setShowNewFileDialog(false);
    }
  };

  if (collapsed_) {
    return (
      <div className="w-12 h-full bg-gradient-to-b from-slate-900/50 to-slate-900/20 border-r border-glass-border flex flex-col items-center pt-4 gap-2">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Expand file explorer"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-gradient-to-b from-slate-900/50 to-slate-900/20 border-r border-glass-border flex flex-col overflow-hidden"
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    >
      {/* Header */}
      <div className="h-12 border-b border-glass-border px-4 flex items-center justify-between gap-2 flex-shrink-0">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Files
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFileDialog(true)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="New file"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Collapse"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {treeData.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-8">
            No files yet
          </div>
        ) : (
          treeData.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              path=""
              onFileOpen={onFileOpen}
              onDeleteFile={onDeleteFile}
              allowContextMenu={allowContextMenu}
            />
          ))
        )}
      </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-slate-800 border border-glass-border rounded-lg p-4 w-80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">New File</h3>
              <button
                onClick={() => setShowNewFileDialog(false)}
                className="p-1 hover:bg-white/10 rounded text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateFile();
              }}
              placeholder="filename"
              className="w-full bg-white/5 border border-glass-border rounded px-2 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-teal/50"
            />

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-white/5 border border-glass-border rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-neon-teal/50 *:text-black"
            >
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewFileDialog(false)}
                className="flex-1 px-3 py-1.5 rounded bg-white/5 border border-glass-border text-sm text-slate-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="flex-1 px-3 py-1.5 rounded bg-gradient-to-r from-neon-teal to-neon-cyan text-slate-900 text-sm font-medium hover:shadow-glow-teal transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
