import { useState, useRef, useEffect } from "react";

const CHAT_STYLES = {
  container: {
    width: "33.33%",
    height: "100%",
    borderLeft: "3px solid #ff3333",
    backgroundColor: "#0d0d0d",
    display: "flex",
    flexDirection: "column",
    boxShadow: "inset 0 0 20px rgba(255, 51, 51, 0.1)",
  },
  header: {
    padding: "12px 15px",
    backgroundColor: "#1a1a1a",
    color: "#ff3333",
    fontSize: "13px",
    fontWeight: "bold",
    fontFamily: '"Courier New", monospace',
    borderBottom: "2px solid #ff3333",
    textShadow: "0 0 5px #ff0000",
    letterSpacing: "1px",
    flexShrink: 0,
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  messageUser: {
    alignSelf: "flex-end",
    backgroundColor: "#ff3333",
    color: "#0d0d0d",
    padding: "8px 12px",
    borderRadius: "6px",
    maxWidth: "85%",
    fontSize: "12px",
    fontFamily: '"Courier New", monospace',
    wordWrap: "break-word",
  },
  messageAI: {
    alignSelf: "flex-start",
    backgroundColor: "#1a1a1a",
    color: "#ff3333",
    padding: "8px 12px",
    borderRadius: "6px",
    maxWidth: "85%",
    fontSize: "12px",
    fontFamily: '"Courier New", monospace',
    borderLeft: "3px solid #ff3333",
    wordWrap: "break-word",
  },
  inputSection: {
    padding: "12px",
    borderTop: "2px solid #ff3333",
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    backgroundColor: "#1a1a1a",
    color: "#ff3333",
    border: "1px solid #ff3333",
    borderRadius: "4px",
    fontFamily: '"Courier New", monospace',
    fontSize: "12px",
    outline: "none",
  },
  button: {
    padding: "8px 12px",
    backgroundColor: "#ff3333",
    color: "#0d0d0d",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: '"Courier New", monospace',
    fontSize: "12px",
    transition: "0.2s",
  },
  loadingDot: {
    display: "inline-block",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#ff3333",
    marginLeft: "2px",
    animation: "blink 1.4s infinite",
  },
};

// Add keyframe animation for loading dots
const keyframes = `
  @keyframes blink {
    0%, 20%, 50%, 80%, 100% { opacity: 1; }
    40% { opacity: 0.3; }
    60% { opacity: 0.3; }
  }
`;

const AIChat = ({ codeContext }) => {
  const [messages, setMessages] = useState([
    { type: "ai", text: "Hey! I'm your AI coding assistant powered by OpenRouter. Ask me anything about the code! 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          codeContext: codeContext || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI request failed");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { type: "ai", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: `Error: ${error.message}\n\nTo fix:\n1. Set OPENROUTER_API_KEY: setx OPENROUTER_API_KEY "sk-or-..."\n2. Restart terminals\n3. Start backend: cd d:\\preview\\fyx-ai && node server.js\n4. Start frontend: cd d:\\preview\\live-editor && npm run dev`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={CHAT_STYLES.container}>
        <div style={CHAT_STYLES.header}>FYX AI CHAT</div>

        <div style={CHAT_STYLES.messagesContainer}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={msg.type === "user" ? CHAT_STYLES.messageUser : CHAT_STYLES.messageAI}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={CHAT_STYLES.messageAI}>
              Thinking
              <span style={CHAT_STYLES.loadingDot}></span>
              <span style={CHAT_STYLES.loadingDot}></span>
              <span style={CHAT_STYLES.loadingDot}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={CHAT_STYLES.inputSection}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage(e)}
            placeholder="Ask AI about code..."
            style={CHAT_STYLES.input}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            style={CHAT_STYLES.button}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = "#ff6666";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#ff3333";
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChat;
