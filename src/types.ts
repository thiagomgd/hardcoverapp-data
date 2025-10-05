export interface AppState {
  token: string;
  // date when fetched
  ownedFetched: string;
  readFetched: string;
  tbrListsFetched: string;
}

// Status	Description
// 1	Want to Read
// 2	Currently Reading
// 3	Read
// 4	Paused
// 5	Did Not Finished
// 6	Ignored

export interface EditionInfo {
  id: number;
  edition_format: string;
  edition_information: string;
  pages: number | null;
  physical_format: string | null;
  physical_information: string | null;
  audio_seconds: number | null;
}

export interface BookInfo {
  id: number;
  title: string;
  link: string;
  status?: string;
  statusId?: number;
  tbrLists?: string[];
  editionsOwned?: number[];
  editionsRead?: number[];
  author?: string;
  image?: string;
  rating?: number;
  hasReview?: boolean;
  editions?: EditionInfo[];
  listeningDuration?: number;
}

export interface UserBooksMap {
  [id: number]: BookInfo; // Index signature: numeric keys map to BookInfo
}

export interface SeriesMap {
  [id: number]: SeriesInfo;
}

export interface SeriesInfo extends SeriesData {
  books_read?: Map<number, number>;
}

export interface HardcoverData {
  books: UserBooksMap;
  series: SeriesMap;
  seriesStatus: { [statusName: string]: number[] };
}

export interface OwnedBookData {
  book: {
    id: number;
    title: string;
    book_series: Array<{
      featured: boolean;
      series_id: number;
      position: number;
    }>;
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
  status_id: number | null;
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
    book_series: Array<{
      featured: boolean;
      series_id: number;
      position: number;
    }>;
    editions: Array<{
      audio_seconds: number | null;
    }>;
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

export interface SeriesData {
  id: number;
  name: string;
  books_count: number;
  primary_books_count: number;
  slug: string;
  state: string;
  description?: string;
  is_completed?: boolean;
}

export interface SeriesResponse {
  success: boolean;
  series: SeriesData[];
  count: number;
  error?: string;
  message?: string;
}

export interface SeriesStatusResponse {
  success: boolean;
  series_status: { [statusName: string]: number[] };
  message?: string;
  error?: string;
}
