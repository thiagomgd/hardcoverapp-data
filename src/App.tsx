import { useState, useEffect } from "react";
import LoadBooks from "./components/LoadBooks";
import type { HardcoverData } from "./types";
import BookDataDisplay from "./components/BookDataDisplay";
import SeriesDataDisplay from "./components/SeriesDataDisplay";
import CompareDataDisplay from "./components/CompareDataDisplay";
import styles from "./App.module.css";

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
  const [activeTab, setActiveTab] = useState<"books" | "series" | "compare">(
    "books"
  );

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
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>📚 Hardcover Data Viewer</h1>
        {userLoading && (
          <p className={styles.message}>Loading user information...</p>
        )}
        {userError && <p className={styles.errorMessage}>Error: {userError}</p>}
        {user && (
          <>
            <p className={styles.welcomeMessage}>
              Welcome, <strong>{user.username}</strong> (ID: {user.id})
            </p>
            <LoadBooks userId={user.id} onBooksLoaded={handleBooksLoaded} />
          </>
        )}
      </header>

      <main className={styles.main}>
        <div className={styles.contentContainer}>
          {/* Tab Navigation */}
          <div className={styles.tabNav}>
            <button
              onClick={() => setActiveTab("books")}
              className={`${styles.tabButton} ${
                activeTab === "books" ? styles.tabButtonActive : ""
              }`}
            >
              📚 Books
            </button>
            <button
              onClick={() => setActiveTab("series")}
              className={`${styles.tabButton} ${
                activeTab === "series" ? styles.tabButtonActive : ""
              }`}
            >
              📖 Series
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`${styles.tabButton} ${
                activeTab === "compare" ? styles.tabButtonActive : ""
              }`}
            >
              🔄 Compare With Previous Data
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {
              {
                books: <BookDataDisplay data={userBookData} />,
                series: <SeriesDataDisplay data={userBookData} />,
                compare: <CompareDataDisplay currentData={userBookData} />,
              }[activeTab]
            }
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
