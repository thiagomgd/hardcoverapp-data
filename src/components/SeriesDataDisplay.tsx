import React, { useState } from "react";
import type { HardcoverData } from "../types";

interface SeriesDataDisplayContentProps {
  data: HardcoverData;
}

interface SeriesDataDisplayProps {
  data?: HardcoverData;
}

const SeriesDataDisplayContent: React.FC<SeriesDataDisplayContentProps> = ({
  data,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "title" | "numberOfBooks" | "numberOfMainBooks"
  >("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Convert SeriesMap to array for processing
  const seriesObj = Object.values(data.series);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const filteredAndSortedSeries = seriesObj
    .filter((seriesItem) => {
      const matchesSearch =
        seriesItem.title &&
        seriesItem.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "title":
          aValue = a.title || "";
          bValue = b.title || "";
          break;
        case "numberOfBooks":
          aValue = a.numberOfBooks || 0;
          bValue = b.numberOfBooks || 0;
          break;
        case "numberOfMainBooks":
          aValue = a.numberOfMainBooks || 0;
          bValue = b.numberOfMainBooks || 0;
          break;
        default:
          aValue = a.title || "";
          bValue = b.title || "";
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSeries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSeries = filteredAndSortedSeries.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Calculate series statistics
  const totalBooksInSeries = seriesObj.reduce(
    (sum, s) => sum + (s.numberOfBooks || 0),
    0,
  );
  const totalMainBooksInSeries = seriesObj.reduce(
    (sum, s) => sum + (s.numberOfMainBooks || 0),
    0,
  );
  const seriesWithMainBooks = seriesObj.filter(
    (s) => (s.numberOfMainBooks || 0) > 0,
  ).length;

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-xl mb-8">
        <h2 className="text-3xl font-bold mb-5">📚 Series Data Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {seriesObj.length}
            </span>
            <span className="text-sm opacity-90">Total Series</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {totalBooksInSeries}
            </span>
            <span className="text-sm opacity-90">Total Books in Series</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {totalMainBooksInSeries}
            </span>
            <span className="text-sm opacity-90">Total Main Books</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold mb-1">
              {seriesWithMainBooks}
            </span>
            <span className="text-sm opacity-90">Series with Books</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search series by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "title"
                  | "numberOfBooks"
                  | "numberOfMainBooks",
              )
            }
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="title">Sort by Title</option>
            <option value="numberOfBooks">Sort by Total Books</option>
            <option value="numberOfMainBooks">Sort by Main Books</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg bg-white cursor-pointer text-base font-bold hover:bg-gray-50 transition-all focus:outline-none focus:border-blue-500"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      {filteredAndSortedSeries.length > 0 && (
        <div className="mb-6 text-center text-gray-600">
          <p className="text-lg">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredAndSortedSeries.length)} of{" "}
            {filteredAndSortedSeries.length} series
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedSeries.map((seriesItem, index) => (
          <div
            key={`${seriesItem.id}-${index}`}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {seriesItem.title || `Series #${seriesItem.id}`}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Series ID:</span>
                  <span className="font-medium">{seriesItem.id}</span>
                </div>
                {seriesItem.numberOfBooks !== undefined && (
                  <div className="flex justify-between">
                    <span>Total Books:</span>
                    <span className="font-medium">
                      {seriesItem.numberOfBooks}
                    </span>
                  </div>
                )}
                {seriesItem.numberOfMainBooks !== undefined && (
                  <div className="flex justify-between">
                    <span>Main Books:</span>
                    <span className="font-medium">
                      {seriesItem.numberOfMainBooks}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Books in Collection:</span>
                  <span className="font-medium">
                    {Object.keys(seriesItem.books).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Books in this series */}
            {Object.keys(seriesItem.books).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Books in Collection:
                </h4>
                <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(seriesItem.books)
                    .slice(0, 10)
                    .map(([bookId, bookInfo]) => {
                      const book = bookInfo as {
                        position?: number;
                        statusId?: number;
                      };
                      return (
                        <div
                          key={bookId}
                          className="flex justify-between items-center"
                        >
                          <span>Book #{bookId}</span>
                          <div className="flex gap-2">
                            {book.position && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                #{book.position}
                              </span>
                            )}
                            {book.statusId && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                Status: {book.statusId}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(seriesItem.books).length > 10 && (
                    <div className="text-gray-500 italic">
                      ... and {Object.keys(seriesItem.books).length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedSeries.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-lg">
          <p>No series found matching your criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:border-blue-500"
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
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
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:border-blue-500 ${
                    currentPage === pageNum
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:border-blue-500"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const SeriesDataDisplay: React.FC<SeriesDataDisplayProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="flex justify-between items-center p-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-2xl font-semibold">Your Series Collection</h2>
      </div>
      {data && <SeriesDataDisplayContent data={data} />}
    </div>
  );
};

export default SeriesDataDisplay;
