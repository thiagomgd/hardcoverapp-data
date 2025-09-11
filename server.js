import Fastify from 'fastify';
import cors from '@fastify/cors';
import { request as graphqlRequest, gql } from 'graphql-request';
import dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: true
});

// API Routes
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', message: 'Fastify server is running!' };
});

fastify.get('/api/books', async (request, reply) => {
  const { token, userID } = request.query;
  
  // Use environment variable if no token provided (for local development)
  const authToken = token || process.env.HARDCOVER_TOKEN;
  
  if (!authToken) {
    return reply.status(400).send({
      error: 'User token is required',
      message: 'Please provide a token parameter or set HARDCOVER_TOKEN environment variable'
    });
  }

  if (!userID) {
    return reply.status(400).send({
      error: 'User ID is required',
      message: 'Please provide a userID parameter'
    });
  }

  try {
    const allBooks = [];
    let offset = 0;
    const limit = 100;

    // Fetch all pages until we have all books
    while (true) {
      const variables = { userID, offset, limit };
      
      const data = await graphqlRequest(HARDCOVER_API_URL, GET_USER_BOOKS_QUERY, variables, {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      });

      if (!data.list_books || !Array.isArray(data.list_books)) {
        return reply.status(404).send({
          error: 'No books found',
          message: `No books found for user ID: ${userID}`
        });
      }

      const currentPageBooks = data.list_books.map(lb => ({
        ...lb.book,
        edition: lb.edition,
        list: lb.list
      }));
      allBooks.push(...currentPageBooks);

      // If we got fewer books than the limit, we've reached the end
      if (currentPageBooks.length < limit) {
        break;
      }

      offset += limit;
    }

    return {
      user_books: {
        success: true,
        books: allBooks,
        count: allBooks.length
      }
    };

  } catch (error) {
    fastify.log.error('Error fetching user books:', error);
    
    // Handle GraphQL errors
    if (error.response && error.response.errors) {
      return reply.status(400).send({
        error: 'GraphQL API error',
        message: 'Error from Hardcover API',
        details: error.response.errors
      });
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      return reply.status(401).send({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch user books',
      details: error.message
    });
  }
});

// Hardcover GraphQL API endpoint
const HARDCOVER_API_URL = 'https://api.hardcover.app/v1/graphql';

// GraphQL query to get the "Owned" list with pagination for a specific user
const GET_OWNED_BOOKS_QUERY = gql`
  query GetOwnedBooks($userID: Int!, $offset: Int!, $limit: Int!) {
    lists(where: { name: { _eq: "Owned" }, user_id: { _eq: $userID } }) {
      id
      name
      list_books(offset: $offset, limit: $limit, order_by: { created_at: desc }) {
        book {
          id
          title
        }
        edition {
          pages
          edition_format
          edition_information
          audio_seconds
          id
        }
      }
    }
  }
`;

// GraphQL query to get all books for a specific user
const GET_USER_BOOKS_QUERY = gql`
  query GetUserBooks($userID: Int!, $offset: Int!, $limit: Int!) {
    list_books(where: { list: { user_id: { _eq: $userID } } }, offset: $offset, limit: $limit, order_by: { created_at: desc }) {
      book {
        id
        title
        author
        isbn
        published_date
        cover_image_url
      }
      edition {
        pages
        edition_format
        edition_information
        audio_seconds
        id
      }
      list {
        id
        name
      }
    }
  }
`;

// GraphQL query to get current user information
const GET_USER_QUERY = gql`
  query User {
    me {
      username
      id
    }
  }
`;

fastify.get('/api/owned', async (request, reply) => {
  const { token, userID } = request.query;
  
  // Use environment variable if no token provided (for local development)
  const authToken = token || process.env.HARDCOVER_TOKEN;
  
  if (!authToken) {
    return reply.status(400).send({
      error: 'User token is required',
      message: 'Please provide a token parameter or set HARDCOVER_TOKEN environment variable'
    });
  }

  if (!userID) {
    return reply.status(400).send({
      error: 'User ID is required',
      message: 'Please provide a userID parameter'
    });
  }

  try {
    const allBooks = [];
    let offset = 0;
    const limit = 100;
    let ownedList = null;

    // Fetch all pages until we have all books
    while (true) {
      const variables = { userID, offset, limit };
      
      const data = await graphqlRequest(HARDCOVER_API_URL, GET_OWNED_BOOKS_QUERY, variables, {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      });

      if (!data.lists || !Array.isArray(data.lists) || data.lists.length === 0) {
        return reply.status(404).send({
          error: 'Owned list not found',
          message: `No "Owned" list found for user ID: ${userID}`
        });
      }

      // Get the owned list (first time we fetch it)
      if (!ownedList) {
        ownedList = data.lists[0];
      }

      const currentPageBooks = ownedList.list_books.map(lb => lb.book);
      allBooks.push(...currentPageBooks);

      // If we got fewer books than the limit, we've reached the end
      if (currentPageBooks.length < limit) {
        break;
      }

      offset += limit;
    }

    return {
      success: true,
      list: {
        id: ownedList.id,
        name: ownedList.name
      },
      books: allBooks,
      count: allBooks.length
    };

  } catch (error) {
    fastify.log.error('Error fetching owned books:', error);
    
    // Handle GraphQL errors
    if (error.response && error.response.errors) {
      return reply.status(400).send({
        error: 'GraphQL API error',
        message: 'Error from Hardcover API',
        details: error.response.errors
      });
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      return reply.status(401).send({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch owned books',
      details: error.message
    });
  }
});

fastify.get('/api/user', async (request, reply) => {
  const { token } = request.query;
  
  // Use environment variable if no token provided (for local development)
  const authToken = token || process.env.HARDCOVER_TOKEN;
  
  if (!authToken) {
    return reply.status(400).send({
      error: 'User token is required',
      message: 'Please provide a token parameter or set HARDCOVER_TOKEN environment variable'
    });
  }

  try {
    const data = await graphqlRequest(HARDCOVER_API_URL, GET_USER_QUERY, {}, {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });

    if (!data.me) {
      return reply.status(404).send({
        error: 'User not found',
        message: 'No user information found for this token'
      });
    }

    return {
      success: true,
      user: data.me[0]
    };

  } catch (error) {
    fastify.log.error('Error fetching user information:', error);
    
    // Handle GraphQL errors
    if (error.response && error.response.errors) {
      return reply.status(400).send({
        error: 'GraphQL API error',
        message: 'Error from Hardcover API',
        details: error.response.errors
      });
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      return reply.status(401).send({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch user information',
      details: error.message
    });
  }
});

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
