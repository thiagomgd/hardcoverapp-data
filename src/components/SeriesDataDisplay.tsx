import React, { useState } from "react";
import type { HardcoverData, SeriesInfo } from "../types";

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
    "name" | "books_count" | "primary_books_count"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [seriesStatusFilter, setSeriesStatusFilter] = useState<string>("");
  const [statusCountFilter, setStatusCountFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Convert SeriesMap to array for processing
  const seriesObj: SeriesInfo[] = Object.values(data.series);

  // Helper function to get status count for a series
  const getSeriesStatusCount = React.useCallback(
    (seriesId: number): number => {
      if (!data.seriesStatus) {
        return 0;
      }
      let count = 0;
      for (const statusArray of Object.values(data.seriesStatus)) {
        if (statusArray && statusArray.includes(seriesId)) {
          count++;
        }
      }
      return count;
    },
    [data.seriesStatus],
  );

  // Calculate status count statistics for UI
  const statusCountStats = React.useMemo(() => {
    const stats = { none: 0, single: 0, multiple: 0 };
    seriesObj.forEach((series) => {
      const count = getSeriesStatusCount(series.id);
      if (count === 0) stats.none++;
      else if (count === 1) stats.single++;
      else stats.multiple++;
    });
    return stats;
  }, [seriesObj, getSeriesStatusCount]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, seriesStatusFilter, statusCountFilter]);

  const filteredAndSortedSeries = seriesObj
    .filter((seriesItem) => {
      const matchesSearch =
        seriesItem.name &&
        seriesItem.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !seriesStatusFilter ||
        (data.seriesStatus &&
          data.seriesStatus[seriesStatusFilter] &&
          data.seriesStatus[seriesStatusFilter].includes(seriesItem.id));

      const statusCount = getSeriesStatusCount(seriesItem.id);
      const matchesStatusCount =
        !statusCountFilter ||
        (statusCountFilter === "none" && statusCount === 0) ||
        (statusCountFilter === "single" && statusCount === 1) ||
        (statusCountFilter === "multiple" && statusCount > 1);

      return matchesSearch && matchesStatus && matchesStatusCount;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "books_count":
          aValue = a.books_count || 0;
          bValue = b.books_count || 0;
          break;
        case "primary_books_count":
          aValue = a.primary_books_count || 0;
          bValue = b.primary_books_count || 0;
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
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
    (sum, s) => sum + (s.books_count || 0),
    0,
  );
  const totalMainBooksInSeries = seriesObj.reduce(
    (sum, s) => sum + (s.primary_books_count || 0),
    0,
  );
  const seriesWithMainBooks = seriesObj.filter(
    (s) => (s.primary_books_count || 0) > 0,
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
            value={seriesStatusFilter}
            onChange={(e) => setSeriesStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {data.seriesStatus &&
              Object.keys(data.seriesStatus).map((statusName) => (
                <option key={statusName} value={statusName}>
                  {statusName} ({data.seriesStatus[statusName].length})
                </option>
              ))}
          </select>

          <select
            value={statusCountFilter}
            onChange={(e) => setStatusCountFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status Counts</option>
            <option value="none">No Status ({statusCountStats.none})</option>
            <option value="single">
              Single Status ({statusCountStats.single})
            </option>
            <option value="multiple">
              Multiple Statuses ({statusCountStats.multiple})
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "name"
                  | "books_count"
                  | "primary_books_count",
              )
            }
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="name">Sort by Title</option>
            <option value="books_count">Sort by Total Books</option>
            <option value="primary_books_count">Sort by Main Books</option>
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
                {seriesItem.name || `Series #${seriesItem.id}`}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Series ID:</span>
                  <span className="font-medium">{seriesItem.id}</span>
                </div>
                {seriesItem.books_count !== undefined && (
                  <div className="flex justify-between">
                    <span>Total Books:</span>
                    <span className="font-medium">
                      {seriesItem.books_count}
                    </span>
                  </div>
                )}
                {seriesItem.primary_books_count !== undefined && (
                  <div className="flex justify-between">
                    <span>Main Books:</span>
                    <span className="font-medium">
                      {seriesItem.primary_books_count}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Books in Collection:</span>
                  <span className="font-medium">
                    {seriesItem.books_read ? seriesItem.books_read.size : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Books in this series */}
            {seriesItem.books_read && seriesItem.books_read.size > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Books in Collection:
                </h4>
                <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {Array.from(seriesItem.books_read)
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, 10)
                    .map(([bookId, position]) => {
                      const book = data.books[bookId];
                      return (
                        <div
                          key={bookId}
                          className="flex justify-between items-center"
                        >
                          <span>{book?.title || `Book #${bookId}`}</span>
                          <span className="text-gray-500">#{position}</span>
                        </div>
                      );
                    })}
                  {seriesItem.books_read.size > 10 && (
                    <div className="text-gray-500 italic">
                      ... and {seriesItem.books_read.size - 10} more
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
