import { useState, useEffect } from "react";
import LoadBooks from "./components/LoadBooks";
import type { UserBooksMap } from "./types";
import BookDataDisplay from "./components/BookDataDisplay";

interface User {
  username: string;
  id: string;
}

function App() {
  const [userBookData, setUserData] = useState<UserBooksMap | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  console.log("userBookData", userBookData);
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
  const handleBooksLoaded = (booksData: UserBooksMap) => {
    setUserData(booksData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <header className="text-center py-10 px-5 bg-white shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📚 Hardcover Data Viewer
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your Hardcover CSV export to view and analyze your book
          collection
        </p>
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

      <main className="py-10 px-5 mx-auto">
        {/* <ApiTest /> */}
        {/* {!uploadedData ? (
          <CsvUploader onDataLoaded={handleDataLoaded} />
        ) : ( */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex justify-between items-center p-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <h2 className="text-2xl font-semibold">Your Book Collection</h2>
          </div>
          {userBookData && <BookDataDisplay data={userBookData} />}
        </div>
        {/* )} */}
      </main>
    </div>
  );
}

export default App;
