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

      if (!data.user_books || !Array.isArray(data.user_books)) {
        return reply.status(404).send({
          error: 'No books found',
          message: `No books found for user ID: ${userID}`
        });
      }

      allBooks.push(...data.user_books);

      // If we got fewer books than the limit, we've reached the end
      if (data.user_books.length < limit) {
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
const GET_LIST_BOOKS_QUERY = gql`
  query GetOwnedBooks($userID: Int!, $offset: Int!, $limit: Int!, $listName: String!) {
    list_books(where: {list: {name: {_eq: $listName}, user_id: {_eq: $userID}}}, offset: $offset, limit: $limit, order_by: { created_at: desc }) {
      book {
          id
          title
          book_series {
            featured
            series_id
            position
          }
        }
      edition {
        audio_seconds
        id
        edition_format
        edition_information
        pages
        physical_format
        physical_information
      }
    }
  }
`;

// GraphQL query to get all books for a specific user
const GET_USER_BOOKS_QUERY = gql`
  query GetUserBooks($userID: Int!, $offset: Int!, $limit: Int!) {
    user_books(where: {user_id: {_eq: $userID}}, offset: $offset, limit: $limit, order_by: { created_at: desc }) {
      review
      status_id
      reading_format {
        format
        id
      }
      rating
      edition {
        audio_seconds
        id
        edition_format
        edition_information
        pages
        physical_format
        physical_information
      }
      book {
        book_status {
          name
          id
        }
        id
        title
        slug
        book_series {
          featured
          series_id
          position
        }
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

// GraphQL query to get all lists for a specific user
const GET_USER_LISTS_QUERY = gql`
  query GetUserLists($userID: Int!) {
    lists(where: {user_id: {_eq: $userID}}) {
      id
      name
    }
  }
`;

// GraphQL query to get series information by series IDs
const GET_SERIES_QUERY = gql`
  query GetSeries($seriesIds: [Int!]!) {
    series(where: {id: {_in: $seriesIds}}) {
      id
      name
      books_count
      primary_books_count
      slug
      state
      is_completed
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

    // Fetch all pages until we have all books
    while (true) {
      const variables = { userID, offset, limit, listName: "Owned" };
      
      const data = await graphqlRequest(HARDCOVER_API_URL, GET_LIST_BOOKS_QUERY, variables, {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      });

      if (!data.list_books || !Array.isArray(data.list_books) || data.list_books.length === 0) {
        return reply.status(404).send({
          error: 'Owned list not found',
          message: `No "Owned" list found for user ID: ${userID}`
        });
      }

      // const currentPageBooks = ownedList.list_books.map(lb => lb.book);
      allBooks.push(...data.list_books);

      // If we got fewer books than the limit, we've reached the end
      if (data.list_books.length < limit) {
        break;
      }

      offset += limit;
    }

    return {
      success: true,
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

fastify.get('/api/tbrbooks', async (request, reply) => {
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
    // First, fetch all user lists
    const listsData = await graphqlRequest(HARDCOVER_API_URL, GET_USER_LISTS_QUERY, { userID }, {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });

    if (!listsData.lists || !Array.isArray(listsData.lists)) {
      return reply.status(404).send({
        error: 'No lists found',
        message: `No lists found for user ID: ${userID}`
      });
    }

    // Filter lists that start with "TBR:"
    const tbrLists = listsData.lists.filter(list => list.name.startsWith('TBR:'));

    if (tbrLists.length === 0) {
      return {
        success: true,
        tbr_lists: [],
        message: 'No TBR lists found'
      };
    }

    // Fetch books for each TBR list
    const tbrBooksData = {};
    
    for (const tbrList of tbrLists) {
      let offset = 0;
      const limit = 100;

      // Fetch all pages for this list
      while (true) {
        const variables = { userID, offset, limit, listName: tbrList.name };
        
        const listBooksData = await graphqlRequest(HARDCOVER_API_URL, GET_LIST_BOOKS_QUERY, variables, {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        });

        if (listBooksData.list_books && Array.isArray(listBooksData.list_books)) {
          for (const book of listBooksData.list_books) {
            if (!tbrBooksData[book.book.id]) {
              tbrBooksData[book.book.id] = [];
            }
            tbrBooksData[book.book.id].push(tbrList.name);
          }
        }

        // If we got fewer books than the limit, we've reached the end
        if (!listBooksData.list_books || listBooksData.list_books.length < limit) {
          break;
        }

        offset += limit;
      }

    }

    return {
      success: true,
      tbr_lists: tbrBooksData
    };

  } catch (error) {
    fastify.log.error('Error fetching TBR books:', error);
    
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
      message: 'Failed to fetch TBR books',
      details: error.message
    });
  }
});

fastify.get('/api/seriesstatus', async (request, reply) => {
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
    // First, fetch all user lists
    const listsData = await graphqlRequest(HARDCOVER_API_URL, GET_USER_LISTS_QUERY, { userID }, {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });

    if (!listsData.lists || !Array.isArray(listsData.lists)) {
      return reply.status(404).send({
        error: 'No lists found',
        message: `No lists found for user ID: ${userID}`
      });
    }

    // Filter lists that start with "series: "
    const seriesLists = listsData.lists.filter(list => list.name.toLowerCase().startsWith('series: '));

    if (seriesLists.length === 0) {
      return {
        success: true,
        series_lists: {},
        message: 'No series lists found'
      };
    }

    // Fetch books for each series list and extract series IDs
    const seriesStatusData = {};
    
    for (const seriesList of seriesLists) {
      let offset = 0;
      const limit = 100;
      const seriesIds = new Set();

      // Fetch all pages for this list
      while (true) {
        const variables = { userID, offset, limit, listName: seriesList.name };
        
        const listBooksData = await graphqlRequest(HARDCOVER_API_URL, GET_LIST_BOOKS_QUERY, variables, {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        });

        if (listBooksData.list_books && Array.isArray(listBooksData.list_books)) {
          for (const book of listBooksData.list_books) {
            if (book.book.book_series && Array.isArray(book.book.book_series)) {
              for (const bookSeries of book.book.book_series) {
                if (bookSeries.series_id) {
                  seriesIds.add(bookSeries.series_id);
                }
              }
            }
          }
        }

        // If we got fewer books than the limit, we've reached the end
        if (!listBooksData.list_books || listBooksData.list_books.length < limit) {
          break;
        }

        offset += limit;
      }

      // Convert Set to Array for JSON serialization and remove "series: " prefix from list name
      const cleanListName = seriesList.name.replace(/^series:\s*/i, '');
      seriesStatusData[cleanListName] = Array.from(seriesIds);
    }

    return {
      success: true,
      series_status: seriesStatusData
    };

  } catch (error) {
    fastify.log.error('Error fetching series status:', error);
    
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
      message: 'Failed to fetch series status',
      details: error.message
    });
  }
});

fastify.post('/api/series', async (request, reply) => {
  const { token, seriesIds } = request.body;
  
  // Use environment variable if no token provided (for local development)
  const authToken = token || process.env.HARDCOVER_TOKEN;
  
  if (!authToken) {
    return reply.status(400).send({
      error: 'User token is required',
      message: 'Please provide a token in the request body or set HARDCOVER_TOKEN environment variable'
    });
  }

  if (!seriesIds || !Array.isArray(seriesIds) || seriesIds.length === 0) {
    return reply.status(400).send({
      error: 'Series IDs are required',
      message: 'Please provide an array of series IDs in the request body'
    });
  }

  // Validate that all series IDs are numbers
  const invalidIds = seriesIds.filter(id => typeof id !== 'number' || id <= 0);
  if (invalidIds.length > 0) {
    return reply.status(400).send({
      error: 'Invalid series IDs',
      message: 'All series IDs must be positive numbers',
      invalidIds
    });
  }

  try {
    const variables = { seriesIds };
    
    const data = await graphqlRequest(HARDCOVER_API_URL, GET_SERIES_QUERY, variables, {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });

    if (!data.series || !Array.isArray(data.series)) {
      return reply.status(404).send({
        error: 'No series found',
        message: `No series found for the provided IDs: ${seriesIds.join(', ')}`
      });
    }

    // Check if any requested series IDs were not found
    const foundIds = data.series.map(series => series.id);
    const notFoundIds = seriesIds.filter(id => !foundIds.includes(id));
    
    const response = {
      success: true,
      series: data.series,
      count: data.series.length
    };

    // Add warning if some series were not found
    if (notFoundIds.length > 0) {
      response.warning = `Some series IDs were not found: ${notFoundIds.join(', ')}`;
    }

    return response;

  } catch (error) {
    fastify.log.error('Error fetching series information:', error);
    
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
      message: 'Failed to fetch series information',
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
