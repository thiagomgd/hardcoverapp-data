import { useQuery } from "@tanstack/react-query";
import type {
  HardcoverData,
  OwnedBookData,
  OwnedBooksResponse,
  SeriesMap,
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

export const useHardcoverBooks = (
  userId: string,
  onBooksLoaded?: (hardcoverData: HardcoverData) => void,
) => {
  return useQuery({
    queryKey: ["hardcoverBooks", userId],
    queryFn: async (): Promise<HardcoverData> => {
      const bookData: UserBooksMap = {};
      const seriesData: SeriesMap = {};

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
          if (!seriesData[series.series_id]) {
            seriesData[series.series_id] = {
              id: series.series_id,
              books: {},
            };
          }
          if (!seriesData[series.series_id].books[book.book.id]) {
            seriesData[series.series_id].books[book.book.id] = {
              statusId: book.status_id ?? undefined,
            };
          }
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
          if (!seriesData[series.series_id]) {
            seriesData[series.series_id] = {
              id: series.series_id,
              books: {},
            };
          }
          if (!seriesData[series.series_id].books[book.book.id]) {
            seriesData[series.series_id].books[book.book.id] = {};
          }
        }
      }

      const tbrBooks = await fetchTBRBooks(userId);
      for (const [bookId, tbrLists] of Object.entries(tbrBooks)) {
        const bookIdNum = parseInt(bookId);
        if (Object.hasOwn(bookData, bookIdNum)) {
          bookData[bookIdNum]!.tbrLists = tbrLists;
        }
      }

      // Call the callback when data is successfully loaded
      if (onBooksLoaded) {
        onBooksLoaded({
          books: bookData,
          series: seriesData,
          seriesInfoFetched: false,
        });
      }

      return { books: bookData, series: seriesData, seriesInfoFetched: false };
    },
    enabled: false, // Disable automatic execution - only run when manually triggered
  });
};
