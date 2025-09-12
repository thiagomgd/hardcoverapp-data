import React, { useState } from "react";
import type { UserBooksMap } from "../types";
import BookCard from "./BookCard";

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

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-xl mb-8">
        <h2 className="text-3xl font-bold mb-5">📚 Book Data Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {books.length}
            </span>
            <span className="text-sm opacity-90">Total Books</span>
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
        {filteredAndSortedBooks.map((book, index) => (
          <BookCard key={`${book.id}-${index}`} book={book} index={index} />
        ))}
      </div>

      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-lg">
          <p>No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BookDataDisplay;
