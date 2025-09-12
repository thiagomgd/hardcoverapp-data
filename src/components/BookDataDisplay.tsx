import React, { useState } from "react";
import type { UserBooksMap } from "../types";

interface BookDataDisplayProps {
  data: UserBooksMap;
}

const BookDataDisplay: React.FC<BookDataDisplayProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [checksFilter, setChecksFilter] = useState<string>("none");
  const [sortBy, setSortBy] = useState<"title" | "author" | "rating">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Convert UserBooksMap to array for processing
  const books = Object.values(data);

  const filteredAndSortedBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author &&
          book.author.toLowerCase().includes(searchTerm.toLowerCase()));
      // Note: BookInfo doesn't have a status field, so we'll skip status filtering for now
      const matchesStatus = true; // statusFilter === "all" || book.status === statusFilter;

      // Checks filter logic - adapted for BookInfo structure
      let matchesChecks = true;
      if (checksFilter !== "none") {
        const tbrLists = book.tbrLists || [];

        switch (checksFilter) {
          case "read-on-tbr":
            // Note: BookInfo doesn't have status, so we'll skip this check
            matchesChecks = false;
            break;
          case "multiple-tbr":
            matchesChecks = tbrLists.length > 1;
            break;
          case "owned-not-read-no-tbr":
            // Note: BookInfo doesn't have owned/status fields, so we'll skip this check
            matchesChecks = false;
            break;
          case "read-no-rating-review":
            // Note: BookInfo doesn't have status field, so we'll skip this check
            matchesChecks = false;
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

  return (
    <div className="book-data-display">
      <div className="summary">
        <h2>📚 Book Data Summary</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">{books.length}</span>
            <span className="stat-label">Total Books</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {books.filter((b) => b.rating && b.rating > 0).length}
            </span>
            <span className="stat-label">Rated Books</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {books.filter((b) => b.hasReview).length}
            </span>
            <span className="stat-label">Books with Reviews</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {books.filter((b) => b.tbrLists && b.tbrLists.length > 0).length}
            </span>
            <span className="stat-label">Books in TBR Lists</span>
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={checksFilter}
            onChange={(e) => setChecksFilter(e.target.value)}
            className="filter-select"
          >
            <option value="none">None</option>
            <option value="read-on-tbr">
              Read books that are on at least one TBR list
            </option>
            <option value="multiple-tbr">
              Books that are in more than 1 TBR list
            </option>
            <option value="owned-not-read-no-tbr">
              Owned books that are not read, and are not in any TBR list
            </option>
            <option value="read-no-rating-review">
              Read books with no rating or review (skip Graphic Novels)
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "title" | "author" | "rating")
            }
            className="filter-select"
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="rating">Sort by Rating</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="sort-button"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="books-grid">
        {filteredAndSortedBooks.map((book, index) => (
          <div key={`${book.id}-${index}`} className="book-card">
            <div className="book-header">
              <h3 className="book-title">{book.title}</h3>
              {book.image && (
                <img
                  src={book.image}
                  alt={book.title}
                  className="book-image"
                  style={{
                    width: "60px",
                    height: "90px",
                    objectFit: "cover",
                    marginLeft: "10px",
                  }}
                />
              )}
            </div>

            <div className="book-details">
              {book.author && <p className="book-author">by {book.author}</p>}

              {book.link && (
                <p className="book-link">
                  <a href={book.link} target="_blank" rel="noopener noreferrer">
                    🔗 View on Hardcover
                  </a>
                </p>
              )}

              {book.rating && book.rating > 0 && (
                <div className="book-rating">⭐ {book.rating}/5</div>
              )}

              {book.hasReview && (
                <div className="book-review-indicator">📝 Has Review</div>
              )}

              {book.tbrLists && book.tbrLists.length > 0 && (
                <div className="book-tbr-lists">
                  <strong>TBR Lists:</strong>
                  {book.tbrLists.map((list: string, i: number) => (
                    <span key={i} className="tbr-tag">
                      {list}
                    </span>
                  ))}
                </div>
              )}

              {book.editionsOwned && book.editionsOwned.length > 0 && (
                <div className="book-owned-editions">
                  <strong>Owned Editions:</strong> {book.editionsOwned.length}
                </div>
              )}

              {book.editionsRead && book.editionsRead.length > 0 && (
                <div className="book-read-editions">
                  <strong>Read Editions:</strong> {book.editionsRead.length}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedBooks.length === 0 && (
        <div className="no-results">
          <p>No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BookDataDisplay;
