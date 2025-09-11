import { useQuery } from "@tanstack/react-query";

interface OwnedBooksData {
  success: boolean;
  list?: {
    id: string;
    name: string;
  };
  books?: Array<{
    id: string;
    title: string;
  }>;
  count?: number;
  totalCount?: number;
  pagesFetched?: number;
  error?: string;
  message?: string;
}

interface UserBooksData {
  success: boolean;
  books: Array<{
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
  }>;
  count: number;
}

interface UserBooksResponse {
  user_books: UserBooksData;
}

const fetchOwnedBooks = async (userId: string): Promise<OwnedBooksData> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // For now, we'll let the server use the environment variable
  // TODO: pass the token - we have to ask user for it still
  const response = await fetch(
    `/api/owned?userID=${encodeURIComponent(userId)}`,
  );
  const data: OwnedBooksData = await response.json();

  if (response.ok && data.success) {
    return data;
  } else {
    throw new Error(data.error || "Failed to load owned books");
  }
};

const fetchUserBooks = async (userId: string): Promise<UserBooksData> => {
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
    return data.user_books;
  } else {
    throw new Error("Failed to load user books");
  }
};

export const useHardcoverBooks = (
  userId: string,
  onBooksLoaded?: (books: OwnedBooksData) => void,
) => {
  return useQuery({
    queryKey: ["hardcoverBooks", userId],
    queryFn: async (): Promise<OwnedBooksData> => {
      const bookData = {};

      const userBooks = await fetchUserBooks(userId);

      for (const book of userBooks.books) {
        if (!bookData[book.id]) {
        }
      }
      const ownedBooks = await fetchOwnedBooks(userId);

      // Call the callback when data is successfully loaded
      if (onBooksLoaded) {
        onBooksLoaded(data);
      }

      return data;
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
