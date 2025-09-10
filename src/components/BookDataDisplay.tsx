import React, { useState } from "react";
import type { CsvUploadResult } from "../types";

interface BookDataDisplayProps {
  data: CsvUploadResult;
}

const BookDataDisplay: React.FC<BookDataDisplayProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [checksFilter, setChecksFilter] = useState<string>("none");
  const [sortBy, setSortBy] = useState<
    "title" | "author" | "rating" | "dateAdded"
  >("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedBooks = data.books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author &&
          book.author.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || book.status === statusFilter;

      // Checks filter logic
      let matchesChecks = true;
      if (checksFilter !== "none") {
        const allLists = book.lists
          ? book.lists
              .split(",")
              .map((list) => list.trim())
              .filter((list) => list.length > 0)
          : [];
        const tbrLists = allLists.filter((list) => list.startsWith("TBR:"));

        switch (checksFilter) {
          case "read-on-tbr":
            matchesChecks = book.status === "Read" && tbrLists.length > 0;
            break;
          case "multiple-tbr":
            matchesChecks = tbrLists.length > 1;
            break;
          case "owned-not-read-no-tbr":
            matchesChecks =
              book.owned && book.status !== "Read" && tbrLists.length === 0;
            break;
          case "read-no-rating-review":
            matchesChecks =
              book.status === "Read" &&
              book.rating === 0 &&
              (!book.review || book.review.trim() === "") &&
              book.genres.toLowerCase().indexOf("graphic novel") === -1;
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
        case "dateAdded":
          aValue = new Date(a.dateAdded).getTime();
          bValue = new Date(b.dateAdded).getTime();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Read":
        return "#28a745";
      case "Want to Read":
        return "#007bff";
      case "Currently Reading":
        return "#ffc107";
      case "Stopped":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="book-data-display">
      <div className="summary">
        <h2>📚 Book Data Summary</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">{data.totalCount}</span>
            <span className="stat-label">Total Books</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {data.books.filter((b) => b.status === "Read").length}
            </span>
            <span className="stat-label">Read</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {data.books.filter((b) => b.status === "Want to Read").length}
            </span>
            <span className="stat-label">Want to Read</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {
                data.books.filter((b) => b.status === "Currently Reading")
                  .length
              }
            </span>
            <span className="stat-label">Currently Reading</span>
          </div>
        </div>
      </div>

      {data.errors.length > 0 && (
        <div className="errors">
          <h3>⚠️ Processing Errors</h3>
          <ul>
            {data.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Read">Read</option>
            <option value="Want to Read">Want to Read</option>
            <option value="Currently Reading">Currently Reading</option>
            <option value="Stopped">Stopped</option>
          </select>

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
              setSortBy(
                e.target.value as "title" | "author" | "rating" | "dateAdded",
              )
            }
            className="filter-select"
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="rating">Sort by Rating</option>
            <option value="dateAdded">Sort by Date Added</option>
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
          <div key={`${book.hardcoverBookId}-${index}`} className="book-card">
            <div className="book-header">
              <h3 className="book-title">{book.title}</h3>
              <span
                className="book-status"
                style={{ backgroundColor: getStatusColor(book.status) }}
              >
                {book.status}
              </span>
            </div>

            <div className="book-details">
              {book.author && <p className="book-author">by {book.author}</p>}

              {book.series && <p className="book-series">📖 {book.series}</p>}

              {book.rating > 0 && (
                <div className="book-rating">⭐ {book.rating}/5</div>
              )}

              <div className="book-meta">
                {book.pages > 0 && (
                  <span className="meta-item">📄 {book.pages} pages</span>
                )}
                {book.publishDate && (
                  <span className="meta-item">
                    📅 {formatDate(book.publishDate)}
                  </span>
                )}
                {book.media && (
                  <span className="meta-item">📚 {book.media}</span>
                )}
              </div>

              {book.genres && (
                <div className="book-genres">
                  {book.genres.split(",").map((genre, i) => (
                    <span key={i} className="genre-tag">
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}

              {book.tags && (
                <div className="book-tags">
                  {book.tags.split(",").map((tag, i) => (
                    <span key={i} className="tag">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {book.review && (
                <div className="book-review">
                  <strong>Review:</strong> {book.review.substring(0, 200)}
                  {book.review.length > 200 && "..."}
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
