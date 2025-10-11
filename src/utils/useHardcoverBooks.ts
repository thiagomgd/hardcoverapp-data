import { useQuery } from "@tanstack/react-query";
import type {
  HardcoverData,
  OwnedBookData,
  OwnedBooksResponse,
  SeriesMap,
  SeriesResponse,
  SeriesStatusResponse,
  TBRBooksResponse,
  UserBookData,
  UserBooksMap,
  UserBooksResponse,
} from "../types";

const fetchOwnedBooks = async (
  userId: string
): Promise<Array<OwnedBookData>> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // For now, we'll let the server use the environment variable
  // TODO: pass the token - we have to ask user for it still
  const response = await fetch(
    `/api/owned?userID=${encodeURIComponent(userId)}`
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
    `/api/books?userID=${encodeURIComponent(userId)}`
  );
  const data: UserBooksResponse = await response.json();

  if (response.ok && data.user_books?.success) {
    return data.user_books.books;
  } else {
    throw new Error("Failed to load user books");
  }
};

const fetchTBRBooks = async (
  userId: string
): Promise<{ [bookId: number]: string[] }> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // For now, we'll let the server use the environment variable
  // TODO: pass the token - we have to ask user for it still
  const response = await fetch(
    `/api/tbrbooks?userID=${encodeURIComponent(userId)}`
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

const fetchSeriesStatuses = async (
  userId: string
): Promise<{ [seriesName: string]: number[] }> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // For now, we'll let the server use the environment variable
  // TODO: pass the token - we have to ask user for it still
  const response = await fetch(
    `/api/seriesstatus?userID=${encodeURIComponent(userId)}`
  );
  const data: SeriesStatusResponse = await response.json();

  if (response.ok && data.success) {
    return data.series_status;
  } else {
    throw new Error(
      data.error || data.message || "Failed to load series statuses"
    );
  }
};

const getAudioSeconds = (
  audioEditions: { audio_seconds: number | null }[]
): number => {
  if (audioEditions.length === 0) return 0;
  const total = audioEditions.reduce(
    (acc, edition) => acc + (edition.audio_seconds ?? 0),
    0
  );
  // Return the average audio seconds
  return total / audioEditions.length;
};

export const useHardcoverBooks = (
  userId: string,
  onBooksLoaded?: (hardcoverData: HardcoverData) => void
) => {
  return useQuery({
    queryKey: ["hardcoverBooks", userId],
    queryFn: async (): Promise<HardcoverData> => {
      const bookData: UserBooksMap = {};
      const seriesTempData = new Map<number, Map<number, number>>();

      const userBooks = await fetchUserBooks(userId);

      for (const book of userBooks) {
        if (Object.hasOwn(bookData, book.book.id)) {
          console.debug(`Book ${book.book.id} already exists`);
          // Add edition info to existing book
          const existingBook = bookData[book.book.id]!;
          if (!existingBook.editions) {
            existingBook.editions = [];
          }
          existingBook.editions.push({
            id: book.edition.id,
            edition_format: book.edition.edition_format,
            edition_information: book.edition.edition_information,
            pages: book.edition.pages,
            physical_format: book.edition.physical_format,
            physical_information: book.edition.physical_information,
            audio_seconds: book.edition.audio_seconds,
          });
          continue;
        }

        bookData[book.book.id] = {
          id: book.book.id,
          title: book.book.title,
          link: `https://hardcover.app/books/${book.book.slug}`,
          categoryId: book.book.book_category_id ?? undefined,
          literaryTypeId: book.book.literary_type_id ?? undefined,
          hasReview: book.review !== null,
          rating: book.rating ?? undefined,
          status: book.book.book_status.name,
          statusId: book.status_id ?? undefined,
          editionsRead:
            book.status_id && book.status_id >= 2
              ? [book.edition.id]
              : undefined,
          editions: [
            {
              id: book.edition.id,
              edition_format: book.edition.edition_format,
              edition_information: book.edition.edition_information,
              pages: book.edition.pages,
              physical_format: book.edition.physical_format,
              physical_information: book.edition.physical_information,
              audio_seconds: book.edition.audio_seconds,
            },
          ],
          listeningDuration: getAudioSeconds(book.book.editions),
          seriesDetails:
            book.book.book_series.length > 0
              ? book.book.book_series
                  .map((s) => s.details)
                  .filter(
                    (d): d is string =>
                      d !== null && d !== "" && d !== undefined
                  )
              : null,
        };

        if (book.book.book_series.some((series) => series.featured)) {
          const series = book.book.book_series.find(
            (series) => series.featured
          )!;
          if (!seriesTempData.has(series.series_id)) {
            seriesTempData.set(series.series_id, new Map());
          }

          seriesTempData
            .get(series.series_id)!
            .set(book.book.id, series.position);
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

          // Add edition info to existing book
          if (!existingBook.editions) {
            existingBook.editions = [];
          }
          existingBook.editions.push({
            id: book.edition.id,
            edition_format: book.edition.edition_format,
            edition_information: book.edition.edition_information,
            pages: book.edition.pages,
            physical_format: book.edition.physical_format,
            physical_information: book.edition.physical_information,
            audio_seconds: book.edition.audio_seconds,
          });
        } else {
          bookData[book.book.id] = {
            id: book.book.id,
            title: book.book.title,
            link: `https://hardcover.app/books/${book.book.slug}`,
            categoryId: book.book.book_category_id ?? undefined,
            literaryTypeId: book.book.literary_type_id ?? undefined,
            editionsOwned: [book.edition.id],
            editions: [
              {
                id: book.edition.id,
                edition_format: book.edition.edition_format,
                edition_information: book.edition.edition_information,
                pages: book.edition.pages,
                physical_format: book.edition.physical_format,
                physical_information: book.edition.physical_information,
                audio_seconds: book.edition.audio_seconds,
              },
            ],
            seriesDetails:
              book.book.book_series.length > 0
                ? book.book.book_series
                    .map((s) => s.details)
                    .filter((d): d is string => !!d)
                : null,
            listeningDuration: getAudioSeconds(book.book.editions),
          };
        }

        if (book.book.book_series.some((series) => series.featured)) {
          const series = book.book.book_series.find(
            (series) => series.featured
          )!;
          if (!seriesTempData.has(series.series_id)) {
            seriesTempData.set(series.series_id, new Map());
          }

          seriesTempData
            .get(series.series_id)!
            .set(book.book.id, series.position);
        }
      }

      // TODO: should get all lists on same requests for user books and owned books
      const tbrBooks = await fetchTBRBooks(userId);
      for (const [bookId, tbrLists] of Object.entries(tbrBooks)) {
        const bookIdNum = parseInt(bookId);
        if (Object.hasOwn(bookData, bookIdNum)) {
          bookData[bookIdNum]!.tbrLists = tbrLists;
        }
      }

      const seriesInfo = await fetchSeriesInfo(
        Array.from(seriesTempData.keys())
      );

      // Transfer books_read data from seriesTempData to seriesData
      for (const [seriesId, booksRead] of seriesTempData) {
        if (seriesInfo[seriesId]) {
          seriesInfo[seriesId].books_read = booksRead;
        }
      }

      const seriesStatus = await fetchSeriesStatuses(userId);

      // Call the callback when data is successfully loaded
      if (onBooksLoaded) {
        onBooksLoaded({
          books: bookData,
          series: seriesInfo,
          seriesStatus: seriesStatus,
        });
      }

      return {
        books: bookData,
        series: seriesInfo,
        seriesStatus: seriesStatus,
      };
    },
    enabled: false, // Disable automatic execution - only run when manually triggered
  });
};
