import { useState } from "react";

const ApiTest = () => {
  const [healthStatus, setHealthStatus] = useState<string>("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealthStatus(JSON.stringify(data, null, 2));
    } catch (error) {
      setHealthStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/books");
      const data = await response.json();
      setBooks(data.books);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        margin: "20px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h3>🚀 Fastify API Test</h3>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testHealth}
          disabled={loading}
          style={{ marginRight: "10px", padding: "8px 16px" }}
        >
          Test Health Endpoint
        </button>
        <button
          onClick={fetchBooks}
          disabled={loading}
          style={{ padding: "8px 16px" }}
        >
          Fetch Books
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {healthStatus && (
        <div style={{ marginBottom: "20px" }}>
          <h4>Health Status:</h4>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {healthStatus}
          </pre>
        </div>
      )}

      {books.length > 0 && (
        <div>
          <h4>Books from API:</h4>
          <ul>
            {books.map((book) => (
              <li key={book.id}>
                <strong>{book.title}</strong> by {book.author}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
