import { useState, useEffect, useCallback } from "react";

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

interface LoadBooksProps {
  userId: string;
  onBooksLoaded: (books: OwnedBooksData) => void;
}

const LoadBooks: React.FC<LoadBooksProps> = ({ userId, onBooksLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booksData, setBooksData] = useState<OwnedBooksData | null>(null);

  const loadOwnedBooks = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Note: In a real app, you'd want to get the token from user authentication
      // For now, we'll let the server use the environment variable
      const response = await fetch(
        `/api/owned?userID=${encodeURIComponent(userId)}`,
      );
      const data: OwnedBooksData = await response.json();

      if (response.ok && data.success) {
        setBooksData(data);
        onBooksLoaded(data);
      } else {
        setError(data.error || "Failed to load owned books");
      }
    } catch (err) {
      setError("Network error: Failed to load owned books");
      console.error("Error loading owned books:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load books when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      loadOwnedBooks();
    }
  }, [userId, loadOwnedBooks]);

  if (loading) {
    return (
      <div className="load-books">
        <p>Loading your owned books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="load-books">
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={loadOwnedBooks}>Retry</button>
      </div>
    );
  }

  return (
    <div className="load-books">
      <button onClick={loadOwnedBooks}>Load Owned Books</button>
      {booksData && booksData.success && (
        <div>
          <p>
            Loaded {booksData.count} owned books from "{booksData.list?.name}"
            list
          </p>
          <p>Total books in list: {booksData.totalCount}</p>
          <p>Pages fetched: {booksData.pagesFetched}</p>
        </div>
      )}
    </div>
  );
};

export default LoadBooks;
