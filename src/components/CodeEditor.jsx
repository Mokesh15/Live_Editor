import { memo, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const API_URL = 'http://localhost:3001/api';

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  wordWrap: "on",
  fontSize: 14,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  backgroundColor: "#0d0d0d",
  lineNumbersMinChars: 3,
  padding: { top: 12, bottom: 12 },
  bracketPairColorization: { enabled: true },
  renderWhitespace: "selection",
};

const CONTAINER_STYLES = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#0d0d0d",
  overflow: "hidden",
};

const HEADER_STYLES = {
  padding: "8px 15px",
  backgroundColor: "#1a1a1a",
  borderBottom: "2px solid #ff3333",
  fontSize: "12px",
  color: "#a0a0a0",
  fontWeight: "normal",
  fontFamily: '"Courier New", monospace',
  display: "flex",
  alignItems: "center",
  gap: "10px",
  justifyContent: "space-between",
  userSelect: "none",
};

const SAVE_STATUS_STYLES = {
  fontSize: "10px",
  color: "#888",
  fontStyle: "italic",
};

const CodeEditor = memo(function CodeEditor({ code, setCode, currentFile, onSave }) {
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(code);

  // Detect language based on file extension
  const getLanguage = () => {
    if (!currentFile) return 'javascript';
    
    const ext = currentFile.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
    };
    
    return languageMap[ext] || 'javascript';
  };

  // Auto-save to backend
  useEffect(() => {
    if (!currentFile) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      if (code !== lastSavedRef.current && code !== "") {
        const fullPath = `vs-clone/project/${currentFile}`;
        saveToBackend(fullPath, code);
      }
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [code, currentFile]);

  const saveToBackend = async (filePath, content) => {
    try {
      const response = await fetch(`${API_URL}/file/${encodeURIComponent(filePath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (data.success) {
        lastSavedRef.current = content;
        if (onSave) onSave(filePath, content);
      } else {
        console.error('Save failed:', data.message);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleChange = (value) => {
    setCode(value || "");
  };

  return (
    <div style={CONTAINER_STYLES}>
      <div style={HEADER_STYLES}>
        <span>📝 CODE EDITOR</span>
        <span style={SAVE_STATUS_STYLES}>
          {currentFile ? `Editing: ${currentFile}` : 'No file selected'}
        </span>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          height="100%"
          language={getLanguage()}
          theme="vs-dark"
          value={code}
          onChange={handleChange}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
});

export default CodeEditor;
