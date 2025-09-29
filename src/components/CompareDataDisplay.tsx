import { useState, useEffect, useCallback } from "react";
import type {
  HardcoverData,
  BookInfo,
  SeriesInfo,
  EditionInfo,
} from "../types";

interface CompareDataDisplayProps {
  currentData?: HardcoverData;
}

interface ChangeDetail {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface ComparisonResult {
  newBooks: BookInfo[];
  removedBooks: BookInfo[];
  updatedBooks: {
    book: BookInfo;
    changes: ChangeDetail[];
  }[];
  newSeries: SeriesInfo[];
  removedSeries: SeriesInfo[];
  updatedSeries: {
    series: SeriesInfo;
    changes: ChangeDetail[];
  }[];
}

const STORAGE_KEY = "hardcover_previous_data";

export default function CompareDataDisplay({
  currentData,
}: CompareDataDisplayProps) {
  const [previousData, setPreviousData] = useState<HardcoverData | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [hasData, setHasData] = useState(false);

  // Load previous data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setPreviousData(parsedData);
        setHasData(true);
      } catch (error) {
        console.error("Error parsing saved data:", error);
        setHasData(false);
      }
    } else {
      setHasData(false);
    }
  }, []);

  const saveCurrentData = () => {
    if (currentData) {
      const dataToSave = {
        ...currentData,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setPreviousData(currentData);
      setHasData(true);

      // Re-run comparison with the newly saved data
      const comparisonResult = compareData(currentData, currentData);
      setComparison(comparisonResult);
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPreviousData(null);
    setHasData(false);
    setComparison(null);
  };

  // Helper functions
  const formatEditionInfo = useCallback((edition: EditionInfo): string => {
    const parts = [];
    if (edition.edition_format) parts.push(`Format: ${edition.edition_format}`);
    if (edition.pages) parts.push(`Pages: ${edition.pages}`);
    if (edition.physical_format)
      parts.push(`Physical: ${edition.physical_format}`);
    if (edition.audio_seconds)
      parts.push(`Audio: ${Math.round(edition.audio_seconds / 60)} min`);
    if (edition.edition_information)
      parts.push(`Info: ${edition.edition_information}`);
    return parts.join(" | ");
  }, []);

  const compareEditionDetails = useCallback(
    (oldEdition: EditionInfo, newEdition: EditionInfo) => {
      const changes: ChangeDetail[] = [];

      const fieldsToCompare: (keyof EditionInfo)[] = [
        "edition_format",
        "edition_information",
        "pages",
        "physical_format",
        "physical_information",
        "audio_seconds",
      ];

      for (const field of fieldsToCompare) {
        const oldValue = oldEdition[field];
        const newValue = newEdition[field];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            field,
            oldValue,
            newValue,
          });
        }
      }

      return changes;
    },
    []
  );

  const compareEditions = useCallback(
    (oldEditions: EditionInfo[], newEditions: EditionInfo[]) => {
      const changes: ChangeDetail[] = [];

      // Create maps for easier comparison
      const oldEditionMap = new Map(oldEditions.map((ed) => [ed.id, ed]));
      const newEditionMap = new Map(newEditions.map((ed) => [ed.id, ed]));

      // Find new editions
      for (const [id, newEdition] of newEditionMap) {
        if (!oldEditionMap.has(id)) {
          changes.push({
            field: `edition_${id}_new`,
            oldValue: null,
            newValue: formatEditionInfo(newEdition),
          });
        }
      }

      // Find removed editions
      for (const [id, oldEdition] of oldEditionMap) {
        if (!newEditionMap.has(id)) {
          changes.push({
            field: `edition_${id}_removed`,
            oldValue: formatEditionInfo(oldEdition),
            newValue: null,
          });
        }
      }

      // Find updated editions
      for (const [id, newEdition] of newEditionMap) {
        if (oldEditionMap.has(id)) {
          const oldEdition = oldEditionMap.get(id)!;
          const editionChanges = compareEditionDetails(oldEdition, newEdition);

          for (const change of editionChanges) {
            changes.push({
              field: `edition_${id}_${change.field}`,
              oldValue: change.oldValue,
              newValue: change.newValue,
            });
          }
        }
      }

      return changes;
    },
    [compareEditionDetails, formatEditionInfo]
  );

  const compareBookInfo = useCallback(
    (oldBook: BookInfo, newBook: BookInfo) => {
      const changes: ChangeDetail[] = [];

      const fieldsToCompare: (keyof BookInfo)[] = [
        "title",
        "status",
        "statusId",
        "rating",
        "hasReview",
        "editionsOwned",
        "editionsRead",
        "tbrLists",
      ];

      for (const field of fieldsToCompare) {
        const oldValue = oldBook[field];
        const newValue = newBook[field];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            field,
            oldValue,
            newValue,
          });
        }
      }

      // Compare editions
      const editionChanges = compareEditions(
        oldBook.editions || [],
        newBook.editions || []
      );
      changes.push(...editionChanges);

      return changes;
    },
    [compareEditions]
  );

  const compareSeriesInfo = useCallback(
    (oldSeries: SeriesInfo, newSeries: SeriesInfo) => {
      const changes: ChangeDetail[] = [];

      const fieldsToCompare: (keyof SeriesInfo)[] = [
        "name",
        "books_count",
        "primary_books_count",
        "state",
        "description",
        "is_completed",
        "books_read",
      ];

      for (const field of fieldsToCompare) {
        const oldValue = oldSeries[field];
        const newValue = newSeries[field];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            field,
            oldValue,
            newValue,
          });
        }
      }

      return changes;
    },
    []
  );

  const compareData = useCallback(
    (oldData: HardcoverData, newData: HardcoverData): ComparisonResult => {
      const result: ComparisonResult = {
        newBooks: [],
        removedBooks: [],
        updatedBooks: [],
        newSeries: [],
        removedSeries: [],
        updatedSeries: [],
      };

      // Compare books
      const oldBookIds = new Set(Object.keys(oldData.books).map(Number));
      const newBookIds = new Set(Object.keys(newData.books).map(Number));

      // Find new books
      for (const bookId of newBookIds) {
        if (!oldBookIds.has(bookId)) {
          result.newBooks.push(newData.books[bookId]);
        }
      }

      // Find removed books
      for (const bookId of oldBookIds) {
        if (!newBookIds.has(bookId)) {
          result.removedBooks.push(oldData.books[bookId]);
        }
      }

      // Find updated books
      for (const bookId of oldBookIds) {
        if (newBookIds.has(bookId)) {
          const oldBook = oldData.books[bookId];
          const newBook = newData.books[bookId];
          const changes = compareBookInfo(oldBook, newBook);

          if (changes.length > 0) {
            result.updatedBooks.push({
              book: newBook,
              changes,
            });
          }
        }
      }

      // Compare series
      const oldSeriesIds = new Set(Object.keys(oldData.series).map(Number));
      const newSeriesIds = new Set(Object.keys(newData.series).map(Number));

      // Find new series
      for (const seriesId of newSeriesIds) {
        if (!oldSeriesIds.has(seriesId)) {
          result.newSeries.push(newData.series[seriesId]);
        }
      }

      // Find removed series
      for (const seriesId of oldSeriesIds) {
        if (!newSeriesIds.has(seriesId)) {
          result.removedSeries.push(oldData.series[seriesId]);
        }
      }

      // Find updated series
      for (const seriesId of oldSeriesIds) {
        if (newSeriesIds.has(seriesId)) {
          const oldSeries = oldData.series[seriesId];
          const newSeries = newData.series[seriesId];
          const changes = compareSeriesInfo(oldSeries, newSeries);

          if (changes.length > 0) {
            result.updatedSeries.push({
              series: newSeries,
              changes,
            });
          }
        }
      }

      return result;
    },
    [compareBookInfo, compareSeriesInfo]
  );

  // Compare data when both current and previous data are available
  useEffect(() => {
    if (currentData && previousData) {
      const comparisonResult = compareData(previousData, currentData);
      setComparison(comparisonResult);
    }
  }, [currentData, previousData, compareData]);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "None";
    if (Array.isArray(value)) return `[${value.join(", ")}]`;
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatFieldName = (fieldName: string): string => {
    if (fieldName.startsWith("edition_")) {
      const parts = fieldName.split("_");
      if (parts.length >= 3) {
        const editionId = parts[1];
        const action = parts[2];
        if (action === "new") return `New Edition (ID: ${editionId})`;
        if (action === "removed") return `Removed Edition (ID: ${editionId})`;
        return `Edition ${editionId} - ${parts.slice(2).join("_")}`;
      }
    }
    return fieldName;
  };

  if (!currentData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          No current data available for comparison.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Load your books first to enable comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Data Comparison
        </h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={saveCurrentData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            💾 Save Current Data as Previous
          </button>

          {hasData && (
            <button
              onClick={clearSavedData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Clear Saved Data
            </button>
          )}
        </div>

        {!hasData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>No previous data found.</strong> Save your current data to
              enable comparison with future loads.
            </p>
          </div>
        )}
      </div>

      {comparison && (
        <div className="space-y-6">
          {/* New Books */}
          {comparison.newBooks.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                📚 New Books ({comparison.newBooks.length})
              </h3>
              <div className="space-y-2">
                {comparison.newBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg p-3 border border-green-200"
                  >
                    <div className="font-medium text-gray-800">
                      {book.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: {book.status || "Unknown"} | Rating:{" "}
                      {book.rating || "Not rated"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed Books */}
          {comparison.removedBooks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                📚 Removed Books ({comparison.removedBooks.length})
              </h3>
              <div className="space-y-2">
                {comparison.removedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg p-3 border border-red-200"
                  >
                    <div className="font-medium text-gray-800">
                      {book.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: {book.status || "Unknown"} | Rating:{" "}
                      {book.rating || "Not rated"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Updated Books */}
          {comparison.updatedBooks.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📚 Updated Books ({comparison.updatedBooks.length})
              </h3>
              <div className="space-y-4">
                {comparison.updatedBooks.map(({ book, changes }) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg p-4 border border-blue-200"
                  >
                    <div className="font-medium text-gray-800 mb-3">
                      {book.title}
                    </div>
                    <div className="space-y-2">
                      {changes.map((change, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-700">
                            {formatFieldName(change.field)}:
                          </span>
                          <div className="ml-4 mt-1">
                            <div className="text-red-600">
                              <span className="font-medium">Old:</span>{" "}
                              {formatValue(change.oldValue)}
                            </div>
                            <div className="text-green-600">
                              <span className="font-medium">New:</span>{" "}
                              {formatValue(change.newValue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Series */}
          {comparison.newSeries.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                📖 New Series ({comparison.newSeries.length})
              </h3>
              <div className="space-y-2">
                {comparison.newSeries.map((series) => (
                  <div
                    key={series.id}
                    className="bg-white rounded-lg p-3 border border-green-200"
                  >
                    <div className="font-medium text-gray-800">
                      {series.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Books: {series.books_count} | State: {series.state}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed Series */}
          {comparison.removedSeries.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                📖 Removed Series ({comparison.removedSeries.length})
              </h3>
              <div className="space-y-2">
                {comparison.removedSeries.map((series) => (
                  <div
                    key={series.id}
                    className="bg-white rounded-lg p-3 border border-red-200"
                  >
                    <div className="font-medium text-gray-800">
                      {series.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Books: {series.books_count} | State: {series.state}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Updated Series */}
          {comparison.updatedSeries.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📖 Updated Series ({comparison.updatedSeries.length})
              </h3>
              <div className="space-y-4">
                {comparison.updatedSeries.map(({ series, changes }) => (
                  <div
                    key={series.id}
                    className="bg-white rounded-lg p-4 border border-blue-200"
                  >
                    <div className="font-medium text-gray-800 mb-3">
                      {series.name}
                    </div>
                    <div className="space-y-2">
                      {changes.map((change, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-700">
                            {formatFieldName(change.field)}:
                          </span>
                          <div className="ml-4 mt-1">
                            <div className="text-red-600">
                              <span className="font-medium">Old:</span>{" "}
                              {formatValue(change.oldValue)}
                            </div>
                            <div className="text-green-600">
                              <span className="font-medium">New:</span>{" "}
                              {formatValue(change.newValue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Changes */}
          {comparison.newBooks.length === 0 &&
            comparison.removedBooks.length === 0 &&
            comparison.updatedBooks.length === 0 &&
            comparison.newSeries.length === 0 &&
            comparison.removedSeries.length === 0 &&
            comparison.updatedSeries.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">
                  No changes detected between current and previous data.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
