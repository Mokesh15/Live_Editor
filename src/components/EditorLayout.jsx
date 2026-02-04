import { useState, useMemo } from "react";
import CodeEditor from "./CodeEditor";
import Preview from "./Preview";
import AIChat from "./AIChat";
import FileExplorer from "./FileExplorer";

// Constants for theme colors
const THEME = {
  dark: "#0d0d0d",
  darker: "#1a1a1a",
  red: "#ff3333",
  darkRed: "#330000",
};

const HEADER_STYLES = {
  padding: "15px 20px",
  backgroundColor: THEME.dark,
  borderBottom: "3px solid " + THEME.red,
  color: THEME.red,
  fontSize: "20px",
  fontWeight: "bold",
  textShadow: "0 0 10px #ff0000",
  letterSpacing: "2px",
};

const EDITOR_CONTAINER = {
  flex: 1,
  height: "100%",
  display: "flex",
  overflow: "hidden",
};

// Code editor section with embedded file explorer
const CODE_SECTION = {
  flex: 1,
  height: "100%",
  borderRight: "2px solid #ff3333",
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
};

// File explorer panel (embedded in code section, left side)
const FILE_PANEL_STYLES = {
  height: "100%",
  borderRight: "2px solid #ff3333",
  backgroundColor: "#1a1a1a",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "width 0.3s ease",
  flex: "0 0 auto",
};

const EDITOR_WRAPPER = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const FILE_PANEL_HEADER = {
  padding: "8px 12px",
  backgroundColor: "#0d0d0d",
  borderBottom: "2px solid #ff3333",
  color: "#ff3333",
  fontSize: "12px",
  fontWeight: "bold",
  userSelect: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
};

const SHOW_FILES_BUTTON = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "#ff3333",
  border: "none",
  color: "#1a1a1a",
  width: "30px",
  height: "50px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "0",
  borderRadius: "0 4px 4px 0",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const FILE_TOGGLE_BUTTON = {
  backgroundColor: "#ff3333",
  border: "none",
  color: "#1a1a1a",
  width: "28px",
  height: "28px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
  padding: "0",
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const PREVIEW_STYLES = {
  flex: 1,
  height: "100%",
  borderRight: "2px solid #ff3333",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "inset 0 0 20px rgba(255, 51, 51, 0.1)",
};

const LAYOUT_STYLES = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: '"Courier New", monospace',
    backgroundColor: THEME.darker,
  },
};

const DEFAULT_CODE = `function App() {
  return (
    <div style={{ textAlign: 'center', padding: '50px', background: 'linear-gradient(135deg, #1a1a1a 0%, #330000 100%)', minHeight: '100vh', fontFamily: '"Courier New", monospace', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: '#ff3333', textShadow: '0 0 20px #ff0000', fontSize: '64px', fontWeight: 'bold', letterSpacing: '3px' }}>Welcome to FYX-HUB</h1>
    </div>
  );
}`;

export default function EditorLayout() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePanel, setShowFilePanel] = useState(true);

  const handleFileSelect = (file) => {
    console.log('File selected:', file);
    setSelectedFile(file);
    const contentToSet = file.content || "";
    setCode(contentToSet);
  };

  const handleSave = (filePath, content) => {
    // File was saved successfully
    console.log(`File saved: ${filePath}`);
  };

  // Memoize preview content to prevent unnecessary recalculations
  const previewHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FYX-HUB Preview</title>
</head>
<body style="margin:0; padding:0; font-family: Arial;">
  <div id="root"></div>
  
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  
  <script type="text/babel">
    try {
      ${code}
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    } catch(error) {
      document.getElementById('root').innerHTML = '<div style="color: #ff3333; padding: 20px; font-family: monospace; white-space: pre-wrap;">' + error.toString() + '</div>';
      console.error('React Error:', error);
    }
  <\/script>
</body>
</html>`;
  }, [code]);

  return (
    <div style={LAYOUT_STYLES.container}>
      <header style={HEADER_STYLES}>
        FYX-HUB LIVE CODE EDITOR
      </header>

      <div style={EDITOR_CONTAINER}>
        {/* Code Section with Embedded File Explorer */}
        <div style={CODE_SECTION}>
          {/* File Explorer Panel (Left Side - Collapsible) */}
          <div style={{
            ...FILE_PANEL_STYLES,
            width: showFilePanel ? "200px" : "0px",
            minWidth: showFilePanel ? "200px" : "0px",
          }}>
            {/* File Panel Header with Toggle */}
            <div style={FILE_PANEL_HEADER}>
              <span>📂 FILES</span>
              <button
                onClick={() => setShowFilePanel(!showFilePanel)}
                style={FILE_TOGGLE_BUTTON}
                title="Hide Files"
              >
                ◀
              </button>
            </div>

            {/* File Explorer Content */}
            <div style={{ flex: 1, overflow: "auto" }}>
              <FileExplorer onFileSelect={handleFileSelect} selectedFile={selectedFile} />
            </div>
          </div>

          {/* Code Editor Wrapper */}
          <div style={EDITOR_WRAPPER}>
            {/* Show Files Button (when hidden) */}
            {!showFilePanel && (
              <button
                onClick={() => setShowFilePanel(true)}
                style={SHOW_FILES_BUTTON}
                title="Show Files"
              >
                ▶
              </button>
            )}

            {/* Code Editor */}
            <CodeEditor 
              code={code} 
              setCode={setCode} 
              currentFile={selectedFile?.path || selectedFile?.name}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={PREVIEW_STYLES}>
          <Preview html={previewHtml} />
        </div>

        {/* AI Chat */}
        <AIChat codeContext={code} />
      </div>
    </div>
  );
}
