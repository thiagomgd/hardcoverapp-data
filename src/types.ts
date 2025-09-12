export interface AppState {
  token: string;
  // date when fetched
  ownedFetched: string;
  readFetched: string;
  tbrListsFetched: string;
}

export interface BookInfo {
  id: number;
  title: string;
  link: string;
  tbrLists?: string[];
  editionsOwned?: number[];
  editionsRead?: number[];
  author?: string;
  image?: string;
  rating?: number;
  hasReview?: boolean;
}

export interface UserBooksMap {
  [id: number]: BookInfo; // Index signature: numeric keys map to BookInfo
}

// Hardcover CSV Export Interface
export interface HardcoverBook {
  title: string;
  author?: string;
  series: string;
  status: "Read" | "Want to Read" | "Stopped" | "Currently Reading";
  privacy: "Public" | "Private";
  hardcoverBookId: number;
  hardcoverEditionId: number;
  isbn10: string;
  isbn13: string;
  asin: string;
  media: "Book" | "Audio" | "Ebook";
  countryCode: string;
  languageCode: string;
  binding: string;
  pages: number;
  durationInSeconds: number;
  publishDate: string;
  publisher: string;
  genres: string;
  moods: string;
  tags: string;
  contentWarnings: string;
  lists: string;
  dateAdded: string;
  dateStarted: string;
  dateFinished: string;
  rating: number;
  review: string;
  reviewContainsSpoilers: boolean;
  sponsoredReview: boolean;
  reviewDate: string;
  reviewUrl: string;
  reviewMediaUrl: string;
  privateNotes: string;
  owned: boolean;
  compilation: boolean;
  reviewSlate: string;
}

export interface CsvUploadResult {
  books: HardcoverBook[];
  totalCount: number;
  errors: string[];
}

export interface OwnedBookData {
  book: {
    id: number;
    title: string;
  };
  edition: {
    audio_seconds: number | null;
    id: number;
    edition_format: string;
    edition_information: string;
    pages: number | null;
    physical_format: string | null;
    physical_information: string | null;
  };
}

export interface OwnedBooksResponse {
  success: boolean;
  books: Array<OwnedBookData>;
  count: number;
  error?: string;
  message?: string;
}

export interface UserBookData {
  review: string | null;
  reading_format: {
    format: string;
    id: number;
  };
  rating: number | null;
  edition: {
    audio_seconds: number | null;
    id: number;
    edition_format: string;
    edition_information: string;
    pages: number | null;
    physical_format: string | null;
    physical_information: string | null;
  };
  book: {
    book_status: {
      name: string;
      id: number;
    };
    id: number;
    title: string;
    slug: string;
  };
}

export interface UserBooksResponse {
  user_books: {
    success: boolean;
    books: Array<UserBookData>;
    count: number;
  };
}

export interface TBRBooksResponse {
  success: boolean;
  tbr_lists: { [bookId: number]: string[] };
  message?: string;
  details?: string;
}
