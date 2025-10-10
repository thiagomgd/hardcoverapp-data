import React, { useState } from "react";
import type { HardcoverData, EditionInfo } from "../types";
import BookCard from "./BookCard";
import styles from "./BookDataDisplay.module.css";

interface BookDataDisplayContentProps {
  data: HardcoverData;
}
interface BookDataDisplayProps {
  data?: HardcoverData;
}

const BookDataDisplayContent: React.FC<BookDataDisplayContentProps> = ({
  data,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [checksFilter, setChecksFilter] = useState<string>("none");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "author" | "rating">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(20);

  // Convert UserBooksMap to array for processing
  const books = Object.values(data.books);

  const filteredAndSortedBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author &&
          book.author.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter logic
      let matchesStatus = true;
      if (statusFilter !== "all") {
        switch (statusFilter) {
          case "want-to-read":
            matchesStatus = book.statusId === 1;
            break;
          case "currently-reading":
            matchesStatus = book.statusId === 2;
            break;
          case "read":
            matchesStatus = book.statusId === 3;
            break;
          case "paused":
            matchesStatus = book.statusId === 4;
            break;
          case "did-not-finish":
            matchesStatus = book.statusId === 5;
            break;
          case "ignored":
            matchesStatus = book.statusId === 6;
            break;
          case "no-status":
            matchesStatus = !book.statusId;
            break;
          default:
            matchesStatus = true;
        }
      }

      // Checks filter logic - adapted for BookInfo structure
      let matchesChecks = true;
      if (checksFilter !== "none") {
        const tbrLists = book.tbrLists || [];
        const editionsOwned = book.editionsOwned || [];
        const startedReading = book.statusId && book.statusId >= 2;

        switch (checksFilter) {
          case "started-on-tbr":
            matchesChecks = startedReading && tbrLists.length > 0;
            break;
          case "multiple-tbr":
            matchesChecks = tbrLists.length > 1;
            break;
          case "owned-not-started-no-tbr":
            matchesChecks =
              editionsOwned.length > 0 &&
              !startedReading &&
              tbrLists.length === 0;
            break;
          case "read-no-rating":
            matchesChecks =
              book.statusId === 3 && (!book.rating || book.rating === 0);
            break;
          case "read-no-review":
            matchesChecks = book.statusId === 3 && !book.hasReview;
            break;
          case "no-page-numbers":
            // Check if the book has no page numbers in any of its editions
            matchesChecks =
              !book.editions ||
              book.editions.every((edition: EditionInfo) => !edition.pages);
            break;
          case "no-listening-duration":
            // Check if the book has no listening duration
            matchesChecks =
              !book.listeningDuration || book.listeningDuration === 0;
            break;
          case "no-literary-type":
            // Check if the book has no literary type
            matchesChecks = !book.literaryTypeId;
            break;
          default:
            matchesChecks = true;
        }
      }

      return matchesSearch && matchesStatus && matchesChecks;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "author":
          aValue = a.author || "";
          bValue = b.author || "";
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  // Pagination logic
  const totalBooks = filteredAndSortedBooks.length;
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredAndSortedBooks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, checksFilter, sortBy, sortOrder, booksPerPage]);

  return (
    <div className={styles.container}>
      <div className={styles.summarySection}>
        <h2 className={styles.summaryTitle}>📚 Book Data Summary</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalBooks}</span>
            <span className={styles.statLabel}>Filtered Books</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {books.filter((b) => b.rating && b.rating > 0).length}
            </span>
            <span className={styles.statLabel}>Rated Books</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {books.filter((b) => b.hasReview).length}
            </span>
            <span className={styles.statLabel}>Books with Reviews</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {books.filter((b) => b.tbrLists && b.tbrLists.length > 0).length}
            </span>
            <span className={styles.statLabel}>Books in TBR Lists</span>
          </div>
        </div>
        <div className={styles.paginationInfo}>
          <span className={styles.paginationInfoText}>
            Showing {startIndex + 1}-{Math.min(endIndex, totalBooks)} of{" "}
            {totalBooks} books
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </span>
        </div>
      </div>

      <div className={styles.filtersContainer}>
        <input
          type="text"
          placeholder="Search books by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.controlsGroup}>
          <select
            value={booksPerPage}
            onChange={(e) => setBooksPerPage(Number(e.target.value))}
            className={styles.select}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              // Reset checks filter to "none" when status filter changes to anything other than "all"
              if (e.target.value !== "all") {
                setChecksFilter("none");
              }
            }}
            className={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="want-to-read">Want to Read</option>
            <option value="currently-reading">Currently Reading</option>
            <option value="read">Read</option>
            <option value="paused">Paused</option>
            <option value="did-not-finish">Did Not Finish</option>
            <option value="ignored">Ignored</option>
            <option value="no-status">No Status</option>
          </select>

          <select
            value={checksFilter}
            onChange={(e) => setChecksFilter(e.target.value)}
            className={styles.select}
          >
            <option value="none">None</option>
            <option value="started-on-tbr">
              Started books that are on at least one TBR list
            </option>
            <option value="multiple-tbr">
              Books that are in more than 1 TBR list
            </option>
            <option value="owned-not-started-no-tbr">
              Owned books that are not started, and are not in any TBR list
            </option>
            <option value="read-no-rating">Read books with no rating</option>
            <option value="read-no-review">Read books with no review</option>
            <option value="no-page-numbers">Books without page numbers</option>
            <option value="no-listening-duration">
              Books without listening duration
            </option>
            <option value="no-literary-type">
              Books without literary type
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "title" | "author" | "rating")
            }
            className={styles.select}
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="rating">Sort by Rating</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={styles.sortButton}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className={styles.booksGrid}>
        {currentBooks.map((book, index) => (
          <BookCard
            key={`${book.id}-${index}`}
            book={book}
            index={startIndex + index}
          />
        ))}
      </div>

      {totalBooks === 0 && (
        <div className={styles.emptyState}>
          <p>No books found matching your criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`${styles.pageButton} ${
                    currentPage === pageNum ? styles.pageButtonActive : ""
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const BookDataDisplay: React.FC<BookDataDisplayProps> = ({ data }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Your Book Collection</h2>
      </div>
      {data && <BookDataDisplayContent data={data} />}
    </div>
  );
};

export default BookDataDisplay;
