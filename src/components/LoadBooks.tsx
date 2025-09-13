import type { HardcoverData } from "../types";
import { useHardcoverBooks } from "../utils/useHardcoverBooks";

interface LoadBooksProps {
  userId: string;
  onBooksLoaded: (hardcoverData: HardcoverData) => void;
}

const LoadBooks: React.FC<LoadBooksProps> = ({ userId, onBooksLoaded }) => {
  const { isLoading, error, refetch, data } = useHardcoverBooks(
    userId,
    onBooksLoaded,
  );

  const handleLoadBooks = () => {
    refetch();
  };

  // Determine button text based on state
  const getButtonText = () => {
    if (isLoading) return "Loading...";
    if (error) return "Retry";
    if (data) return "Reload Books";
    return "Load Books";
  };

  // Determine button styling based on state
  const getButtonClass = () => {
    if (error) {
      return "bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors";
    }
    return "bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors";
  };

  return (
    <div className="mt-6">
      {isLoading && <p className="text-gray-600 mb-4">Loading your books...</p>}
      {error && <p className="text-red-600 mb-4">Error: {error.message}</p>}
      {data && (
        <p className="text-green-600 mb-4">Books loaded successfully!</p>
      )}
      <button
        onClick={handleLoadBooks}
        disabled={isLoading}
        className={getButtonClass()}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default LoadBooks;
