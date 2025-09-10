export interface AppState {
  token: string;
  // date when fetched
  ownedFetched: string;
  readFetched: string;
  tbrListsFetched: string;
}

export interface BookInfo {
  tbrLists?: string[];
  editionOwned?: Edition[];
  editionRead?: Edition[];
  title: string;
  author: string;
  image: string;
  link: string;
  rating?: number;
  hasReview: boolean;
}

export interface Edition {
  id: number;
  format: string;
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
