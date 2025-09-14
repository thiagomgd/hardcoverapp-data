import React, { useState } from "react";
import type { HardcoverData } from "../types";
import BookCard from "./BookCard";

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
          default:
            matchesChecks = true;
        }
      }

      return matchesSearch && matchesChecks;
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
  }, [searchTerm, checksFilter, sortBy, sortOrder, booksPerPage]);

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-xl mb-8">
        <h2 className="text-3xl font-bold mb-5">📚 Book Data Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">{totalBooks}</span>
            <span className="text-sm opacity-90">Filtered Books</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {books.filter((b) => b.rating && b.rating > 0).length}
            </span>
            <span className="text-sm opacity-90">Rated Books</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {books.filter((b) => b.hasReview).length}
            </span>
            <span className="text-sm opacity-90">Books with Reviews</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {books.filter((b) => b.tbrLists && b.tbrLists.length > 0).length}
            </span>
            <span className="text-sm opacity-90">Books in TBR Lists</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-sm opacity-90">
            Showing {startIndex + 1}-{Math.min(endIndex, totalBooks)} of{" "}
            {totalBooks} books
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={booksPerPage}
            onChange={(e) => setBooksPerPage(Number(e.target.value))}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <select
            value={checksFilter}
            onChange={(e) => setChecksFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
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
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "title" | "author" | "rating")
            }
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="rating">Sort by Rating</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg bg-white cursor-pointer text-base font-bold hover:bg-gray-50 transition-all focus:outline-none focus:border-blue-500"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentBooks.map((book, index) => (
          <BookCard
            key={`${book.id}-${index}`}
            book={book}
            index={startIndex + index}
          />
        ))}
      </div>

      {totalBooks === 0 && (
        <div className="text-center py-10 text-gray-500 text-lg">
          <p>No books found matching your criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white cursor-pointer text-sm font-medium hover:bg-gray-50 transition-all focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
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
                  className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:border-blue-500 ${
                    currentPage === pageNum
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white hover:bg-gray-50"
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
            className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white cursor-pointer text-sm font-medium hover:bg-gray-50 transition-all focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="flex justify-between items-center p-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-2xl font-semibold">Your Book Collection</h2>
      </div>
      {data && <BookDataDisplayContent data={data} />}
    </div>
  );
};

export default BookDataDisplay;
