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

export const useHardcoverBooks = (
  userId: string,
  onBooksLoaded?: (books: OwnedBooksData) => void,
) => {
  return useQuery({
    queryKey: ["ownedBooks", userId],
    queryFn: async (): Promise<OwnedBooksData> => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Note: In a real app, you'd want to get the token from user authentication
      // For now, we'll let the server use the environment variable
      const response = await fetch(
        `/api/owned?userID=${encodeURIComponent(userId)}`,
      );
      const data: OwnedBooksData = await response.json();

      if (response.ok && data.success) {
        // Call the callback when data is successfully loaded
        if (onBooksLoaded) {
          onBooksLoaded(data);
        }
        return data;
      } else {
        throw new Error(data.error || "Failed to load owned books");
      }
    },
    enabled: !!userId, // Only run the query when userId is available
  });
};
