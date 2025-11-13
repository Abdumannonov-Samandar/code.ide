import { useState, useCallback, useEffect } from "react";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
  children?: FileNode[];
  path: string;
}

const STORAGE_KEY = "web-ide-files";

const defaultFiles: FileNode[] = [
  {
    id: "index-html",
    name: "index.html",
    type: "file",
    language: "html",
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web IDE</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Web IDE</h1>
        <p>Edit your HTML, CSS, and JavaScript files and see live results!</p>
        <button onclick="greet()">Click Me</button>
        <p id="output"></p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
  },
  {
    id: "style-css",
    name: "style.css",
    type: "file",
    language: "css",
    path: "style.css",
    content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 600px;
}

h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2.5em;
}

p {
    color: #666;
    margin-bottom: 20px;
    font-size: 1.1em;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 5px;
    font-size: 1em;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

#output {
    margin-top: 20px;
    font-weight: bold;
    color: #667eea;
}`,
  },
  {
    id: "script-js",
    name: "script.js",
    type: "file",
    language: "javascript",
    path: "script.js",
    content: `function greet() {
    const output = document.getElementById('output');
    output.textContent = '✨ Hello! You clicked the button!';
    output.style.animation = 'none';
    setTimeout(() => {
        output.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);
}

// Add animation
const style = document.createElement('style');
style.textContent = \`
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
\`;
document.head.appendChild(style);`,
  },
];

export const useFileSystem = () => {
  const [files, setFiles] = useState<FileNode[]>(defaultFiles);
  const [currentFileId, setCurrentFileId] = useState<string>("index-html");

  // Load files from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch {
        console.error("Failed to load files from storage");
      }
    }
  }, []);

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  const getCurrentFile = useCallback(() => {
    const findFile = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.id === currentFileId) return node;
        if (node.children) {
          const found = findFile(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFile(files);
  }, [files, currentFileId]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles((prevFiles) => {
      const updateNodes = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.id === fileId && node.type === "file") {
            return { ...node, content };
          }
          if (node.children) {
            return { ...node, children: updateNodes(node.children) };
          }
          return node;
        });
      };
      return updateNodes(prevFiles);
    });
  }, []);

  const createFile = useCallback(
    (name: string, language: string = "javascript", parentId?: string) => {
      const id = `${Date.now()}-${name}`;
      const newFile: FileNode = {
        id,
        name,
        type: "file",
        language,
        path: name,
        content: "",
      };

      setFiles((prevFiles) => {
        if (parentId) {
          const updateNodes = (nodes: FileNode[]): FileNode[] => {
            return nodes.map((node) => {
              if (node.id === parentId && node.type === "folder") {
                return {
                  ...node,
                  children: [...(node.children || []), newFile],
                };
              }
              if (node.children) {
                return { ...node, children: updateNodes(node.children) };
              }
              return node;
            });
          };
          return updateNodes(prevFiles);
        } else {
          return [...prevFiles, newFile];
        }
      });

      setCurrentFileId(id);
      return id;
    },
    [],
  );

  const deleteFile = useCallback(
    (fileId: string) => {
      setFiles((prevFiles) => {
        const deleteNodes = (nodes: FileNode[]): FileNode[] => {
          return nodes
            .filter((node) => node.id !== fileId)
            .map((node) => {
              if (node.children) {
                return { ...node, children: deleteNodes(node.children) };
              }
              return node;
            });
        };
        return deleteNodes(prevFiles);
      });

      if (currentFileId === fileId) {
        setCurrentFileId("index-html");
      }
    },
    [currentFileId],
  );

  const getAllFiles = useCallback((): FileNode[] => {
    const flatten = (nodes: FileNode[]): FileNode[] => {
      return nodes.flatMap((node) => [
        node,
        ...(node.children ? flatten(node.children) : []),
      ]);
    };
    return flatten(files).filter((f) => f.type === "file");
  }, [files]);

  const getFileContent = useCallback(
    (filename: string): string => {
      const file = getAllFiles().find((f) => f.name === filename);
      return file?.content || "";
    },
    [getAllFiles],
  );

  const loadFilesFromData = useCallback((newFiles: FileNode[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      setCurrentFileId(newFiles[0].id);
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setFiles(defaultFiles);
    setCurrentFileId("index-html");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    files,
    currentFileId,
    setCurrentFileId,
    getCurrentFile,
    updateFileContent,
    createFile,
    deleteFile,
    getAllFiles,
    getFileContent,
    loadFilesFromData,
    resetToDefaults,
  };
};
