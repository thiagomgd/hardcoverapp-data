import { useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSaveToken = () => {
    if (token.trim()) {
      localStorage.setItem("hardcoverApiToken", token.trim());
      setSaved(true);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Hardcover API Token</h1>
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="token-input"
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Enter your Hardcover API Token:
        </label>
        <input
          id="token-input"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your API token here..."
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={handleSaveToken}
          disabled={!token.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: token.trim() ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: token.trim() ? "pointer" : "not-allowed",
            fontSize: "16px",
          }}
        >
          Save Token
        </button>
        {saved && (
          <p style={{ color: "green", marginTop: "10px", fontWeight: "bold" }}>
            ✓ Token saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
