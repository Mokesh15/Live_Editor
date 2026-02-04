import { useState, useEffect } from "react";

const API_URL = 'http://localhost:3001/api';

const SIDEBAR_STYLES = {
  width: "250px",
  height: "100%",
  borderRight: "2px solid #ff3333",
  backgroundColor: "#1a1a1a",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const SIDEBAR_HEADER = {
  padding: "12px 15px",
  backgroundColor: "#0d0d0d",
  borderBottom: "2px solid #ff3333",
  fontSize: "12px",
  color: "#ff3333",
  fontWeight: "bold",
  fontFamily: '"Courier New", monospace',
  letterSpacing: "1px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const FILE_TREE_STYLES = {
  container: {
    flex: 1,
    overflowY: "auto",
    padding: "5px 0",
    fontFamily: '"Courier New", monospace',
    fontSize: "13px",
  },
  folder: {
    padding: "4px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#e0e0e0",
    userSelect: "none",
    transition: "background 0.15s",
  },
  folderHover: {
    background: "rgba(255, 255, 255, 0.05)",
  },
  file: {
    padding: "4px 10px",
    paddingLeft: "30px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#e0e0e0",
    userSelect: "none",
    transition: "background 0.15s",
    opacity: 0.9,
  },
  fileHover: {
    background: "rgba(255, 255, 255, 0.05)",
  },
  fileSelected: {
    background: "rgba(0, 122, 204, 0.3)",
    color: "#e0e0e0",
  },
  icon: {
    width: "16px",
    textAlign: "center",
    color: "#ff3333",
  },
};

export default function FileExplorer({ onFileSelect, selectedFile }) {
  const [fileSystem, setFileSystem] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({ "src": true, "components": true });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);

  // Load file system from backend on mount
  useEffect(() => {
    loadFileSystem();
  }, []);

  const loadFileSystem = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/directory/vs-clone/project`);
      if (response.ok) {
        const data = await response.json();
        setFileSystem(data.files || {});
      } else {
        // Fallback to default structure if backend not available
        loadDefaultFileSystem();
      }
    } catch (err) {
      console.log('Backend not available, using default files');
      loadDefaultFileSystem();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultFileSystem = () => {
    setFileSystem({
      "src": {
        type: "folder",
        children: {
          "main.js": { type: "file", content: "// Main file\nconsole.log('Hello');" },
          "app.js": { type: "file", content: "// App file\nconst App = () => {};" },
          "style.css": { type: "file", content: "/* Styles */\nbody { margin: 0; }" }
        }
      },
      "components": {
        type: "folder",
        children: {
          "Header.jsx": { type: "file", content: "export default function Header() {}" },
          "Footer.jsx": { type: "file", content: "export default function Footer() {}" }
        }
      },
      "README.md": { type: "file", content: "# Project\nWelcome to the project" },
      "package.json": { type: "file", content: "{\n  \"name\": \"my-project\"\n}" }
    });
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleFileClick = async (fileName, filePath) => {
    try {
      // Try to load from backend with full project path
      const fullFilePath = `vs-clone/project/${filePath || fileName}`;
      const response = await fetch(`${API_URL}/file/${encodeURIComponent(fullFilePath)}`);
      
      if (response.ok) {
        const data = await response.json();
        const content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2);
        onFileSelect({ 
          name: fileName, 
          content: content, 
          path: filePath || fileName 
        });
      } else {
        console.error('Failed to load file:', response.status);
        onFileSelect({ name: fileName, content: "", path: filePath || fileName });
      }
    } catch (err) {
      console.error('Error loading file:', err);
      onFileSelect({ name: fileName, content: "", path: filePath || fileName });
    }
  };

  const createNewFile = async (parentPath) => {
    const fileName = prompt("Enter file name (with extension):");
    if (!fileName) return;

    const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    
    try {
      const response = await fetch(`${API_URL}/file/${encodeURIComponent(fullPath)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' })
      });
      
      if (response.ok) {
        await loadFileSystem();
        setContextMenu(null);
      }
    } catch (err) {
      console.error('Error creating file:', err);
    }
  };

  const createNewFolder = async (parentPath) => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    
    try {
      const response = await fetch(`${API_URL}/directory/${encodeURIComponent(fullPath)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await loadFileSystem();
        setContextMenu(null);
      }
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  const deleteItem = async (itemPath, isFolder) => {
    if (!confirm(`Delete ${isFolder ? 'folder' : 'file'}?`)) return;

    try {
      const response = await fetch(`${API_URL}/file/${encodeURIComponent(itemPath)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadFileSystem();
        setContextMenu(null);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleContextMenu = (e, itemPath, isFolder) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      itemPath,
      isFolder
    });
  };

  const renderItems = (items, level = 0, parentPath = "") => {
    return Object.entries(items).map(([name, item]) => {
      const fullPath = parentPath ? `${parentPath}/${name}` : name;
      
      if (item.type === "folder") {
        const isExpanded = expandedFolders[fullPath];
        return (
          <div key={fullPath}>
            <div
              style={FILE_TREE_STYLES.folder}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.background = ""}
              onClick={() => toggleFolder(fullPath)}
              onContextMenu={(e) => handleContextMenu(e, fullPath, true)}
            >
              <span style={FILE_TREE_STYLES.icon}>
                {isExpanded ? "▼" : "▶"}
              </span>
              <i style={{ color: "#ff3333" }}>📁</i>
              <span>{name}</span>
            </div>
            {isExpanded && (
              <div style={{ paddingLeft: `${(level + 1) * 10}px` }}>
                {renderItems(item.children || {}, level + 1, fullPath)}
              </div>
            )}
          </div>
        );
      } else {
        const isSelected = selectedFile?.path === fullPath;
        return (
          <div
            key={fullPath}
            style={{
              ...FILE_TREE_STYLES.file,
              ...(isSelected ? FILE_TREE_STYLES.fileSelected : {}),
              paddingLeft: `${30 + level * 10}px`
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "";
            }}
            onClick={() => handleFileClick(name, fullPath)}
            onContextMenu={(e) => handleContextMenu(e, fullPath, false)}
          >
            <i style={{ color: "#ff3333", width: "16px" }}>📄</i>
            <span>{name}</span>
          </div>
        );
      }
    });
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newFile = {
            type: "file",
            content: event.target.result
          };
          setFileSystem(prev => ({
            ...prev,
            [file.name]: newFile
          }));
          handleFileClick(file.name, event.target.result);
        };
        reader.readAsText(file);
      });
    };
    input.click();
  };

  return (
    <div style={SIDEBAR_STYLES} onClick={() => setContextMenu(null)}>
      <div style={SIDEBAR_HEADER}>
        <span>📂 EXPLORER</span>
        <button
          onClick={handleOpenFile}
          style={{
            background: "transparent",
            border: "none",
            color: "#ff3333",
            cursor: "pointer",
            fontSize: "14px",
            padding: "4px 8px",
          }}
          title="Open File"
        >
          📂
        </button>
      </div>
      <div style={FILE_TREE_STYLES.container}>
        {renderItems(fileSystem)}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: '#252526',
            border: '1px solid #ff3333',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '8px 0',
              color: '#e0e0e0',
              fontSize: '12px',
              fontFamily: '"Courier New", monospace',
            }}
          >
            <div
              onClick={() => createNewFile(contextMenu.itemPath)}
              style={{
                padding: '6px 16px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 51, 51, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              ➕ New File
            </div>
            {contextMenu.isFolder && (
              <div
                onClick={() => createNewFolder(contextMenu.itemPath)}
                style={{
                  padding: '6px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 51, 51, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                📁 New Folder
              </div>
            )}
            <div
              onClick={() => deleteItem(contextMenu.itemPath, contextMenu.isFolder)}
              style={{
                padding: '6px 16px',
                cursor: 'pointer',
                color: '#ff6666',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 51, 51, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              🗑️ Delete
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
