import type { BookInfo } from "../types";
import { AUDIOBOOK_AVG_WPM, READING_WPM } from "../constants";

export const calculateReadingTime = (book: BookInfo): string | null => {
  // For books with listening duration
  if (book.listeningDuration && book.listeningDuration > 0) {
    const minutes = book.listeningDuration / 60;
    const words = AUDIOBOOK_AVG_WPM * minutes;
    const readingMinutes = words / READING_WPM;
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
  //       const readingMinutes = totalWords / READING_WPM;
  //       const hours = Math.floor(readingMinutes / 60);
  //       const mins = Math.round(readingMinutes % 60);
  //       return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  //     }
  //   }

  return null;
};
