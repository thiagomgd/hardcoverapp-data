import { useState, useEffect } from "react";
import LoadBooks from "./components/LoadBooks";
import type { HardcoverData } from "./types";
import BookDataDisplay from "./components/BookDataDisplay";
import SeriesDataDisplay from "./components/SeriesDataDisplay";

interface User {
  username: string;
  id: string;
}

function App() {
  const [userBookData, setUserData] = useState<HardcoverData | undefined>(
    undefined
  );
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"books" | "series">("books");

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
  const handleBooksLoaded = (booksData: HardcoverData) => {
    setUserData(booksData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <header className="text-center py-10 px-5 bg-white shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📚 Hardcover Data Viewer
        </h1>
        {userLoading && (
          <p className="mt-4 text-gray-600">Loading user information...</p>
        )}
        {userError && <p className="mt-4 text-red-600">Error: {userError}</p>}
        {user && (
          <p className="mt-4 text-gray-700">
            Welcome, <strong>{user.username}</strong> (ID: {user.id})
          </p>
        )}
        {user && (
          <LoadBooks userId={user.id} onBooksLoaded={handleBooksLoaded} />
        )}
      </header>

      <main className="py-10 px-5 mx-auto max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("books")}
                className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "books"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                📚 Books
              </button>
              <button
                onClick={() => setActiveTab("series")}
                className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "series"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                📖 Series
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "books" && <BookDataDisplay data={userBookData} />}
            {activeTab === "series" && (
              <SeriesDataDisplay data={userBookData} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
