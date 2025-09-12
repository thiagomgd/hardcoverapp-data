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
    <div className="m-5 p-5 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-xl font-semibold mb-5">🚀 Fastify API Test</h3>

      <div className="mb-5">
        <button
          onClick={testHealth}
          disabled={loading}
          className="mr-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          Test Health Endpoint
        </button>
        <button
          onClick={fetchBooks}
          disabled={loading}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          Fetch Books
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}

      {healthStatus && (
        <div className="mb-5">
          <h4 className="font-semibold mb-2">Health Status:</h4>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {healthStatus}
          </pre>
        </div>
      )}

      {books.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Books from API:</h4>
          <ul className="space-y-1">
            {books.map((book) => (
              <li key={book.id} className="text-gray-700">
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
