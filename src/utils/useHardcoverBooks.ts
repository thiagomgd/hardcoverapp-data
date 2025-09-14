import { useQuery } from "@tanstack/react-query";
import type {
  HardcoverData,
  OwnedBookData,
  OwnedBooksResponse,
  SeriesMap,
  SeriesResponse,
  TBRBooksResponse,
  UserBookData,
  UserBooksMap,
  UserBooksResponse,
} from "../types";

const fetchOwnedBooks = async (
  userId: string,
): Promise<Array<OwnedBookData>> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // For now, we'll let the server use the environment variable
  // TODO: pass the token - we have to ask user for it still
  const response = await fetch(
    `/api/owned?userID=${encodeURIComponent(userId)}`,
  );
  const data: OwnedBooksResponse = await response.json();

  if (response.ok && data.success) {
    return data.books;
  } else {
    throw new Error(data.error || "Failed to load owned books");
  }
};

const fetchUserBooks = async (userId: string): Promise<Array<UserBookData>> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // For now, we'll let the server use the environment variable
  // TODO: pass the token - we have to ask user for it still
  const response = await fetch(
    `/api/books?userID=${encodeURIComponent(userId)}`,
  );
  const data: UserBooksResponse = await response.json();

  if (response.ok && data.user_books?.success) {
    return data.user_books.books;
  } else {
    throw new Error("Failed to load user books");
  }
};

const fetchTBRBooks = async (
  userId: string,
): Promise<{ [bookId: number]: string[] }> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // For now, we'll let the server use the environment variable
  // TODO: pass the token - we have to ask user for it still
  const response = await fetch(
    `/api/tbrbooks?userID=${encodeURIComponent(userId)}`,
  );
  const data: TBRBooksResponse = await response.json();

  if (response.ok && data.success) {
    return data.tbr_lists;
  } else {
    throw new Error(data.message || "Failed to load TBR books");
  }
};

const fetchSeriesInfo = async (seriesIds: number[]): Promise<SeriesMap> => {
  if (!seriesIds || !Array.isArray(seriesIds) || seriesIds.length === 0) {
    throw new Error("Series IDs are required");
  }

  const response = await fetch("/api/series", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ seriesIds }),
  });

  const data: SeriesResponse = await response.json();

  if (response.ok && data.success) {
    // Convert array of SeriesData to SeriesMap
    const seriesMap: SeriesMap = {};
    for (const series of data.series) {
      seriesMap[series.id] = series;
    }
    return seriesMap;
  } else {
    throw new Error(data.error || data.message || "Failed to load series info");
  }
};

export const useHardcoverBooks = (
  userId: string,
  onBooksLoaded?: (hardcoverData: HardcoverData) => void,
) => {
  return useQuery({
    queryKey: ["hardcoverBooks", userId],
    queryFn: async (): Promise<HardcoverData> => {
      const bookData: UserBooksMap = {};
      const seriesTempData = new Map<number, Set<number>>();

      const userBooks = await fetchUserBooks(userId);

      for (const book of userBooks) {
        if (Object.hasOwn(bookData, book.book.id)) {
          console.debug(`Book ${book.book.id} already exists`);
          continue;
        }

        bookData[book.book.id] = {
          id: book.book.id,
          title: book.book.title,
          link: `https://hardcover.app/books/${book.book.slug}`,
          hasReview: book.review !== null,
          rating: book.rating ?? undefined,
          status: book.book.book_status.name,
          statusId: book.status_id ?? undefined,
          editionsRead:
            book.status_id && book.status_id >= 2
              ? [book.edition.id]
              : undefined,
        };

        if (book.book.book_series.some((series) => series.featured)) {
          const series = book.book.book_series.find(
            (series) => series.featured,
          )!;
          if (!seriesTempData.has(series.series_id)) {
            seriesTempData.set(series.series_id, new Set());
          }

          seriesTempData.get(series.series_id)!.add(book.book.id);
        }
      }

      const ownedBooks = await fetchOwnedBooks(userId);

      for (const book of ownedBooks) {
        if (Object.hasOwn(bookData, book.book.id)) {
          const existingBook = bookData[book.book.id]!;
          if (!existingBook.editionsOwned) {
            existingBook.editionsOwned = [];
          }
          existingBook.editionsOwned.push(book.edition.id);
        } else {
          bookData[book.book.id] = {
            id: book.book.id,
            title: book.book.title,
            link: `https://hardcover.app/books/${book.book.id}`, // Using ID since slug is not available in OwnedBookData
            editionsOwned: [book.edition.id],
          };
        }

        if (book.book.book_series.some((series) => series.featured)) {
          const series = book.book.book_series.find(
            (series) => series.featured,
          )!;
          if (!seriesTempData.has(series.series_id)) {
            seriesTempData.set(series.series_id, new Set());
          }

          seriesTempData.get(series.series_id)!.add(book.book.id);
        }
      }

      const tbrBooks = await fetchTBRBooks(userId);
      for (const [bookId, tbrLists] of Object.entries(tbrBooks)) {
        const bookIdNum = parseInt(bookId);
        if (Object.hasOwn(bookData, bookIdNum)) {
          bookData[bookIdNum]!.tbrLists = tbrLists;
        }
      }

      const seriesInfo = await fetchSeriesInfo(
        Array.from(seriesTempData.keys()),
      );
      console.debug("Series info", seriesInfo);
      console.debug("Series temp data", seriesTempData);

      // Transfer books_read data from seriesTempData to seriesData
      for (const [seriesId, booksRead] of seriesTempData) {
        if (seriesInfo[seriesId]) {
          seriesInfo[seriesId].books_read = booksRead;
        }
      }

      // Call the callback when data is successfully loaded
      if (onBooksLoaded) {
        onBooksLoaded({
          books: bookData,
          series: seriesInfo,
        });
      }

      return { books: bookData, series: seriesInfo };
    },
    enabled: false, // Disable automatic execution - only run when manually triggered
  });
};
