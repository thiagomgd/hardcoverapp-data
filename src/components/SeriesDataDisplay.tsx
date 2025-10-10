import React, { useState } from "react";
import type { HardcoverData, SeriesInfo } from "../types";
import styles from "./SeriesDataDisplay.module.css";

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
    [data.seriesStatus]
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
    0
  );
  const totalMainBooksInSeries = seriesObj.reduce(
    (sum, s) => sum + (s.primary_books_count || 0),
    0
  );
  const seriesWithMainBooks = seriesObj.filter(
    (s) => (s.primary_books_count || 0) > 0
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.summarySection}>
        <h2 className={styles.summaryTitle}>📚 Series Data Summary</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{seriesObj.length}</span>
            <span className={styles.statLabel}>Total Series</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalBooksInSeries}</span>
            <span className={styles.statLabel}>Total Books in Series</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalMainBooksInSeries}</span>
            <span className={styles.statLabel}>Total Main Books</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{seriesWithMainBooks}</span>
            <span className={styles.statLabel}>Series with Books</span>
          </div>
        </div>
      </div>

      <div className={styles.filtersContainer}>
        <input
          type="text"
          placeholder="Search series by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.controlsGroup}>
          <select
            value={seriesStatusFilter}
            onChange={(e) => setSeriesStatusFilter(e.target.value)}
            className={styles.select}
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
            className={styles.select}
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
                e.target.value as "name" | "books_count" | "primary_books_count"
              )
            }
            className={styles.select}
          >
            <option value="name">Sort by Title</option>
            <option value="books_count">Sort by Total Books</option>
            <option value="primary_books_count">Sort by Main Books</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={styles.sortButton}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      {filteredAndSortedSeries.length > 0 && (
        <div className={styles.paginationInfo}>
          <p className={styles.paginationInfoText}>
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredAndSortedSeries.length)} of{" "}
            {filteredAndSortedSeries.length} series
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        </div>
      )}

      <div className={styles.seriesGrid}>
        {paginatedSeries.map((seriesItem, index) => (
          <div key={`${seriesItem.id}-${index}`} className={styles.seriesCard}>
            <div className={styles.seriesHeader}>
              <h3 className={styles.seriesTitle}>
                {seriesItem.name || `Series #${seriesItem.id}`}
              </h3>
              <div className={styles.seriesMetadata}>
                <div className={styles.metadataRow}>
                  <span className={styles.metadataLabel}>Series ID:</span>
                  <span className={styles.metadataValue}>{seriesItem.id}</span>
                </div>
                {seriesItem.books_count !== undefined && (
                  <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel}>Total Books:</span>
                    <span className={styles.metadataValue}>
                      {seriesItem.books_count}
                    </span>
                  </div>
                )}
                {seriesItem.primary_books_count !== undefined && (
                  <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel}>Main Books:</span>
                    <span className={styles.metadataValue}>
                      {seriesItem.primary_books_count}
                    </span>
                  </div>
                )}
                <div className={styles.metadataRow}>
                  <span className={styles.metadataLabel}>
                    Books in Collection:
                  </span>
                  <span className={styles.metadataValue}>
                    {seriesItem.books_read ? seriesItem.books_read.size : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Books in this series */}
            {seriesItem.books_read && seriesItem.books_read.size > 0 && (
              <div className={styles.booksSection}>
                <h4 className={styles.booksSectionTitle}>
                  Books in Collection:
                </h4>
                <div className={styles.booksList}>
                  {Array.from(seriesItem.books_read)
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, 10)
                    .map(([bookId, position]) => {
                      const book = data.books[bookId];
                      return (
                        <div key={bookId} className={styles.bookItem}>
                          <span className={styles.bookTitle}>
                            {book?.title || `Book #${bookId}`}
                          </span>
                          <span className={styles.bookPosition}>
                            #{position}
                          </span>
                        </div>
                      );
                    })}
                  {seriesItem.books_read.size > 10 && (
                    <div className={styles.moreBooks}>
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
        <div className={styles.emptyState}>
          <p>No series found matching your criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>

          {/* Page Numbers */}
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
                  onClick={() => goToPage(pageNum)}
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
            onClick={goToNextPage}
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

const SeriesDataDisplay: React.FC<SeriesDataDisplayProps> = ({ data }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Your Series Collection</h2>
      </div>
      {data && <SeriesDataDisplayContent data={data} />}
    </div>
  );
};

export default SeriesDataDisplay;
