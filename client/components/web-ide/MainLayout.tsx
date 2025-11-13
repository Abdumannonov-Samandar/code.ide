import { useState, useRef } from "react";
import { TopNavbar } from "./TopNavbar";
import { FileExplorer, FileTreeNode } from "./FileExplorer";
import { TabsBar, OpenFile } from "./TabsBar";
import { CodeEditor } from "./CodeEditor";
import { Terminal } from "./Terminal";
import { AIAssistant } from "./AIAssistant";
import { PreviewPanel } from "./PreviewPanel";
import { useFileSystem, FileNode } from "@/hooks/useFileSystem";
import JSZip from "jszip";

interface MainLayoutProps {
  projectTitle?: string;
}

export const MainLayout = ({ projectTitle = "Web IDE" }: MainLayoutProps) => {
  const {
    files,
    setCurrentFileId,
    getCurrentFile,
    updateFileContent,
    createFile,
    deleteFile,
    getFileContent,
    loadFilesFromData,
  } = useFileSystem();

  const [openFiles, setOpenFiles] = useState<OpenFile[]>([
    {
      id: "index-html",
      name: "index.html",
      language: "html",
      path: "index.html",
    },
  ]);
  const [activeFileId, setActiveFileId] = useState<string>("index-html");
  const [aiOpen, setAiOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const currentFile = getCurrentFile();
  const currentContent = currentFile?.content || "";

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem("web-ide-files", JSON.stringify(files));
      console.log("✅ Project saved to localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to save to localStorage:", error);
      return false;
    }
  };

  // Create and download ZIP file
  const downloadAsZip = async (): Promise<boolean> => {
    try {
      const zip = new JSZip();

      // Add all files to ZIP
      files.forEach((file) => {
        if (file.content && file.type === "file") {
          zip.file(file.path || file.name, file.content);
        }
      });

      // Add README file with project info
      const readmeContent = `# ${projectTitle}\n\nCreated with Web IDE\n\nFiles:\n${files.map((f) => `- ${f.path || f.name}`).join("\n")}`;
      zip.file("README.md", readmeContent);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectTitle.toLowerCase().replace(/\s+/g, "-")}-${new Date().getTime()}.zip`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log("✅ Project downloaded as ZIP");
      return true;
    } catch (error) {
      console.error("❌ Failed to create ZIP:", error);
      return false;
    }
  };

  // Combined save function
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save to localStorage
      const localStorageSuccess = saveToLocalStorage();

      // Download as ZIP
      const zipSuccess = await downloadAsZip();

      if (localStorageSuccess && zipSuccess) {
        console.log(
          "🎉 Project saved successfully to both localStorage and ZIP",
        );
      } else {
        console.warn("⚠️ Some save operations failed");
      }
    } catch (error) {
      console.error("❌ Save operation failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload (ZIP import)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        if (file.name.endsWith(".zip")) {
          // Handle ZIP file
          const zip = new JSZip();
          const zipData = await zip.loadAsync(arrayBuffer);

          const newFiles: FileNode[] = [];

          // Extract files from ZIP
          for (const [filename, fileData] of Object.entries(zipData.files)) {
            if (!fileData.dir) {
              const content = await fileData.async("text");
              newFiles.push({
                id: `${Date.now()}-${filename}`,
                name: filename.split("/").pop() || filename,
                path: filename,
                content: content,
                language: getLanguageFromFilename(filename),
                type: "file" as const, // ✅ Type ni aniq belgilash
              });
            }
          }

          // Load extracted files into the IDE
          loadFilesFromData(newFiles);

          // Update open files
          if (newFiles.length > 0) {
            const firstFile = newFiles[0];
            setOpenFiles([
              {
                id: firstFile.id,
                name: firstFile.name,
                language: firstFile.language || "text",
                path: firstFile.path,
              },
            ]);
            setActiveFileId(firstFile.id);
          }

          console.log("✅ Project loaded from ZIP");
        } else {
          // Handle single file
          const content = e.target?.result as string;
          const newFile: FileNode = {
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            path: file.name,
            content: content,
            language: getLanguageFromFilename(file.name),
            type: "file" as const, // ✅ Type ni aniq belgilash
          };

          loadFilesFromData([newFile]);
          setOpenFiles([
            {
              id: newFile.id,
              name: newFile.name,
              language: newFile.language || "text",
              path: newFile.path,
            },
          ]);
          setActiveFileId(newFile.id);

          console.log("✅ File loaded:", file.name);
        }

        // Reset file input
        if (event.target) {
          event.target.value = "";
        }
      } catch (error) {
        console.error("❌ Failed to load file:", error);
      }
    };

    if (file.name.endsWith(".zip")) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Helper function to detect language from filename
  const getLanguageFromFilename = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();

    const languageMap: { [key: string]: string } = {
      html: "html",
      htm: "html",
      css: "css",
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      json: "json",
      md: "markdown",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
    };

    return languageMap[extension || ""] || "text";
  };

  const handleFileOpen = (file: FileTreeNode, path: string) => {
    const existingFile = openFiles.find((f) => f.id === file.id);
    if (existingFile) {
      setActiveFileId(existingFile.id);
    } else {
      const newFile: OpenFile = {
        id: file.id,
        name: file.name,
        language: file.language || "javascript",
        path,
      };
      setOpenFiles([...openFiles, newFile]);
      setActiveFileId(newFile.id);
    }
    setCurrentFileId(file.id);
  };

  const handleCloseFile = (fileId: string) => {
    const newFiles = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(newFiles);

    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0]?.id || "");
      setCurrentFileId(newFiles[0]?.id || "");
    }
  };

  const handleCreateFile = (name: string, language: string) => {
    createFile(name, language);
    setOpenFiles((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${name}`,
        name,
        language,
        path: name,
      },
    ]);
  };

  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
    setCurrentFileId(fileId);
  };

  const handleUpdateContent = (content: string) => {
    if (activeFile) {
      updateFileContent(activeFile.id, content);
    }
  };

  // Convert file system to tree structure for explorer
  const getFileTree = (): FileTreeNode[] => {
    return files.map((file) => ({
      ...file,
      path: file.path || file.name,
    })) as FileTreeNode[];
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* Hidden file input for upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".zip,.html,.css,.js,.jsx,.ts,.tsx,.json,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs"
        className="hidden"
      />

      {/* Top Navigation */}
      <TopNavbar
        projectTitle={projectTitle}
        onRun={() => console.log("Run project")}
        onSave={handleSave}
        onUpload={handleUploadClick}
        isSaving={isSaving}
        showAI={true}
        onAIToggle={() => setAiOpen(!aiOpen)}
        aiEnabled={aiOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <FileExplorer
          treeData={getFileTree()}
          width={250}
          onFileOpen={handleFileOpen}
          onCreateFile={handleCreateFile}
          onDeleteFile={deleteFile}
          allowContextMenu={true}
        />

        {/* Center/Right Column - Editor + Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs Bar */}
          <TabsBar
            openFiles={openFiles}
            activeFileId={activeFileId}
            onClose={handleCloseFile}
            onSelectFile={handleSelectFile}
          />

          {/* Editor + Preview Area */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                language={activeFile?.language || "javascript"}
                value={currentContent}
                path={activeFile?.path || "untitled.js"}
                theme="dark"
                onChange={handleUpdateContent}
              />
            </div>

            {/* Preview Panel */}
            {previewOpen && (
              <div className="flex-1 overflow-hidden">
                <PreviewPanel
                  htmlContent={getFileContent("index.html")}
                  cssContent={getFileContent("style.css")}
                  jsContent={getFileContent("script.js")}
                  visible={true}
                  onClose={() => setPreviewOpen(false)}
                />
              </div>
            )}

            {/* Right Sidebar - AI Assistant */}
            {aiOpen && (
              <AIAssistant
                open={true}
                model="gpt-4"
                insertAction={true}
                onClose={() => setAiOpen(false)}
                onInsertCode={(code) =>
                  handleUpdateContent(currentContent + "\n" + code)
                }
                onSendMessage={(msg) => console.log("AI message:", msg)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom - Terminal */}
      {terminalOpen && (
        <Terminal
          visible={true}
          height={240}
          activeTab="console"
          initialOutput="Ready to run your project"
          onClose={() => setTerminalOpen(false)}
          onClear={() => console.log("Clear terminal")}
        />
      )}
    </div>
  );
};
