import type { BookInfo } from "../types";
import { AUDIOBOOK_AVG_WPM, READING_WPM } from "../constants";

export const calculateReadingTime = (
  book: BookInfo,
  readingWPM = READING_WPM
): string | null => {
  // For books with listening duration
  if (book.listeningDuration && book.listeningDuration > 0) {
    const readingMinutes =
      (book.listeningDuration * AUDIOBOOK_AVG_WPM) / (60 * readingWPM);
    const hours = Math.floor(readingMinutes / 60);
    const mins = Math.round(readingMinutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  //   // For regular books based on pages
  //   if (book.editions && book.editions.length > 0) {
  //     const pagesEdition = book.editions.find((e) => e.pages && e.pages > 0);
  //     if (pagesEdition && pagesEdition.pages) {
  //       const wordsPerPage = 275; // Average words per page
  //       const totalWords = pagesEdition.pages * wordsPerPage;
  //       const readingMinutes = totalWords / readingWPM;
  //       const hours = Math.floor(readingMinutes / 60);
  //       const mins = Math.round(readingMinutes % 60);
  //       return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  //     }
  //   }

  return null;
};
