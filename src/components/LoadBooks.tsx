import type { UserBooksMap } from "../types";
import { useHardcoverBooks } from "../utils/useHardcoverBooks";

interface LoadBooksProps {
  userId: string;
  onBooksLoaded: (books: UserBooksMap) => void;
}

const LoadBooks: React.FC<LoadBooksProps> = ({ userId, onBooksLoaded }) => {
  const { isLoading, error, refetch } = useHardcoverBooks(
    userId,
    onBooksLoaded,
  );

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <p className="text-gray-600">Loading your books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <p className="text-red-600 mb-4">Error: {error.message}</p>
        <button
          onClick={handleRetry}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleRetry}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Load Books
      </button>
    </div>
  );
};

export default LoadBooks;
