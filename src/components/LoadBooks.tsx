import { useHardcoverBooks } from "../utils/useHardcoverBooks";

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
  const {
    data: booksData,
    isLoading,
    error,
    refetch,
  } = useHardcoverBooks(userId, onBooksLoaded);

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="load-books">
        <p>Loading your owned books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="load-books">
        <p style={{ color: "red" }}>Error: {error.message}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div className="load-books">
      <button onClick={handleRetry}>Load Owned Books</button>
      {booksData && booksData.success && (
        <div>
          <p>
            Loaded {booksData.count} owned books from "{booksData.list?.name}"
            list
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadBooks;
