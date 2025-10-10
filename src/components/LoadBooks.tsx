import type { HardcoverData } from "../types";
import { useHardcoverBooks } from "../utils/useHardcoverBooks";
import styles from "./LoadBooks.module.css";

interface LoadBooksProps {
  userId: string;
  onBooksLoaded: (hardcoverData: HardcoverData) => void;
}

const LoadBooks: React.FC<LoadBooksProps> = ({ userId, onBooksLoaded }) => {
  const { isLoading, error, refetch, data } = useHardcoverBooks(
    userId,
    onBooksLoaded
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
    const baseClass = styles.button;
    if (error) {
      return `${baseClass} ${styles.buttonError}`;
    }
    return `${baseClass} ${styles.buttonPrimary}`;
  };

  return (
    <div className={styles.container}>
      {isLoading && <p className={styles.message}>Loading your books...</p>}
      {error && <p className={styles.errorMessage}>Error: {error.message}</p>}
      {data && (
        <p className={styles.successMessage}>Books loaded successfully!</p>
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
