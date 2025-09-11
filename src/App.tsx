import { useState, useEffect } from "react";
import "./App.css";
import LoadBooks from "./components/LoadBooks";

interface User {
  username: string;
  id: string;
}

interface OwnedBooksData {
  success: boolean;
  list?: {
    id: string;
    name: string;
  };
  books?: Array<{
    id: string;
    title: string;
  }>;
  count?: number;
  totalCount?: number;
  pagesFetched?: number;
  error?: string;
  message?: string;
}

function App() {
  const [userBookData, setUserData] = useState<OwnedBooksData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

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

  // Handler for when books are loaded
  const handleBooksLoaded = (booksData: OwnedBooksData) => {
    setUserData(booksData);
  };

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
        {user && (
          <LoadBooks userId={user.id} onBooksLoaded={handleBooksLoaded} />
        )}
      </header>

      <main className="app-main">
        {/* <ApiTest /> */}
        {/* {!uploadedData ? (
          <CsvUploader onDataLoaded={handleDataLoaded} />
        ) : ( */}
        <div className="data-view">
          <div className="data-header">
            <h2>Your Book Collection</h2>
          </div>
          {/* <BookDataDisplay data={uploadedData} /> */}
        </div>
        {/* )} */}
      </main>
    </div>
  );
}

export default App;
