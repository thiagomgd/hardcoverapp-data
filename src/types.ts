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
}

export interface UserBooksMap {
  [id: number]: BookInfo; // Index signature: numeric keys map to BookInfo
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
