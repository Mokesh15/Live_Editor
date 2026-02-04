import { useEffect, useRef } from "react";

// Minimal preview: creates a blob URL from provided HTML and sets iframe.src
export default function Preview({ html }) {
  const iframeRef = useRef(null);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // revoke previous URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (!html) {
      iframe.srcdoc = "";
      return;
    }

    const blob = new Blob([html], { type: "text/html; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    iframe.src = url;

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [html]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d0d0d", borderLeft: "3px solid #ff3333" }}>
      <div style={{ padding: 12, background: "#1a1a1a", color: "#ff3333", fontWeight: "bold", borderBottom: "2px solid #ff3333" }}>LIVE PREVIEW</div>
      <iframe ref={iframeRef} title="Live Preview" sandbox="allow-scripts allow-same-origin" style={{ flex: 1, width: "100%", border: "none" }} />
    </div>
  );
}
