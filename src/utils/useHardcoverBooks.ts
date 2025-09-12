import { useQuery } from "@tanstack/react-query";
import type {
  OwnedBookData,
  OwnedBooksResponse,
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

export const useHardcoverBooks = (
  userId: string,
  onBooksLoaded?: (books: UserBooksMap) => void,
) => {
  return useQuery({
    queryKey: ["hardcoverBooks", userId],
    queryFn: async (): Promise<UserBooksMap> => {
      const bookData: UserBooksMap = {};

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
          editionsRead:
            book.book.book_status.name === "Read"
              ? [book.edition.id]
              : undefined,
        };
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
            link: `https://hardcover.app/books/${book.book.slug}`,
            editionsOwned: [book.edition.id],
          };
        }
      }

      // Call the callback when data is successfully loaded
      if (onBooksLoaded) {
        onBooksLoaded(bookData);
      }

      return bookData;
    },
    enabled: !!userId, // Only run the query when userId is available
  });
};

// queryFn: async () => {
//     const [postsResponse, usersResponse] = await Promise.all([
//       fetchPosts(), // Replace with your actual API call
//       fetchUsers(), // Replace with your actual API call
//     ]);
//     const posts = await postsResponse.json();
//     const users = await usersResponse.json();
//     return { posts, users };
//   },
