import { useState, useEffect } from "react";
import "./App.css";
import CsvUploader from "./components/CsvUploader";
import BookDataDisplay from "./components/BookDataDisplay";
import ApiTest from "./components/ApiTest";
import type { CsvUploadResult } from "./types";

interface User {
  username: string;
  id: string;
}

function App() {
  const [uploadedData, setUploadedData] = useState<CsvUploadResult | null>(
    null,
  );
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const handleDataLoaded = (result: CsvUploadResult) => {
    setUploadedData(result);
  };

  const handleReset = () => {
    setUploadedData(null);
  };

  // Fetch user information on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        setUserError(null);

        const response = await fetch("/api/user");
        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          setUserError(data.message || "Failed to fetch user information");
        }
      } catch (error) {
        setUserError("Network error: Failed to fetch user information");
        console.error("Error fetching user:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Hardcover Data Viewer</h1>
        <p>
          Upload your Hardcover CSV export to view and analyze your book
          collection
        </p>
        {userLoading && <p>Loading user information...</p>}
        {userError && <p style={{ color: "red" }}>Error: {userError}</p>}
        {user && (
          <p>
            Welcome, <strong>{user.username}</strong> (ID: {user.id})
          </p>
        )}
      </header>

      <main className="app-main">
        <ApiTest />
        {!uploadedData ? (
          <CsvUploader onDataLoaded={handleDataLoaded} />
        ) : (
          <div className="data-view">
            <div className="data-header">
              <h2>Your Book Collection</h2>
              <button onClick={handleReset} className="reset-button">
                Upload New File
              </button>
            </div>
            <BookDataDisplay data={uploadedData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
